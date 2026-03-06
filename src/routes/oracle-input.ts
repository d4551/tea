import { appConfig } from "../config/environment.ts";
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

/**
 * Converts optional cookie header into a lightweight authenticated flag.
 *
 * @param cookieHeader Raw Cookie header.
 * @returns Session flag.
 */
export const hasSessionCookie = (cookieHeader: string | null): boolean => {
  if (!cookieHeader) {
    return false;
  }

  const sessionCookiePair = `${appConfig.auth.sessionCookieName}=${appConfig.auth.sessionCookieValue}`;
  return cookieHeader.split(";").some((cookiePart) => cookiePart.trim() === sessionCookiePair);
};
