export const supportedLocaleCodes = ["en-US", "zh-CN"] as const;

export type LocaleCode = (typeof supportedLocaleCodes)[number];

/** Default locale for fallback when requested locale is unavailable. */
export const defaultLocaleCode: LocaleCode = supportedLocaleCodes[0];
