import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { prisma } from "../../shared/services/db.ts";
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

    const forcedOutcome = resolveForcedMode(request.mode, messages.oracle);
    if (forcedOutcome) return forcedOutcome;

    if (appConfig.oracle.requireSession && !request.hasSession) {
      return {
        state: "unauthorized",
        message: messages.oracle.unauthorizedDescription,
      } satisfies OracleUnauthorizedState;
    }

    if (trimmedQuestion.length === 0) {
      return {
        state: "empty",
        message: messages.oracle.emptyDescription,
      } satisfies OracleEmptyState;
    }

    if (trimmedQuestion.length > appConfig.oracle.maxQuestionLength) {
      return {
        state: "error",
        retryable: false,
        message: messages.oracle.validationTooLong,
      } satisfies OracleFatalErrorState;
    }

    const answer = await buildAnswer(trimmedQuestion, messages.oracle);

    // Persist interaction with real sentiment from the AI model
    await persistInteraction(
      trimmedQuestion,
      answer.text,
      answer.source === "fallback" ? "UNKNOWN" : undefined,
    ).catch((err) => logger.error("oracle.persist.failed", { err: String(err) }));

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
  oracleMessages: ReturnType<typeof getMessages>["oracle"],
): Promise<OracleAnswer> => {
  const registry = await ProviderRegistry.getInstance();
  const generation = await registry.chat({
    messages: [
      {
        role: "user",
        content: `The Tea Oracle speaks of "${question}":`,
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
    text: buildDeterministicAnswer(question, oracleMessages),
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
  const sentiment =
    sentimentOverride ??
    (await ProviderRegistry.getInstance().then((registry) => registry.classify(prompt)))?.label ??
    "UNKNOWN";

  await prisma.oracleInteraction.recordWithSentiment(prompt, sentiment, fortune);
};

// ── Forced mode helpers ───────────────────────────────────────────────────────

const resolveForcedMode = (
  mode: OracleMode,
  oracleMessages: ReturnType<typeof getMessages>["oracle"],
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
  question: string,
  oracleMessages: ReturnType<typeof getMessages>["oracle"],
): string => {
  const hash = Array.from(question).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const prefix = oracleMessages.fortunePrefixes[hash % oracleMessages.fortunePrefixes.length];
  const body =
    oracleMessages.fortuneBodies[
      (hash * appConfig.oracle.answerHashMultiplier) % oracleMessages.fortuneBodies.length
    ];
  return `${prefix} ${body}`;
};
