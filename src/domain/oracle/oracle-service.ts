import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { prisma } from "../../shared/services/db.ts";
import { toPrismaExternalFailure } from "../../shared/services/prisma-failure.ts";
import { settleAsync } from "../../shared/utils/async-result.ts";
import { ProviderRegistry } from "../ai/providers/provider-registry.ts";
import type {
  OracleEmptyState,
  OracleFatalErrorState,
  OracleMode,
  OracleOutcome,
  OraclePageContext,
  OracleRequest,
  OracleRetryableErrorState,
  OracleSuccessState,
  OracleUnauthorizedState,
} from "./oracle-types.ts";

const logger = createLogger("oracle.service");

/**
 * Oracle service contract.
 */
export interface OracleService {
  readonly evaluate: (request: OracleRequest) => Promise<OracleOutcome>;
}

interface OracleAnswer {
  readonly ok: true;
  readonly text: string;
}

interface OracleAnswerFailure {
  readonly ok: false;
  readonly retryable: boolean;
  readonly message: string;
}

/**
 * Creates the oracle service.
 * Uses the shared AI provider registry for generation and sentiment routing.
 */
export const createOracleService = (): OracleService => ({
  evaluate: async (request) => {
    if (appConfig.oracle.responseDelayMs > 0) {
      await Bun.sleep(appConfig.oracle.responseDelayMs);
    }

    const messages = getMessages(request.locale);
    const trimmedQuestion = request.question.trim();

    const forcedOutcome = resolveForcedMode(request.mode, messages.aiPlayground);
    if (forcedOutcome) return forcedOutcome;

    if (appConfig.oracle.requireSession && !request.hasSession) {
      return {
        state: "unauthorized",
        message: messages.aiPlayground.unauthorizedDescription,
      } satisfies OracleUnauthorizedState;
    }

    if (trimmedQuestion.length === 0) {
      return {
        state: "empty",
        message: messages.aiPlayground.emptyDescription,
      } satisfies OracleEmptyState;
    }

    if (trimmedQuestion.length > appConfig.oracle.maxQuestionLength) {
      return {
        state: "error",
        retryable: false,
        message: messages.aiPlayground.validationTooLong,
      } satisfies OracleFatalErrorState;
    }

    const answer = await buildAnswer(trimmedQuestion, messages, request.pageContext);
    if (!answer.ok) {
      return {
        state: "error",
        retryable: answer.retryable,
        message: answer.message,
      } satisfies OracleRetryableErrorState | OracleFatalErrorState;
    }

    const persistence = await settleAsync(persistInteraction(trimmedQuestion, answer.text));
    if (!persistence.ok) {
      const failure = toPrismaExternalFailure(persistence.error, "record oracle interaction");
      logger.warn("oracle.persist.failed", {
        code: failure.code,
        retryable: failure.retryable,
        message: failure.message,
      });
    }

    return {
      state: "success",
      answer: answer.text,
    } satisfies OracleSuccessState;
  },
});

// ── Answer generation ────────────────────────────────────────────────────────

/**
 * Attempts provider-routed AI generation and reports explicit unavailable/error states when it
 * cannot complete.
 */
const buildAnswer = async (
  question: string,
  messages: ReturnType<typeof getMessages>,
  pageContext?: OraclePageContext,
): Promise<OracleAnswer | OracleAnswerFailure> => {
  const registry = await settleAsync(ProviderRegistry.getInstance());
  if (!registry.ok) {
    return {
      ok: false,
      retryable: true,
      message: messages.aiPlayground.networkErrorDescription,
    };
  }

  const provider = registry.value.selectProvider("chat");
  if (!provider) {
    return {
      ok: false,
      retryable: false,
      message: messages.ai.noProviderAvailable,
    };
  }

  const contextHint = pageContext
    ? ` [Context: user is on ${pageContext.activeRoute}${pageContext.projectId ? `, project ${pageContext.projectId}` : ""}]`
    : "";
  const userPrompt = `Respond creatively and helpfully to this game design prompt: "${question}"${contextHint}`;

  const generation = await registry.value.chat({
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.85,
    maxTokens: 80,
  });

  if (generation.ok && generation.text.trim().length > 0) {
    return {
      ok: true,
      text: generation.text.trim(),
    };
  }

  return {
    ok: false,
    retryable: generation.ok ? false : generation.retryable,
    message: generation.ok
      ? messages.aiPlayground.nonRetryableErrorDescription
      : generation.retryable
        ? messages.aiPlayground.retryableErrorDescription
        : messages.aiPlayground.nonRetryableErrorDescription,
  };
};

/**
 * Persists the interaction with provider-routed sentiment classification.
 */
const persistInteraction = async (
  prompt: string,
  fortune: string,
  sentimentOverride?: string,
): Promise<void> => {
  const registry = await settleAsync(ProviderRegistry.getInstance());
  const sentimentResult =
    registry.ok && sentimentOverride === undefined
      ? await settleAsync(registry.value.classify(prompt))
      : null;
  const sentiment =
    sentimentOverride ?? (sentimentResult?.ok ? sentimentResult.value?.label : null) ?? "UNKNOWN";

  await prisma.oracleInteraction.recordWithSentiment(prompt, sentiment, fortune);
};

// ── Forced mode helpers ───────────────────────────────────────────────────────

const resolveForcedMode = (
  mode: OracleMode,
  oracleMessages: ReturnType<typeof getMessages>["aiPlayground"],
): OracleOutcome | null => {
  if (mode === "force-empty") {
    return { state: "empty", message: oracleMessages.emptyDescription } satisfies OracleEmptyState;
  }
  if (mode === "force-retryable-error") {
    return {
      state: "error",
      retryable: true,
      message: oracleMessages.retryableErrorDescription,
    } satisfies OracleRetryableErrorState;
  }
  if (mode === "force-fatal-error") {
    return {
      state: "error",
      retryable: false,
      message: oracleMessages.nonRetryableErrorDescription,
    } satisfies OracleFatalErrorState;
  }
  if (mode === "force-unauthorized") {
    return {
      state: "unauthorized",
      message: oracleMessages.unauthorizedDescription,
    } satisfies OracleUnauthorizedState;
  }
  return null;
};
