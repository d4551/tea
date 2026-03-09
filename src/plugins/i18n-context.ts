import { Elysia } from "elysia";
import type { RequestI18nContext } from "../shared/i18n/translator.ts";
import { resolveRequestI18n, resolveRequestI18nWithOverride } from "../shared/i18n/translator.ts";

const getLocaleOverride = (request: Request): string | undefined => {
  const fromHeader = request.headers.get("x-locale") ?? request.headers.get("content-language");
  if (!fromHeader) {
    return undefined;
  }

  const normalized = fromHeader.trim();
  return normalized.length > 0 ? normalized : undefined;
};

/**
 * Route-local locale and message context derived from query + Accept-Language.
 */
const buildRequestI18nContext = (request: Request): RequestI18nContext => {
  const localeOverride = getLocaleOverride(request);
  return localeOverride
    ? resolveRequestI18nWithOverride(request, localeOverride)
    : resolveRequestI18n(request);
};

/**
 * Elysia plugin that derives locale and localized message catalog per request.
 */
export const i18nContextPlugin = new Elysia({ name: "i18n-context" }).derive(
  { as: "scoped" },
  ({ request }) => {
    const i18n = buildRequestI18nContext(request);
    return {
      locale: i18n.locale,
      messages: i18n.messages,
      localeConfig: i18n.localeConfig,
    };
  },
);
