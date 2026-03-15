import { createLogger } from "../lib/logger.ts";
import { matchUiTheme, UI_THEME_STORAGE_KEY } from "../shared/constants/ui-theme.ts";
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
  return Array.from(drawerHost.querySelectorAll<HTMLElement>(".drawer-side")).filter(
    (side) => side.querySelector<HTMLElement>(`label[for="${escapedTargetId}"]`) !== null,
  );
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

const applyDocumentTheme = (theme: string): void => {
  const normalized = matchUiTheme(theme);
  if (normalized === null) {
    return;
  }

  document.documentElement.setAttribute("data-theme", normalized);
};

const findThemeRadio = (theme: string): HTMLInputElement | null => {
  const escapedTheme = CSS.escape(theme);
  return document.querySelector<HTMLInputElement>(
    `input.theme-controller[value="${escapedTheme}"]`,
  );
};

const applyThemeFromStorage = (theme: string): void => {
  const nextTheme = matchUiTheme(theme);
  if (nextTheme === null) {
    logger.warn("layout.theme.storage.unknown_theme", { theme });
    return;
  }

  applyDocumentTheme(nextTheme);
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
  const stored = readLocalStorageResult(UI_THEME_STORAGE_KEY);
  if (!stored.ok) {
    logger.warn("layout.theme.storage.read_failed", { key: UI_THEME_STORAGE_KEY });
    return;
  }

  const storedTheme = parseThemeValue(stored.value);
  if (!storedTheme) {
    return;
  }

  const normalized = matchUiTheme(storedTheme);
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
  const normalized = matchUiTheme(theme);
  if (!normalized) {
    return;
  }

  applyDocumentTheme(normalized);
  const result = writeLocalStorageResult(UI_THEME_STORAGE_KEY, normalized);
  if (!result.ok) {
    logger.warn("layout.theme.storage.write_failed", {
      key: UI_THEME_STORAGE_KEY,
      theme,
    });
  }
};

const normalizeDocumentTheme = (): void => {
  const currentTheme = parseThemeValue(document.documentElement.getAttribute("data-theme"));
  if (!currentTheme) {
    return;
  }

  const normalized = matchUiTheme(currentTheme);
  if (!normalized) {
    return;
  }

  if (document.documentElement.getAttribute("data-theme") !== normalized) {
    document.documentElement.setAttribute("data-theme", normalized);
  }

  const radio = findThemeRadio(normalized);
  if (radio && !radio.checked) {
    radio.checked = true;
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
  normalizeDocumentTheme();
  restoreThemeSelection();
  applyFormDefaults(document);
});

document.addEventListener("htmx:afterSwap", () => {
  syncAllDrawerControls();
  normalizeDocumentTheme();
  restoreThemeSelection();
});
