import type { OracleMode } from "../domain/oracle/oracle-types.ts";
import { defaultOracleMode, oracleModes } from "../shared/constants/oracle.ts";

/**
 * Parses oracle mode from query or body values.
 *
 * @param modeValue Untrusted incoming mode value.
 * @returns Safe oracle mode.
 */
export const parseOracleMode = (
  modeValue: OracleMode | string | number | boolean | undefined,
): OracleMode => {
  if (!modeValue) {
    return defaultOracleMode;
  }

  if (typeof modeValue !== "string") {
    return defaultOracleMode;
  }

  const matched = oracleModes.find((mode) => mode === modeValue);
  return matched ?? defaultOracleMode;
};
