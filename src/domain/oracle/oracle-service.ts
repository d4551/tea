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
  readonly text: string;
  readonly source: "ai" | "fallback";
}

/**
 * Creates the oracle service.
 * Uses the shared AI provider registry for generation and sentiment routing.
 * Falls back to deterministic hash-based answers if providers are unavailable.
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

    const answer = await buildAnswer(trimmedQuestion, messages);

    const persistence = await settleAsync(
      persistInteraction(
        trimmedQuestion,
        answer.text,
        answer.source === "fallback" ? "UNKNOWN" : undefined,
      ),
    );
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
 * Attempts provider-routed AI generation; falls back to deterministic hash if generation is
 * unavailable.
 */
const buildAnswer = async (
  question: string,
  messages: ReturnType<typeof getMessages>,
): Promise<OracleAnswer> => {
  const registry = await settleAsync(ProviderRegistry.getInstance());
  if (!registry.ok) {
    return {
      text: buildDeterministicAnswer(question, messages),
      source: "fallback",
    };
  }

  const provider = registry.value.selectProvider("chat");
  if (!provider || provider.name === "transformers") {
    return {
      text: buildDeterministicAnswer(question, messages),
      source: "fallback",
    };
  }

  const generation = await registry.value.chat({
    messages: [
      {
        role: "user",
        content: `Respond creatively and helpfully to this game design prompt: "${question}"`,
      },
    ],
    temperature: 0.85,
    maxTokens: 80,
  });

  if (generation.ok && generation.text.trim().length > 0) {
    return {
      text: generation.text.trim(),
      source: "ai",
    };
  }

  return {
    text: buildDeterministicAnswer(question, messages),
    source: "fallback",
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

// ── Deterministic fallback ────────────────────────────────────────────────────

const buildDeterministicAnswer = (
  _question: string,
  messages: ReturnType<typeof getMessages>,
): string => {
  return messages.ai.fallbackDialogue;
};
