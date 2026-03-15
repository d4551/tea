const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export type LinkTarget = "_blank" | "_self";

/**
 * Input metadata for rendering HTML link attributes.
 */
export interface LinkMetadataInput {
  readonly href?: string;
  readonly ariaLabel?: string;
  readonly id?: string;
  readonly linkLanguage?: string;
  readonly target?: LinkTarget;
  readonly rel?: string;
}

/**
 * Extended link metadata that can render active-state attributes.
 */
export interface LinkAttributeInput extends LinkMetadataInput {
  readonly active?: boolean;
}

/**
 * Normalizes link relationship tokens and enforces safe external-link defaults.
 *
 * @param target Optional link target.
 * @param rel Optional caller-supplied relationship tokens.
 * @returns Space-delimited relationship attribute value when present.
 */
export const buildLinkRelationship = (target?: LinkTarget, rel?: string): string | undefined => {
  const relationship = new Set(
    rel
      ?.split(/\s+/u)
      .map((token) => token.trim())
      .filter((token) => token.length > 0) ?? [],
  );

  if (target === "_blank") {
    relationship.add("noopener");
    relationship.add("noreferrer");
  }

  return relationship.size > 0 ? Array.from(relationship).join(" ") : undefined;
};

/**
 * Renders non-stateful HTML attributes for an anchor-like element.
 *
 * @param config Link metadata to serialize.
 * @returns Serialized attributes prefixed with a leading space, or an empty string when no href exists.
 */
export const renderLinkMetadataAttrs = (config: LinkMetadataInput): string => {
  if (!config.href) {
    return "";
  }

  const attrs = [`href="${escapeHtml(config.href)}"`];

  if (config.ariaLabel) {
    attrs.push(`aria-label="${escapeHtml(config.ariaLabel)}"`);
  }
  if (config.id) {
    attrs.push(`id="${escapeHtml(config.id)}"`);
  }
  if (config.linkLanguage) {
    attrs.push(`hreflang="${escapeHtml(config.linkLanguage)}"`);
    attrs.push(`lang="${escapeHtml(config.linkLanguage)}"`);
  }
  if (config.target) {
    attrs.push(`target="${escapeHtml(config.target)}"`);
  }

  const rel = buildLinkRelationship(config.target, config.rel);
  if (rel) {
    attrs.push(`rel="${escapeHtml(rel)}"`);
  }

  return ` ${attrs.join(" ")}`;
};

/**
 * Renders HTML attributes for an anchor-like element including active-state metadata.
 *
 * @param config Link metadata to serialize.
 * @returns Serialized attributes prefixed with a leading space, or an empty string when no href exists.
 */
export const renderLinkAttrs = (config: LinkAttributeInput): string => {
  const attrs = renderLinkMetadataAttrs(config);
  if (!attrs) {
    return "";
  }

  const activeAttrs = config.active ? ' aria-current="page"' : "";
  return `${attrs}${activeAttrs}`;
};
