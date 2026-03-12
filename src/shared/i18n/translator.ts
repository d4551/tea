import {
  appConfig,
  type LocaleCode,
  matchLocale,
  supportedLocales,
} from "../../config/environment.ts";
import { resolveRequestQueryParam } from "../constants/routes.ts";
import type { LocaleConfig } from "../contracts/ui-state.ts";
import {
  type Messages,
  messagesByLocale,
  readMessageValue,
  type TranslatedMessageKey,
} from "./messages.ts";

type LocaleSource = "override" | "query" | "accept-language" | "default";

interface WeightedLanguage {
  readonly language: string;
  readonly quality: number;
  readonly index: number;
}

interface LocaleSelection {
  readonly locale: LocaleCode;
  readonly source: LocaleSource;
  readonly requestedLocale: string | null;
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

const resolveLocaleSelection = (
  queryLocale: string | undefined,
  acceptLanguageHeader: string | null,
): LocaleSelection => {
  const queryMatch = matchLocale(queryLocale);
  if (queryMatch) {
    return {
      locale: queryMatch,
      source: "query",
      requestedLocale: queryLocale?.trim() ?? null,
    };
  }

  for (const candidate of parseAcceptLanguage(acceptLanguageHeader)) {
    const headerMatch = matchLocale(candidate);
    if (headerMatch) {
      return {
        locale: headerMatch,
        source: "accept-language",
        requestedLocale: candidate,
      };
    }
  }

  return {
    locale: appConfig.defaultLocale,
    source: "default",
    requestedLocale: null,
  };
};

const resolveLocaleSelectionWithOverride = (
  queryLocale: string | undefined,
  localeOverride: string | undefined,
  acceptLanguageHeader: string | null,
): LocaleSelection => {
  const trimmedOverride = localeOverride?.trim();
  if (trimmedOverride) {
    const overrideMatch = matchLocale(trimmedOverride);
    if (overrideMatch) {
      return {
        locale: overrideMatch,
        source: "override",
        requestedLocale: trimmedOverride,
      };
    }
  }

  return resolveLocaleSelection(queryLocale, acceptLanguageHeader);
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
): LocaleCode => resolveLocaleSelection(queryLocale, acceptLanguageHeader).locale;

/**
 * Returns the locale-specific message catalog.
 *
 * @param locale Locale code.
 * @returns Localized messages.
 */
export const getMessages = (locale: LocaleCode): Messages => messagesByLocale[locale];

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
  const queryLocale = resolveRequestQueryParam(request, "lang");
  const selection = resolveLocaleSelectionWithOverride(
    queryLocale,
    localeOverride,
    request.headers.get("accept-language"),
  );
  return selection.locale;
};

const resolveLocaleConfig = (selection: LocaleSelection): LocaleConfig => ({
  locale: selection.locale,
  fallbackLocale: appConfig.defaultLocale,
  requestedLocale: selection.requestedLocale,
  supportedLocales,
  source:
    selection.source === "override"
      ? "override"
      : selection.source === "query"
        ? "query"
        : selection.source === "accept-language"
          ? "accept-language"
          : "default",
});

/**
 * Request-scoped i18n resolution result.
 */
export interface RequestI18nContext {
  /** Canonical locale resolved for this request. */
  readonly locale: LocaleCode;
  /** Message catalog for the resolved locale. */
  readonly messages: Messages;
  /** Structured locale negotiation metadata. */
  readonly localeConfig: LocaleConfig;
}

/**
 * Resolves both locale and message catalog from request context.
 *
 * @param request Incoming request.
 * @returns Request i18n context.
 */
export const resolveRequestI18n = (request: Request): RequestI18nContext => {
  const queryLocale = resolveRequestQueryParam(request, "lang");
  const selection = resolveLocaleSelection(queryLocale, request.headers.get("accept-language"));
  return {
    locale: selection.locale,
    messages: getMessages(selection.locale),
    localeConfig: resolveLocaleConfig(selection),
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
  const queryLocale = resolveRequestQueryParam(request, "lang");
  const selection = resolveLocaleSelectionWithOverride(
    queryLocale,
    localeOverride,
    request.headers.get("accept-language"),
  );

  return {
    locale: selection.locale,
    messages: getMessages(selection.locale),
    localeConfig: resolveLocaleConfig(selection),
  };
};

/**
 * Resolves a translated string by typed key with configurable fallback.
 *
 * @param messages Localized message catalog.
 * @param key Typed message key.
 * @param fallbackValue Optional fallback value.
 * @returns Localized string value.
 */
export const getTranslatedText = (
  messages: Messages,
  key: TranslatedMessageKey,
  fallbackValue?: string,
): string => {
  const keyPath = String(key);
  const value = readMessageValue(messages, keyPath);
  return typeof value === "string" ? value : (fallbackValue ?? keyPath);
};
