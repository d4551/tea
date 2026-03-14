/**
 * Shared builder display and identifier helpers used to separate creator-facing
 * labels from internal stable ids and config keys.
 */

const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, " ");

const looksLikeResourceKey = (value: string): boolean => {
  const normalized = normalizeWhitespace(value);
  return normalized.includes(".") && !normalized.includes(" ");
};

const capitalize = (value: string): string =>
  value.length === 0 ? value : `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;

const sanitizeStableBuilderIdentifier = (value: string): string =>
  normalizeWhitespace(value)
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9._-]/g, "");

/**
 * Builds the canonical internal resource key for a scene title.
 *
 * @param sceneId Stable scene identifier.
 * @returns Scene title resource key.
 */
export const buildSceneTitleResourceKey = (sceneId: string): string =>
  `scene.${sanitizeStableBuilderIdentifier(sceneId)}.title`;

/**
 * Builds the canonical internal resource key for an NPC display label.
 *
 * @param characterKey Stable NPC identifier.
 * @returns NPC label resource key.
 */
export const buildNpcLabelResourceKey = (characterKey: string): string =>
  `npc.${sanitizeStableBuilderIdentifier(characterKey)}.label`;

/**
 * Builds the canonical internal resource key for an NPC greeting line.
 *
 * @param characterKey Stable NPC identifier.
 * @returns NPC greeting resource key.
 */
export const buildNpcGreetingResourceKey = (characterKey: string): string =>
  `npc.${sanitizeStableBuilderIdentifier(characterKey)}.greet`;

/**
 * Converts a builder id or compact key into a readable label.
 *
 * @param value Raw builder id, key, or label candidate.
 * @returns Human-readable label.
 */
export const humanizeBuilderIdentifier = (value: string): string =>
  normalizeWhitespace(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

/**
 * Normalizes creator-entered names into a stable builder identifier.
 *
 * @param value Creator-entered text or explicit id.
 * @returns Lower-camel builder identifier or an empty string when no valid id can be derived.
 */
export const normalizeBuilderIdentifier = (value: string): string => {
  const segments = normalizeWhitespace(value)
    .replace(/['"]/g, "")
    .split(/[^A-Za-z0-9]+/g)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.toLowerCase());

  if (segments.length === 0) {
    return "";
  }

  const [head, ...tail] = segments;
  return `${head}${tail.map(capitalize).join("")}`;
};

/**
 * Resolves the creator-facing label for a builder entity when the persisted field
 * may still hold an internal key.
 *
 * @param resolvedText Text returned by runtime localization lookup.
 * @param persistedValue Stored builder value, which may be a key or direct label.
 * @param fallbackIdentifier Stable id used when the persisted value is still an internal key.
 * @returns Creator-facing label safe for headings, forms, and navigation.
 */
export const resolveCreatorFacingText = (
  resolvedText: string,
  persistedValue: string,
  fallbackIdentifier: string,
): string => {
  const localized = normalizeWhitespace(resolvedText);
  const persisted = normalizeWhitespace(persistedValue);

  if (localized.length > 0 && localized !== persisted) {
    return localized;
  }

  if (persisted.length === 0) {
    return humanizeBuilderIdentifier(fallbackIdentifier);
  }

  if (looksLikeResourceKey(persisted)) {
    return humanizeBuilderIdentifier(fallbackIdentifier);
  }

  return persisted.includes(" ") ? persisted : humanizeBuilderIdentifier(persisted);
};

/**
 * Derives canonical scene id and persisted title value from creator-facing inputs.
 *
 * @param input Creator-facing create or update input.
 * @returns Derived stable scene id and persisted title value.
 */
export const deriveSceneIdentity = (input: {
  readonly id?: string;
  readonly displayTitle?: string;
  readonly titleKey?: string;
}): {
  readonly id: string;
  readonly titleKey: string;
} => {
  const explicitId = sanitizeStableBuilderIdentifier(input.id ?? "");
  const displayTitle = normalizeWhitespace(input.displayTitle ?? "");
  const persistedTitle = normalizeWhitespace(input.titleKey ?? "");
  const derivedId = explicitId.length > 0 ? explicitId : normalizeBuilderIdentifier(displayTitle);
  const nextTitleKey =
    persistedTitle.length > 0 ? persistedTitle : buildSceneTitleResourceKey(derivedId);

  return {
    id: derivedId,
    titleKey: nextTitleKey,
  };
};

/**
 * Derives canonical NPC id and persisted display fields from creator-facing inputs.
 *
 * @param input Creator-facing create or update input.
 * @returns Derived stable NPC id, persisted display label, and default greeting key.
 */
export const deriveNpcIdentity = (input: {
  readonly characterKey?: string;
  readonly displayName?: string;
  readonly labelKey?: string;
}): {
  readonly characterKey: string;
  readonly labelKey: string;
  readonly greetLineKey: string;
} => {
  const explicitId = sanitizeStableBuilderIdentifier(input.characterKey ?? "");
  const displayName = normalizeWhitespace(input.displayName ?? "");
  const persistedLabel = normalizeWhitespace(input.labelKey ?? "");
  const characterKey = explicitId.length > 0 ? explicitId : normalizeBuilderIdentifier(displayName);
  const labelKey =
    persistedLabel.length > 0 ? persistedLabel : buildNpcLabelResourceKey(characterKey);

  return {
    characterKey,
    labelKey,
    greetLineKey: buildNpcGreetingResourceKey(characterKey),
  };
};
