import type { OracleMode } from "../../domain/oracle/oracle-types.ts";

/**
 * Canonical default mode for oracle interactions.
 */
export const defaultOracleMode: OracleMode = "auto";

/**
 * Supported oracle mode values.
 */
export const oracleModes: readonly OracleMode[] = [
  "auto",
  "force-empty",
  "force-retryable-error",
  "force-fatal-error",
  "force-unauthorized",
];
