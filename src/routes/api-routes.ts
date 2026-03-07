import { Elysia, t } from "elysia";
import type { OracleService } from "../domain/oracle/oracle-service.ts";
import { ApplicationError, errorEnvelope, successEnvelope } from "../lib/error-envelope.ts";
import { authSessionContextPlugin, authSessionGuard } from "../plugins/auth-session.ts";
import { i18nContextPlugin } from "../plugins/i18n-context.ts";
import { requestScopedContextPlugin } from "../plugins/request-context.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { oracleModes } from "../shared/constants/oracle.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import { resolveRequestI18nWithOverride } from "../shared/i18n/translator.ts";
import { parseOracleMode } from "./oracle-input.ts";

const serverStartNs = Bun.nanoseconds();

const oracleBodySchema = t.Object({
  question: t.String(),
  lang: t.Optional(t.String()),
  mode: t.Optional(t.UnionEnum(oracleModes)),
});

const healthResponseSchema = t.Object({
  status: t.Literal("ok"),
  uptimeSeconds: t.Number(),
  timestamp: t.String(),
});

const oracleSuccessEnvelopeSchema = t.Object({
  ok: t.Literal(true),
  data: t.Object({
    state: t.Literal("success"),
    answer: t.String(),
  }),
});

const oracleErrorEnvelopeSchema = t.Object({
  ok: t.Literal(false),
  error: t.Object({
    code: t.String(),
    message: t.String(),
    retryable: t.Boolean(),
    correlationId: t.String(),
  }),
});

const createHealthRoutes = () =>
  new Elysia({ name: "api-health-routes" }).use(i18nContextPlugin).get(
    appRoutes.healthApi,
    ({ messages }) => {
      const healthMessage = messages.api.healthOk;

      return successEnvelope({
        status: "ok",
        message: healthMessage,
        uptimeSeconds: Number(((Bun.nanoseconds() - serverStartNs) / 1e9).toFixed(2)),
        timestamp: new Date().toISOString(),
      });
    },
    {
      detail: {
        tags: ["system"],
      },
      response: t.Object({
        ok: t.Literal(true),
        data: t.Intersect([
          healthResponseSchema,
          t.Object({
            message: t.String(),
          }),
        ]),
      }),
    },
  );

const createOracleRoutes = (oracleService: OracleService) =>
  new Elysia({ name: "api-oracle-routes" })
    .use(i18nContextPlugin)
    .use(requestScopedContextPlugin)
    .use(authSessionContextPlugin)
    .guard(authSessionGuard, (app) =>
      app.post(
        appRoutes.oracleApi,
        async ({ body, request, status, authHasSession, correlationId }) => {
          const { locale } = resolveRequestI18nWithOverride(request, body.lang);
          const mode = parseOracleMode(body.mode);
          const outcome = await oracleService.evaluate({
            question: body.question,
            locale,
            mode,
            hasSession: authHasSession,
          });

          if (outcome.state === "success") {
            return status(
              httpStatus.ok,
              successEnvelope({
                state: "success",
                answer: outcome.answer,
              }),
            );
          }

          if (outcome.state === "empty") {
            const appError = new ApplicationError(
              "VALIDATION_ERROR",
              outcome.message,
              httpStatus.badRequest,
              false,
            );
            return status(httpStatus.badRequest, errorEnvelope(appError, correlationId));
          }

          if (outcome.state === "unauthorized") {
            const appError = new ApplicationError(
              "UNAUTHORIZED",
              outcome.message,
              httpStatus.unauthorized,
              false,
            );
            return status(httpStatus.unauthorized, errorEnvelope(appError, correlationId));
          }

          if (outcome.retryable) {
            const appError = new ApplicationError(
              "UPSTREAM_ERROR",
              outcome.message,
              httpStatus.serviceUnavailable,
              true,
            );
            return status(httpStatus.serviceUnavailable, errorEnvelope(appError, correlationId));
          }

          const appError = new ApplicationError(
            "VALIDATION_ERROR",
            outcome.message,
            httpStatus.unprocessableEntity,
            false,
          );
          return status(httpStatus.unprocessableEntity, errorEnvelope(appError, correlationId));
        },
        {
          body: oracleBodySchema,
          response: {
            [httpStatus.ok]: oracleSuccessEnvelopeSchema,
            [httpStatus.badRequest]: oracleErrorEnvelopeSchema,
            [httpStatus.unauthorized]: oracleErrorEnvelopeSchema,
            [httpStatus.unprocessableEntity]: oracleErrorEnvelopeSchema,
            [httpStatus.serviceUnavailable]: oracleErrorEnvelopeSchema,
          },
          detail: {
            tags: ["oracle"],
          },
        },
      ),
    );

/**
 * Creates JSON API routes with contract validation.
 *
 * @param oracleService Oracle domain service.
 * @returns Elysia route group.
 */
export const createApiRoutes = (oracleService: OracleService) =>
  new Elysia({ name: "api-routes" })
    .use(createHealthRoutes())
    .use(createOracleRoutes(oracleService));
