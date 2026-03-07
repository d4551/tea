import { appConfig, type LocaleCode, matchLocale } from "../../config/environment.ts";
import { resolveRequestQueryParam } from "../constants/routes.ts";
import { type Messages, messagesByLocale } from "./messages.ts";

interface WeightedLanguage {
  readonly language: string;
  readonly quality: number;
  readonly index: number;
}

/**
 * Splits and normalizes an Accept-Language header into ordered locale candidates.
 *
 * @param acceptLanguageHeader Raw Accept-Language header.
 * @returns Locale candidates in priority order.
 */
const parseAcceptLanguage = (acceptLanguageHeader: string | null): readonly string[] => {
  if (!acceptLanguageHeader) {
    return [];
  }

  return acceptLanguageHeader
    .split(",")
    .map((entry, index): WeightedLanguage | null => {
      const segments = entry.split(";").map((segment) => segment.trim());
      const language = segments[0] ?? "";

      if (language.length === 0) {
        return null;
      }

      const qualitySegment = segments.find((segment) => segment.toLowerCase().startsWith("q="));
      const qualityValue = qualitySegment?.split("=")[1];
      const parsedQuality = qualityValue ? Number.parseFloat(qualityValue) : 1;
      const normalizedQuality = Number.isFinite(parsedQuality) ? parsedQuality : 1;

      return {
        language,
        quality: Math.max(0, Math.min(1, normalizedQuality)),
        index,
      };
    })
    .filter((entry): entry is WeightedLanguage => entry !== null)
    .filter((entry) => entry.quality > 0)
    .sort((left, right) => {
      if (right.quality !== left.quality) {
        return right.quality - left.quality;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.language);
};

/**
 * Resolves locale using explicit query value and HTTP Accept-Language header.
 *
 * @param queryLocale Optional query locale value.
 * @param acceptLanguageHeader Raw Accept-Language header.
 * @returns Supported locale.
 */
export const resolveLocale = (
  queryLocale: string | undefined,
  acceptLanguageHeader: string | null,
): LocaleCode => {
  const queryMatch = matchLocale(queryLocale);
  if (queryMatch) {
    return queryMatch;
  }

  for (const candidate of parseAcceptLanguage(acceptLanguageHeader)) {
    const headerMatch = matchLocale(candidate);
    if (headerMatch) {
      return headerMatch;
    }
  }

  return appConfig.defaultLocale;
};

/**
 * Resolves locale directly from a request URL query and Accept-Language header.
 *
 * @param request Incoming request.
 * @returns Supported locale.
 */
export const resolveRequestLocale = (request: Request): LocaleCode => {
  const queryLocale = resolveRequestQueryParam(request, "lang");
  return resolveLocale(queryLocale, request.headers.get("accept-language"));
};

/**
 * Resolves locale from request with an optional high-priority override value.
 *
 * @param request Incoming request.
 * @param localeOverride Optional locale override (for example JSON body locale).
 * @returns Supported locale.
 */
export const resolveRequestLocaleWithOverride = (
  request: Request,
  localeOverride: string | undefined,
): LocaleCode => {
  const overrideMatch = matchLocale(localeOverride);
  if (overrideMatch) {
    return overrideMatch;
  }

  return resolveRequestLocale(request);
};

/**
 * Returns the locale-specific message catalog.
 *
 * @param locale Locale code.
 * @returns Localized messages.
 */
export const getMessages = (locale: LocaleCode): Messages => messagesByLocale[locale];

/**
 * Request-scoped i18n resolution result.
 */
export interface RequestI18nContext {
  readonly locale: LocaleCode;
  readonly messages: Messages;
}

/**
 * Resolves both locale and message catalog from request context.
 *
 * @param request Incoming request.
 * @returns Request i18n context.
 */
export const resolveRequestI18n = (request: Request): RequestI18nContext => {
  const locale = resolveRequestLocale(request);
  return {
    locale,
    messages: getMessages(locale),
  };
};

/**
 * Resolves both locale and message catalog from request context with an optional high-priority override.
 *
 * @param request Incoming request.
 * @param localeOverride Optional locale override.
 * @returns Request i18n context.
 */
export const resolveRequestI18nWithOverride = (
  request: Request,
  localeOverride: string | undefined,
): RequestI18nContext => {
  const locale = resolveRequestLocaleWithOverride(request, localeOverride);
  return {
    locale,
    messages: getMessages(locale),
  };
};
