import { Elysia } from "elysia";
import { resolveRequestI18n } from "../shared/i18n/translator.ts";

/**
 * Elysia plugin that derives locale and localized message catalog per request.
 */
export const i18nContextPlugin = new Elysia({ name: "i18n-context" }).derive(
  { as: "scoped" },
  ({ request }) => {
    const i18n = resolveRequestI18n(request);
    return {
      locale: i18n.locale,
      messages: i18n.messages,
    };
  },
);
