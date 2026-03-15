import { Elysia, t } from "elysia";
import type { OracleService } from "../domain/oracle/oracle-service.ts";
import { authSessionContextPlugin, authSessionGuard } from "../plugins/auth-session.ts";
import { i18nContextPlugin } from "../plugins/i18n-context.ts";
import { defaultOracleMode } from "../shared/constants/oracle.ts";
import { appRoutes, resolveRequestPathWithQuery } from "../shared/constants/routes.ts";
import type { LayoutContext } from "../views/layout.ts";
import { type OraclePanelState, renderOraclePanel, toOraclePanelState } from "../views/oracle.ts";
import { renderHomePage } from "../views/pages.ts";
import { parseOracleMode } from "./oracle-input.ts";

const createRouteLayoutContext = (
  request: Request,
  locale: LayoutContext["locale"],
  messages: LayoutContext["messages"],
  activeRoute: "home",
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
  context_path: t.Optional(t.String()),
  context_route: t.Optional(t.String()),
  context_project: t.Optional(t.String()),
});

/**
 * Creates server-rendered page routes.
 *
 * @param oracleService Oracle domain service.
 * @returns Elysia route group.
 */
export const createPageRoutes = (oracleService: OracleService) =>
  new Elysia({ name: "page-routes" })
    .use(i18nContextPlugin)
    .use(authSessionContextPlugin)
    .guard(authSessionGuard, (app) =>
      app
        .get(
          appRoutes.home,
          async ({ query, request, locale, messages, authHasSession }) => {
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
                hasSession: authHasSession,
              });

              oraclePanelState = toOraclePanelState(outcome, mode, question);
            }

            return renderHomePage({
              layout: {
                ...createRouteLayoutContext(request, locale, messages, "home"),
                oraclePanelState,
              },
            });
          },
          {
            query: oracleQuerySchema,
          },
        )
        .get(
          appRoutes.aiPlaygroundPartial,
          async ({ query, locale, messages, authHasSession }) => {
            const mode = parseOracleMode(query.mode);
            const question = query.question ?? "";
            const pageContext =
              query.context_path && query.context_route
                ? {
                    currentPath: query.context_path,
                    activeRoute: query.context_route,
                    projectId: query.context_project,
                  }
                : undefined;

            const outcome = await oracleService.evaluate({
              locale,
              mode,
              question,
              hasSession: authHasSession,
              pageContext,
            });

            const panelState: OraclePanelState = toOraclePanelState(outcome, mode, question);

            return renderOraclePanel(messages, panelState);
          },
          {
            query: oracleQuerySchema,
          },
        ),
    );
