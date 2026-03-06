/**
 * Minimal HTMX runtime surface used by the app-specific browser extensions.
 */
export interface HtmxApi {
  /**
   * Registers an HTMX extension by name.
   *
   * @param name Stable extension name.
   * @param extension Extension lifecycle hooks.
   */
  defineExtension(name: string, extension: HtmxExtension): void;
}

/**
 * HTMX extension contract used by the custom browser scripts.
 */
export interface HtmxExtension {
  /**
   * Optional event hook invoked by HTMX.
   *
   * @param name HTMX lifecycle event name.
   * @param event Browser event payload.
   */
  onEvent?(name: string, event: HtmxLifecycleEvent): void;
  /**
   * Optional response transformer invoked before swap.
   *
   * @param text Response text.
   * @param xhr XHR instance from HTMX.
   * @param element Target element receiving the swap.
   * @returns Transformed response text.
   */
  transformResponse?(text: string, xhr: XMLHttpRequest, element: HTMLElement): string;
}

/**
 * Narrow HTMX lifecycle event shape used by the extensions.
 */
export interface HtmxLifecycleEvent extends Event {
  readonly detail?: {
    readonly elt?: Element | null;
  };
}

declare global {
  var htmx: HtmxApi | undefined;
}

/**
 * Returns the active HTMX runtime if the page has loaded it.
 *
 * @returns HTMX runtime or null when unavailable.
 */
export const getHtmx = (): HtmxApi | null => globalThis.htmx ?? null;

/**
 * Escapes HTML-sensitive characters for safe string interpolation.
 *
 * @param value Raw text value.
 * @returns Escaped HTML string.
 */
export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * Resolves the extension root element from an HTMX lifecycle event.
 *
 * @param event HTMX lifecycle event.
 * @returns Event element when available.
 */
export const resolveExtensionElement = (event: HtmxLifecycleEvent): Element | null => {
  if (event.detail?.elt instanceof Element) {
    return event.detail.elt;
  }

  return event.target instanceof Element ? event.target : null;
};
