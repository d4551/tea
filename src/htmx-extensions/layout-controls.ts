interface DrawerToggleControl extends HTMLElement {
  readonly dataset: DOMStringMap & {
    readonly drawerToggleTarget?: string;
    readonly drawerToggleMode?: "toggle" | "close";
  };
}

const drawerToggleSelector = "[data-drawer-toggle-target]";

const resolveDrawerToggle = (targetId: string): HTMLInputElement | null => {
  const element = document.getElementById(targetId);
  if (!(element instanceof HTMLInputElement) || element.type !== "checkbox") {
    return null;
  }

  return element;
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

document.addEventListener("click", (event) => {
  const control = (
    event.target instanceof Element
      ? event.target.closest<DrawerToggleControl>(drawerToggleSelector)
      : null
  ) as DrawerToggleControl | null;
  if (!control) {
    return;
  }

  event.preventDefault();
  toggleDrawer(control);
});

document.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
    return;
  }

  if (!event.target.id) {
    return;
  }

  syncDrawerControlState(event.target.id);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  for (const control of document.querySelectorAll<HTMLInputElement>(".drawer-toggle")) {
    if (!control.checked || !control.id) {
      continue;
    }

    control.checked = false;
    syncDrawerControlState(control.id);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  syncAllDrawerControls();
});

document.addEventListener("htmx:afterSwap", () => {
  syncAllDrawerControls();
});
