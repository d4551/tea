/**
 * One indexed search term and its frequency within a normalized text body.
 */
export interface KnowledgeSearchTerm {
  /** Lowercased normalized token used for lookup. */
  readonly term: string;
  /** Number of occurrences in the indexed text. */
  readonly occurrenceCount: number;
}

const trimNormalizedWhitespace = (value: string): string => value.replace(/\s+/gu, " ").trim();

/**
 * Normalizes a text body into a stable search index representation.
 *
 * @param value Raw source text.
 * @returns Lowercased alphanumeric search text with punctuation collapsed to spaces.
 */
export const normalizeKnowledgeSearchText = (value: string): string =>
  trimNormalizedWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s]+/gu, " ");

/**
 * Extracts unique search terms from a normalized text body.
 *
 * @param value Raw source text.
 * @returns Deduplicated lookup terms suitable for search candidate filtering.
 */
export const tokenizeKnowledgeSearchTerms = (value: string): readonly string[] =>
  Array.from(
    new Set(
      normalizeKnowledgeSearchText(value)
        .split(/\s+/u)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2),
    ),
  );

/**
 * Counts indexed search terms for persisted knowledge-chunk term rows.
 *
 * @param value Raw source text.
 * @returns Stable sorted term-frequency pairs.
 */
export const extractKnowledgeSearchTerms = (value: string): readonly KnowledgeSearchTerm[] => {
  const counts = new Map<string, number>();

  for (const term of normalizeKnowledgeSearchText(value)
    .split(/\s+/u)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 2)) {
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([term, occurrenceCount]) => ({
      term,
      occurrenceCount,
    }));
};
