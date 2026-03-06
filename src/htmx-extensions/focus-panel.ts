import { getHtmx, resolveExtensionElement } from "./shared.ts";

const htmx = getHtmx();

if (htmx) {
  htmx.defineExtension("focus-panel", {
    onEvent(name, event) {
      if (name !== "htmx:afterSwap") {
        return;
      }

      const element = resolveExtensionElement(event);
      if (!element) {
        return;
      }

      const focusTarget = element.matches('[data-focus-panel="true"]')
        ? element
        : element.querySelector('[data-focus-panel="true"]');

      if (!(focusTarget instanceof HTMLElement)) {
        return;
      }

      if (!focusTarget.hasAttribute("tabindex")) {
        focusTarget.setAttribute("tabindex", "-1");
      }

      queueMicrotask(() => {
        focusTarget.focus();
      });
    },
  });
}
