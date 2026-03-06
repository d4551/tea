import { Elysia, t } from "elysia";
import type { OracleService } from "../domain/oracle/oracle-service.ts";
import { i18nContextPlugin } from "../plugins/i18n-context.ts";
import { defaultOracleMode } from "../shared/constants/oracle.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import { type OraclePanelState, renderOraclePanel } from "../views/oracle.ts";
import {
  renderDevelopmentPlanPage,
  renderHomePage,
  renderNarrativeBiblePage,
  renderPitchDeckPage,
} from "../views/pages.ts";
import { hasSessionCookie, parseOracleMode } from "./oracle-input.ts";

const oracleQuerySchema = t.Object({
  lang: t.Optional(t.String()),
  question: t.Optional(t.String()),
  mode: t.Optional(t.String()),
});

const localeQuerySchema = t.Object({
  lang: t.Optional(t.String()),
});

const resolveCurrentPathWithQuery = (request: Request): string => {
  const requestUrl = new URL(request.url);
  return `${requestUrl.pathname}${requestUrl.search}`;
};

/**
 * Creates server-rendered page routes.
 *
 * @param oracleService Oracle domain service.
 * @returns Elysia route group.
 */
export const createPageRoutes = (oracleService: OracleService) =>
  new Elysia({ name: "page-routes" })
    .use(i18nContextPlugin)
    .get(
      appRoutes.home,
      async ({ query, request, locale, messages }) => {
        const currentPathWithQuery = resolveCurrentPathWithQuery(request);
        const mode = parseOracleMode(query.mode);
        const question = query.question ?? "";
        const hasOracleInputs = query.question !== undefined || query.mode !== undefined;

        let oraclePanelState: OraclePanelState = {
          state: "idle",
          mode: defaultOracleMode,
          question: "",
        };

        if (hasOracleInputs) {
          const outcome = await oracleService.evaluate({
            locale,
            mode,
            question,
            hasSession: hasSessionCookie(request.headers.get("cookie")),
          });

          oraclePanelState = {
            ...outcome,
            mode,
            question,
          };
        }

        return renderHomePage({ locale, messages, currentPathWithQuery }, oraclePanelState);
      },
      {
        query: oracleQuerySchema,
      },
    )
    .get(
      appRoutes.pitchDeck,
      ({ request, locale, messages }) => {
        const currentPathWithQuery = resolveCurrentPathWithQuery(request);

        return renderPitchDeckPage({ locale, messages, currentPathWithQuery });
      },
      {
        query: localeQuerySchema,
      },
    )
    .get(
      appRoutes.narrativeBible,
      ({ request, locale, messages }) => {
        const currentPathWithQuery = resolveCurrentPathWithQuery(request);

        return renderNarrativeBiblePage({ locale, messages, currentPathWithQuery });
      },
      {
        query: localeQuerySchema,
      },
    )
    .get(
      appRoutes.developmentPlan,
      ({ request, locale, messages }) => {
        const currentPathWithQuery = resolveCurrentPathWithQuery(request);

        return renderDevelopmentPlanPage({ locale, messages, currentPathWithQuery });
      },
      {
        query: localeQuerySchema,
      },
    )
    .get(
      appRoutes.oraclePartial,
      async ({ query, request, locale, messages }) => {
        const mode = parseOracleMode(query.mode);
        const question = query.question ?? "";

        const outcome = await oracleService.evaluate({
          locale,
          mode,
          question,
          hasSession: hasSessionCookie(request.headers.get("cookie")),
        });

        const panelState: OraclePanelState = {
          ...outcome,
          mode,
          question,
        };

        return renderOraclePanel(messages, panelState);
      },
      {
        query: oracleQuerySchema,
      },
    );
