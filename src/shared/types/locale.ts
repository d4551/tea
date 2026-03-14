export const supportedLocaleCodes = ["en-US", "zh-CN"] as const;

export type LocaleCode = (typeof supportedLocaleCodes)[number];
