import type { StarterProjectTemplateId } from "../../shared/contracts/game.ts";

/**
 * Stable source prefix used to persist starter-template provenance on projects.
 */
export const STARTER_PROJECT_SOURCE_PREFIX = "starter-template:";

/**
 * Ordered starter templates supported by the builder bootstrap flow.
 */
export const starterProjectTemplateIds: readonly StarterProjectTemplateId[] = [
  "blank",
  "tea-house-story",
  "2d-game",
  "3d-game",
];

/**
 * Recommended starter template shown as the default first-run selection.
 */
export const recommendedStarterProjectTemplateId: StarterProjectTemplateId = "blank";

/**
 * Converts one starter template identifier into a persisted project source marker.
 *
 * @param templateId Starter template identifier.
 * @returns Persisted project source value.
 */
export const toStarterProjectSource = (templateId: StarterProjectTemplateId): string =>
  `${STARTER_PROJECT_SOURCE_PREFIX}${templateId}`;

/**
 * Extracts the starter template identifier from a persisted project source marker.
 *
 * @param source Persisted project source marker.
 * @returns Starter template identifier or the recommended default.
 */
export const resolveStarterProjectTemplateId = (source: string): StarterProjectTemplateId => {
  const normalized = source.startsWith(STARTER_PROJECT_SOURCE_PREFIX)
    ? source.slice(STARTER_PROJECT_SOURCE_PREFIX.length)
    : "";

  return (
    starterProjectTemplateIds.find((templateId) => templateId === normalized) ??
    recommendedStarterProjectTemplateId
  );
};
