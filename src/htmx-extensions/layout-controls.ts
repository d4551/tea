import { createLogger } from "../lib/logger.ts";
import {
  readLocalStorageResult,
  writeLocalStorageResult,
} from "../shared/utils/browser-storage.ts";
import { getHtmx, type HtmxLifecycleEvent, resolveExtensionElement } from "./shared.ts";

const logger = createLogger("layout-controls");
const htmx = getHtmx();

/** Default request synchronization policy for interactive forms. */
const FORM_SYNC_DEFAULT = "this:abort";

/** Standard interactive form submission methods handled by HTMX. */
const FORM_METHOD_ATTRS: readonly string[] = [
  "hx-get",
  "hx-post",
  "hx-put",
  "hx-delete",
  "hx-patch",
];

interface DrawerToggleControl extends HTMLElement {
  readonly dataset: DOMStringMap & {
    readonly drawerToggleTarget?: string;
    readonly drawerToggleMode?: "toggle" | "close";
  };
}

const drawerToggleSelector = "[data-drawer-toggle-target]";
const themeStorageKey = "app-theme-preference";

const resolveFocusTarget = (root: ParentNode): HTMLElement | null => {
  const panelTarget =
    root instanceof Element ? root.querySelector<HTMLElement>('[data-focus-panel="true"]') : null;
  if (panelTarget instanceof HTMLElement) {
    return panelTarget;
  }

  const target = document.getElementById("main-content");
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target;
};

const focusAfterSwap = (root: ParentNode): void => {
  const target = resolveFocusTarget(root);
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
  }

  target.focus({ preventScroll: false });
};

const resolveDrawerToggle = (targetId: string): HTMLInputElement | null => {
  const element = document.getElementById(targetId);
  if (!(element instanceof HTMLInputElement) || element.type !== "checkbox") {
    return null;
  }
  return element;
};

const findControlledDrawerSides = (checkbox: HTMLInputElement): readonly HTMLElement[] => {
  const targetId = checkbox.id;
  if (!targetId) {
    return [];
  }

  const drawerHost = checkbox.closest(".drawer");
  if (!drawerHost) {
    return [];
  }

  const escapedTargetId = CSS.escape(targetId);
  const sidePanels = Array.from(drawerHost.querySelectorAll<HTMLElement>(".drawer-side")).filter(
    (side) => side.querySelector<HTMLElement>(`label[for="${escapedTargetId}"]`) !== null,
  );
  return sidePanels;
};

const resolveDrawerSideTransform = (isEndDrawer: boolean): string =>
  isEndDrawer ? "100%" : "-100%";

const syncDrawerVisualState = (targetId: string): void => {
  const checkbox = resolveDrawerToggle(targetId);
  if (!checkbox || !checkbox.closest(".drawer-end")) {
    return;
  }

  const sidePanels = findControlledDrawerSides(checkbox);
  if (sidePanels.length === 0) {
    return;
  }

  const isOpen = checkbox.checked;
  const isEndDrawer = checkbox.closest(".drawer-end")?.classList.contains("drawer-end") ?? false;
  const closedTranslate = resolveDrawerSideTransform(isEndDrawer);

  for (const side of sidePanels) {
    const panel = side.querySelector<HTMLElement>(":scope > :not(.drawer-overlay)");
    const overlay = side.querySelector<HTMLElement>(".drawer-overlay");

    side.style.visibility = isOpen ? "visible" : "hidden";
    side.style.opacity = isOpen ? "1" : "0";
    side.style.pointerEvents = isOpen ? "auto" : "none";
    if (overlay) {
      overlay.style.visibility = isOpen ? "visible" : "hidden";
      overlay.style.pointerEvents = isOpen ? "auto" : "none";
    }

    if (panel) {
      panel.style.transform = isOpen ? "translateX(0%)" : `translateX(${closedTranslate})`;
    }
  }
};

const resolveRelatedControls = (targetId: string): readonly DrawerToggleControl[] =>
  Array.from(document.querySelectorAll<DrawerToggleControl>(drawerToggleSelector)).filter(
    (control) => control.dataset.drawerToggleTarget === targetId,
  );

const syncDrawerControlState = (targetId: string): void => {
  const checkbox = resolveDrawerToggle(targetId);
  if (!checkbox) {
    return;
  }

  for (const control of resolveRelatedControls(targetId)) {
    if (control.dataset.drawerToggleMode === "toggle") {
      control.setAttribute("aria-expanded", String(checkbox.checked));
    }
  }

  syncDrawerVisualState(targetId);
};

const toggleDrawer = (control: DrawerToggleControl): void => {
  const targetId = control.dataset.drawerToggleTarget;
  if (!targetId) {
    return;
  }

  const checkbox = resolveDrawerToggle(targetId);
  if (!checkbox) {
    return;
  }

  checkbox.checked = control.dataset.drawerToggleMode === "close" ? false : !checkbox.checked;
  syncDrawerControlState(targetId);
};

const syncAllDrawerControls = (): void => {
  for (const control of document.querySelectorAll<DrawerToggleControl>(drawerToggleSelector)) {
    const targetId = control.dataset.drawerToggleTarget;
    if (targetId) {
      syncDrawerControlState(targetId);
    }
  }
};

const parseThemeValue = (themeInput: unknown): string | null => {
  if (typeof themeInput !== "string") {
    return null;
  }

  const value = themeInput.trim();
  return value.length > 0 ? value : null;
};

const normalizeTheme = (value: string): string | null => {
  const normalized = value.trim().toLowerCase();
  const teaThemeByLegacyTheme: Record<string, string> = {
    silk: "tea-light",
    autumn: "tea-dark",
    "forge-dark": "tea-dark",
    "forge-light": "tea-light",
  };

  return teaThemeByLegacyTheme[normalized] ?? normalized;
};

const findThemeRadio = (theme: string): HTMLInputElement | null => {
  const escapedTheme = CSS.escape(theme);
  return document.querySelector<HTMLInputElement>(
    `input.theme-controller[value="${escapedTheme}"]`,
  );
};

const applyThemeFromStorage = (theme: string): void => {
  const nextTheme = normalizeTheme(theme);
  if (nextTheme === null) {
    return;
  }
  if (!["tea-dark", "tea-light"].includes(nextTheme)) {
    logger.warn("layout.theme.storage.unknown_theme", { theme });
    return;
  }

  const radio = findThemeRadio(nextTheme);
  if (!radio) {
    logger.warn("layout.theme.radio.missing", { theme: nextTheme });
    return;
  }

  if (!radio.checked) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  }
};

/** Restores persisted theme preference from localStorage into matching radios. */
const restoreThemeSelection = (): void => {
  const stored = readLocalStorageResult(themeStorageKey);
  if (!stored.ok) {
    logger.warn("layout.theme.storage.read_failed", { key: themeStorageKey });
    return;
  }

  const storedTheme = parseThemeValue(stored.value);
  if (!storedTheme) {
    return;
  }

  const normalized = normalizeTheme(storedTheme);
  if (normalized !== null) {
    applyThemeFromStorage(normalized);
  }
};

const persistThemeSelection = (event: Event): void => {
  if (
    !(event.target instanceof HTMLInputElement) ||
    !event.target.classList.contains("theme-controller")
  ) {
    return;
  }

  const theme = parseThemeValue(event.target.value);
  if (!theme) {
    return;
  }
  const normalized = normalizeTheme(theme);
  if (!normalized) {
    return;
  }

  if (!["tea-dark", "tea-light"].includes(normalized)) {
    return;
  }

  const result = writeLocalStorageResult(themeStorageKey, normalized);
  if (!result.ok) {
    logger.warn("layout.theme.storage.write_failed", {
      key: themeStorageKey,
      theme,
    });
  }
};

const isInteractiveForm = (element: Element): element is HTMLFormElement =>
  FORM_METHOD_ATTRS.some((attribute) => element.hasAttribute(attribute));

const resolveForms = (root: ParentNode): readonly HTMLFormElement[] =>
  Array.from(root.querySelectorAll("form")).filter(isInteractiveForm);

const applyFormDefaults = (root: ParentNode): void => {
  for (const form of resolveForms(root)) {
    if (!form.hasAttribute("hx-sync")) {
      form.setAttribute("hx-sync", FORM_SYNC_DEFAULT);
    }

    if (!form.hasAttribute("hx-disabled-elt")) {
      form.setAttribute("hx-disabled-elt", "button, input, select, textarea, details");
    }
  }
};

const resolveRequestForm = (event: HtmxLifecycleEvent): HTMLFormElement | null => {
  const detailElement =
    event instanceof CustomEvent
      ? event.detail?.elt instanceof Element
        ? event.detail.elt
        : null
      : null;
  const extensionElement =
    resolveExtensionElement(event) ??
    detailElement ??
    (event.target instanceof Element ? event.target : null);

  if (!extensionElement) {
    return null;
  }

  return extensionElement instanceof HTMLFormElement
    ? extensionElement
    : extensionElement.closest("form");
};

const setRequestBusyState = (form: HTMLFormElement | null, busy: boolean): void => {
  if (!(form instanceof HTMLElement)) {
    return;
  }

  if (busy) {
    form.setAttribute("aria-busy", "true");
    return;
  }

  form.removeAttribute("aria-busy");
};

const wireHtmxLifecycle = (): void => {
  if (!htmx) {
    applyFormDefaults(document);
    return;
  }

  htmx.defineExtension("layout-controls", {
    onEvent(name, event) {
      const requestForm = resolveRequestForm(event);

      if (name === "htmx:beforeRequest") {
        setRequestBusyState(requestForm, true);
        return;
      }

      if (
        name === "htmx:afterRequest" ||
        name === "htmx:responseError" ||
        name === "htmx:sendError" ||
        name === "htmx:swapError"
      ) {
        setRequestBusyState(requestForm, false);
        return;
      }

      if (name === "htmx:beforeSwap" && event instanceof CustomEvent) {
        const status = event.detail?.xhr?.status;
        if (status === 422) {
          event.detail.shouldSwap = true;
          event.detail.isError = false;
        }
        return;
      }

      if (name === "htmx:afterSwap") {
        const target = resolveExtensionElement(event);
        const scope = target instanceof Element ? target : document;
        applyFormDefaults(scope);
      }

      if (name === "htmx:afterSettle") {
        const target = resolveExtensionElement(event);
        focusAfterSwap(target instanceof Element ? target : document);
      }
    },
  });
};

const resolveDrawerControl = (target: EventTarget | null): DrawerToggleControl | null =>
  target instanceof Element ? target.closest<DrawerToggleControl>(drawerToggleSelector) : null;

document.addEventListener("click", (event) => {
  const control = resolveDrawerControl(event.target);
  if (!control) {
    return;
  }

  event.preventDefault();
  toggleDrawer(control);
});

const getFocusables = (root: ParentNode): HTMLElement[] =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => {
    if (
      el instanceof HTMLButtonElement ||
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    ) {
      if (el.disabled) return false;
    }
    return el.offsetParent !== null;
  });

const manageDrawerFocus = (checkbox: HTMLInputElement): void => {
  const sides = findControlledDrawerSides(checkbox);
  const firstSide = sides[0];
  if (checkbox.checked && firstSide) {
    const focusables = getFocusables(firstSide);
    const first = focusables[0];
    if (first) {
      queueMicrotask(() => first.focus({ preventScroll: false }));
    }
  } else if (!checkbox.checked) {
    const controls = resolveRelatedControls(checkbox.id);
    const trigger = controls[0];
    if (trigger instanceof HTMLElement) {
      queueMicrotask(() => trigger.focus({ preventScroll: false }));
    } else {
      queueMicrotask(() => checkbox.focus({ preventScroll: false }));
    }
  }
};

document.addEventListener("change", (event) => {
  persistThemeSelection(event);

  if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
    return;
  }

  if (!event.target.id) {
    return;
  }

  if (event.target.classList.contains("drawer-toggle")) {
    manageDrawerFocus(event.target);
  }

  syncDrawerControlState(event.target.id);
});

document.addEventListener("keydown", (event) => {
  const drawerControl = resolveDrawerControl(event.target);

  if (
    drawerControl &&
    (event.key === "Enter" || event.key === " ") &&
    !(drawerControl instanceof HTMLButtonElement) &&
    !(drawerControl instanceof HTMLAnchorElement) &&
    !(drawerControl instanceof HTMLInputElement)
  ) {
    event.preventDefault();
    drawerControl.click();
    return;
  }

  if (event.key !== "Escape") {
    return;
  }

  for (const control of document.querySelectorAll<HTMLInputElement>(".drawer-toggle")) {
    if (!control.checked || !control.id) {
      continue;
    }

    control.checked = false;
    manageDrawerFocus(control);
    syncDrawerControlState(control.id);
  }
});

wireHtmxLifecycle();

document.addEventListener("DOMContentLoaded", () => {
  syncAllDrawerControls();
  restoreThemeSelection();
  applyFormDefaults(document);
});

document.addEventListener("htmx:afterSwap", () => {
  syncAllDrawerControls();
  restoreThemeSelection();
});
