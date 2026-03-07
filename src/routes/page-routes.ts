import { Elysia, t } from "elysia";
import type { OracleService } from "../domain/oracle/oracle-service.ts";
import { authSessionGuard, resolveAuthSession } from "../plugins/auth-session.ts";
import { i18nContextPlugin } from "../plugins/i18n-context.ts";
import { defaultOracleMode } from "../shared/constants/oracle.ts";
import { appRoutes, resolveRequestPathWithQuery } from "../shared/constants/routes.ts";
import type { LayoutContext } from "../views/layout.ts";
import { type OraclePanelState, renderOraclePanel } from "../views/oracle.ts";
import {
  renderDevelopmentPlanPage,
  renderHomePage,
  renderNarrativeBiblePage,
  renderPitchDeckPage,
} from "../views/pages.ts";
import { parseOracleMode } from "./oracle-input.ts";

const createRouteLayoutContext = (
  request: Request,
  locale: LayoutContext["locale"],
  messages: LayoutContext["messages"],
  activeRoute: "home" | "pitchDeck" | "narrativeBible" | "developmentPlan",
): LayoutContext => ({
  locale,
  messages,
  activeRoute,
  currentPathWithQuery: resolveRequestPathWithQuery(request),
});

const oracleQuerySchema = t.Object({
  lang: t.Optional(t.String()),
  question: t.Optional(t.String()),
  mode: t.Optional(t.String()),
});

const localeQuerySchema = t.Object({
  lang: t.Optional(t.String()),
});

const createOraclePageRoutes = (oracleService: OracleService) =>
  new Elysia({ name: "page-oracle-routes" }).use(i18nContextPlugin).guard(authSessionGuard, (app) =>
    app
      .get(
        appRoutes.home,
        async ({ query, cookie, request, locale, messages }) => {
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
              hasSession: resolveAuthSession(cookie).hasSession,
            });

            oraclePanelState = {
              ...outcome,
              mode,
              question,
            };
          }

          return renderHomePage(
            {
              layout: createRouteLayoutContext(request, locale, messages, "home"),
            },
            oraclePanelState,
          );
        },
        {
          query: oracleQuerySchema,
        },
      )
      .get(
        appRoutes.oraclePartial,
        async ({ query, cookie, locale, messages }) => {
          const mode = parseOracleMode(query.mode);
          const question = query.question ?? "";

          const outcome = await oracleService.evaluate({
            locale,
            mode,
            question,
            hasSession: resolveAuthSession(cookie).hasSession,
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
      ),
  );

const createStaticPageRoutes = () =>
  new Elysia({ name: "page-static-routes" })
    .use(i18nContextPlugin)
    .get(
      appRoutes.pitchDeck,
      ({ request, locale, messages }) => {
        return renderPitchDeckPage({
          layout: createRouteLayoutContext(request, locale, messages, "pitchDeck"),
        });
      },
      {
        query: localeQuerySchema,
      },
    )
    .get(
      appRoutes.narrativeBible,
      ({ request, locale, messages }) => {
        return renderNarrativeBiblePage({
          layout: createRouteLayoutContext(request, locale, messages, "narrativeBible"),
        });
      },
      {
        query: localeQuerySchema,
      },
    )
    .get(
      appRoutes.developmentPlan,
      ({ request, locale, messages }) => {
        return renderDevelopmentPlanPage({
          layout: createRouteLayoutContext(request, locale, messages, "developmentPlan"),
        });
      },
      {
        query: localeQuerySchema,
      },
    );

/**
 * Creates server-rendered page routes.
 *
 * @param oracleService Oracle domain service.
 * @returns Elysia route group.
 */
export const createPageRoutes = (oracleService: OracleService) =>
  new Elysia({ name: "page-routes" })
    .use(createOraclePageRoutes(oracleService))
    .use(createStaticPageRoutes());
