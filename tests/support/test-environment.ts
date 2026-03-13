import { resolve } from "node:path";

export const testEnvDefaults = {
  databaseUrlKey: "DATABASE_URL",
  nodeEnvKey: "NODE_ENV",
  appOriginKey: "APP_ORIGIN",
  sessionResumeTokenSecretKey: "SESSION_RESUME_TOKEN_SECRET",
  aiLocalEmbeddingsEnabledKey: "AI_LOCAL_EMBEDDINGS_ENABLED",
  builderLocalAutomationOriginKey: "BUILDER_LOCAL_AUTOMATION_ORIGIN",
  testNodeEnv: "test",
  appOrigin: "http://127.0.0.1:3088",
  sessionResumeTokenSecret: "test-resume-token-secret",
  aiLocalEmbeddingsEnabled: "false",
  builderLocalAutomationOrigin: "http://127.0.0.1:1",
};

export const testPreloadConfig = (databaseUrl: string): Record<string, string> => {
  return {
    [testEnvDefaults.databaseUrlKey]: databaseUrl,
    [testEnvDefaults.nodeEnvKey]: testEnvDefaults.testNodeEnv,
    [testEnvDefaults.appOriginKey]: testEnvDefaults.appOrigin,
    [testEnvDefaults.sessionResumeTokenSecretKey]: testEnvDefaults.sessionResumeTokenSecret,
    [testEnvDefaults.aiLocalEmbeddingsEnabledKey]: testEnvDefaults.aiLocalEmbeddingsEnabled,
    [testEnvDefaults.builderLocalAutomationOriginKey]: testEnvDefaults.builderLocalAutomationOrigin,
  };
};

export const applyTestEnvironment = (values: Record<string, string>): void => {
  for (const [key, value] of Object.entries(values)) {
    Bun.env[key] = value;
  }
};

export const buildTestDatabaseUrl = (projectRoot: string, filename: string): string =>
  `file:${resolve(projectRoot, "prisma", filename)}`;
