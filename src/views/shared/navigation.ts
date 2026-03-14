import type { LocaleCode } from "../../config/environment.ts";
import {
  type AppRouteKey,
  appRoutes,
  withLocaleQuery,
  withQueryParameters,
} from "../../shared/constants/routes.ts";

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * Shared navigation entry for links shown in primary navigation surfaces.
 */
export interface NavigationItem {
  /** Stable identifier for active state comparisons. */
  readonly key: string;
  /** User-facing label. */
  readonly label: string;
  /** Internal route path. */
  readonly href: string;
  /** Optional icon markup. */
  readonly icon?: string;
  /** Optional badge count. */
  readonly badge?: number;
  /** Optional active-state override. */
  readonly active?: boolean;
  /** Optional tooltip label for collapsed navigation. */
  readonly shortLabel?: string;
  /** Whether the item should issue an HTMX navigation request. */
  readonly htmx?: {
    readonly target?: string;
    readonly swap?: string;
    readonly pushUrl?: boolean;
  };
}

/**
 * Group of related navigation items.
 */
export interface NavigationGroup {
  /** Section title shown above the group. */
  readonly title: string;
  /** Items in display order. */
  readonly items: readonly NavigationItem[];
}

/**
 * Header or masthead action descriptor.
 */
export interface NavigationAction {
  /** Stable action key. */
  readonly key: string;
  /** Accessible action label. */
  readonly label: string;
  /** Optional full HTML payload for complex action renderers. */
  readonly html?: string;
  /** Visible content. */
  readonly content: string;
  /** Optional href for link actions. */
  readonly href?: string;
  /** Optional button classes. */
  readonly className?: string;
  /** Optional target drawer or element. */
  readonly controls?: string;
  /** Optional popup hint. */
  readonly hasPopup?: "dialog" | "menu";
  /** Optional drawer metadata. */
  readonly drawerToggle?: {
    readonly targetId: string;
    readonly mode?: "toggle" | "close";
    readonly expanded?: boolean;
  };
}

/**
 * Secondary navigation tab item.
 */
export interface SecondaryNavItem {
  /** Stable tab key. */
  readonly key: string;
  /** Visible label. */
  readonly label: string;
  /** Optional icon markup. */
  readonly icon?: string;
  /** Optional badge count. */
  readonly badge?: number;
  /** Optional href target. */
  readonly href?: string;
  /** Optional HTMX navigation metadata. */
  readonly htmx?: {
    readonly get?: string;
    readonly target?: string;
    readonly swap?: string;
  };
}

/**
 * Shared action-menu item descriptor.
 */
export interface MenuActionItem {
  /** Stable item key. */
  readonly key: string;
  /** Visible label. */
  readonly label: string;
  /** Optional custom HTML content for complex menu rows. */
  readonly contentHtml?: string;
  /** Optional href target. */
  readonly href?: string;
  /** Optional form submit button variant. */
  readonly type?: "button" | "submit";
  /** Optional disabled state. */
  readonly disabled?: boolean;
  /** Optional target attribute. */
  readonly target?: "_blank" | "_self";
  /** Optional rel attribute. */
  readonly rel?: string;
  /** Optional extra classes. */
  readonly className?: string;
}

/**
 * Shared breadcrumb descriptor.
 */
export interface NavigationBreadcrumbItem {
  /** Visible label. */
  readonly label: string;
  /** Optional href target. */
  readonly href?: string;
}

/**
 * Resolves a locale-aware navigation href and preserves project context when requested.
 *
 * @param path Route path from {@link appRoutes}.
 * @param locale Active locale.
 * @param options Optional project context.
 * @returns Relative href with locale and optional project id.
 */
export const buildNavigationHref = (
  path: string,
  locale: LocaleCode,
  options?: {
    readonly projectId?: string;
    readonly includeProjectId?: boolean;
  },
): string => {
  const localizedHref = withLocaleQuery(path, locale);
  if (!options?.includeProjectId || !options.projectId) {
    return localizedHref;
  }

  return withQueryParameters(localizedHref, { projectId: options.projectId });
};

/**
 * Renders a row of header actions.
 *
 * @param actions Ordered action list.
 * @returns HTML string for the action cluster.
 */
export const renderNavigationActions = (actions: readonly NavigationAction[]): string => {
  return actions
    .map((action) => {
      if (action.html) {
        return action.html;
      }

      const className = escapeHtml(action.className ?? "btn btn-ghost btn-sm");

      if (action.drawerToggle) {
        const mode = action.drawerToggle.mode ?? "toggle";
        const attributes = [
          `for="${escapeHtml(action.drawerToggle.targetId)}"`,
          `class="${className}"`,
          'role="button"',
          'tabindex="0"',
          `aria-label="${escapeHtml(action.label)}"`,
          `aria-controls="${escapeHtml(action.controls ?? action.drawerToggle.targetId)}"`,
          `data-drawer-toggle-target="${escapeHtml(action.drawerToggle.targetId)}"`,
          `data-drawer-toggle-mode="${escapeHtml(mode)}"`,
        ];

        if (mode === "toggle") {
          attributes.push(`aria-expanded="${String(action.drawerToggle.expanded ?? false)}"`);
        }

        if (action.hasPopup) {
          attributes.push(`aria-haspopup="${escapeHtml(action.hasPopup)}"`);
        }

        return `<label ${attributes.join(" ")}>${action.content}</label>`;
      }

      if (action.href) {
        return `<a href="${escapeHtml(action.href)}" class="${className}" aria-label="${escapeHtml(action.label)}">${action.content}</a>`;
      }

      return `<button type="button" class="${className}" aria-label="${escapeHtml(action.label)}">${action.content}</button>`;
    })
    .join("");
};

/**
 * Renders a DaisyUI details dropdown menu.
 *
 * @param label Accessible label for the trigger.
 * @param trigger Trigger content HTML.
 * @param items Action items shown in the dropdown.
 * @param options Optional sizing and placement settings.
 * @returns Dropdown menu markup.
 */
export const renderActionDropdown = (
  label: string,
  trigger: string,
  items: readonly MenuActionItem[],
  options?: {
    readonly align?: "start" | "end";
    readonly widthClass?: string;
    readonly className?: string;
    readonly menuClassName?: string;
  },
): string => {
  const dropdownClass = [
    "dropdown",
    options?.align === "start" ? "dropdown-start" : "dropdown-end",
    options?.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const menuClass = [
    "dropdown-content menu z-30 mt-3 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl",
    options?.widthClass ?? "w-52",
    options?.menuClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const listItems = items
    .map((item) => {
      if (item.contentHtml) {
        return `<li>${item.contentHtml}</li>`;
      }

      if (item.href) {
        const target = item.target ? ` target="${escapeHtml(item.target)}"` : "";
        const rel = item.rel ? ` rel="${escapeHtml(item.rel)}"` : "";
        return `<li><a href="${escapeHtml(item.href)}"${target}${rel} class="${escapeHtml(item.className ?? "")}">${escapeHtml(item.label)}</a></li>`;
      }

      const disabledAttr = item.disabled ? " disabled" : "";
      const buttonType = item.type ?? "button";
      return `<li><button type="${buttonType}"${disabledAttr} class="${escapeHtml(item.className ?? "")}">${escapeHtml(item.label)}</button></li>`;
    })
    .join("");

  return `<details class="${escapeHtml(dropdownClass)}">
    <summary class="list-none" aria-label="${escapeHtml(label)}">${trigger}</summary>
    <ul class="${escapeHtml(menuClass)}">${listItems}</ul>
  </details>`;
};

/**
 * Renders a horizontal navbar with optional desktop menu.
 *
 * @param brand Brand element HTML.
 * @param items Primary navigation items.
 * @param actions Header actions.
 * @param options Optional navbar settings.
 * @returns Navbar markup.
 */
export const renderHeaderNavbar = (
  brand: string,
  items: readonly NavigationItem[],
  actions: readonly NavigationAction[],
  options?: {
    readonly ariaLabel: string;
    readonly className?: string;
    readonly mobileLead?: string;
  },
): string => {
  const desktopItems = items
    .map((item) => {
      const badgeHtml =
        item.badge !== undefined && item.badge > 0
          ? `<span class="badge badge-neutral badge-xs">${item.badge}</span>`
          : "";
      return `<li><a href="${escapeHtml(item.href)}"${item.active ? ' aria-current="page"' : ""} class="${item.active ? "menu-active font-semibold" : ""}">${item.icon ?? ""}<span>${escapeHtml(item.label)}</span>${badgeHtml}</a></li>`;
    })
    .join("");

  return `<nav aria-label="${escapeHtml(options?.ariaLabel ?? "Primary navigation")}" class="${escapeHtml(options?.className ?? "navbar border-b border-base-300/80 bg-base-100/90 backdrop-blur")}">
    <div class="navbar-start gap-2">
      ${options?.mobileLead ?? ""}
      ${brand}
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal gap-1 px-1">${desktopItems}</ul>
    </div>
    <div class="navbar-end flex items-center gap-2">
      ${renderNavigationActions(actions)}
    </div>
  </nav>`;
};

/**
 * Renders a mobile drawer menu for public navigation.
 *
 * @param groups Ordered menu groups.
 * @param options Drawer menu options.
 * @returns Menu markup suitable for a drawer side panel.
 */
export const renderMobileDrawerMenu = (
  groups: readonly NavigationGroup[],
  options: {
    readonly ariaLabel: string;
    readonly brandHtml?: string;
    readonly footerHtml?: string;
    readonly className?: string;
  },
): string => {
  const sections = groups
    .map((group) => {
      const items = group.items
        .map((item) => {
          const badgeHtml =
            item.badge !== undefined && item.badge > 0
              ? `<span class="badge badge-neutral badge-xs">${item.badge}</span>`
              : "";
          return `<li><a href="${escapeHtml(item.href)}"${item.active ? ' aria-current="page"' : ""} class="${item.active ? "menu-active font-semibold" : ""}">${item.icon ?? ""}<span>${escapeHtml(item.label)}</span>${badgeHtml}</a></li>`;
        })
        .join("");

      return `<div class="space-y-2">
        <div class="px-4 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55">${escapeHtml(group.title)}</div>
        <ul class="menu menu-md w-full px-2">${items}</ul>
      </div>`;
    })
    .join("");

  return `<div class="${escapeHtml(options.className ?? "flex min-h-full w-80 max-w-[85vw] flex-col bg-base-100")}">
    ${options.brandHtml ? `<div class="border-b border-base-300 px-4 py-4">${options.brandHtml}</div>` : ""}
    <div role="navigation" aria-label="${escapeHtml(options.ariaLabel)}" class="flex-1 space-y-4 px-0 py-4">
      ${sections}
    </div>
    ${options.footerHtml ? `<div class="border-t border-base-300 px-4 py-4">${options.footerHtml}</div>` : ""}
  </div>`;
};

/**
 * Renders a collapsible sidebar menu for the builder shell.
 *
 * @param groups Ordered navigation groups.
 * @param options Sidebar options.
 * @returns Sidebar HTML.
 */
export const renderCollapsibleSidebarMenu = (
  groups: readonly NavigationGroup[],
  options: {
    readonly ariaLabel: string;
    readonly brandHtml?: string;
    readonly mastheadHtml?: string;
    readonly footerHtml?: string;
    readonly className?: string;
  },
): string => {
  const sections = groups
    .map((group) => {
      const titleHtml = `<li class="menu-title"><span class="is-drawer-close:hidden">${escapeHtml(group.title)}</span></li>`;
      const items = group.items
        .map((item) => {
          const badgeHtml =
            item.badge !== undefined && item.badge > 0
              ? `<span class="badge badge-neutral badge-xs is-drawer-close:hidden">${item.badge}</span>`
              : "";
          const activeClass = item.active ? "menu-active font-semibold" : "";
          const htmxAttrs = item.htmx
            ? [
                `hx-get="${escapeHtml(item.href)}"`,
                item.htmx.target ? `hx-target="${escapeHtml(item.htmx.target)}"` : "",
                item.htmx.swap ? `hx-swap="${escapeHtml(item.htmx.swap)}"` : "",
                item.htmx.pushUrl === false ? "" : 'hx-push-url="true"',
              ]
                .filter(Boolean)
                .join(" ")
            : "";
          return `<li>
            <a href="${escapeHtml(item.href)}" class="is-drawer-close:tooltip is-drawer-close:tooltip-right ${activeClass}" data-tip="${escapeHtml(item.shortLabel ?? item.label)}"${item.active ? ' aria-current="page"' : ""} aria-label="${escapeHtml(item.label)}" ${htmxAttrs}>
              ${item.icon ?? ""}
              <span class="is-drawer-close:hidden">${escapeHtml(item.label)}</span>
              ${badgeHtml}
            </a>
          </li>`;
        })
        .join("");

      return `${titleHtml}${items}`;
    })
    .join("");

  return `<aside class="${escapeHtml(options.className ?? "flex min-h-full flex-col items-start border-r border-base-300/70 bg-base-200/85 backdrop-blur is-drawer-close:w-14 is-drawer-open:w-72 is-drawer-close:overflow-visible")}" aria-label="${escapeHtml(options.ariaLabel)}">
    ${options.brandHtml ? `<div class="w-full border-b border-base-300 px-3 py-4 is-drawer-close:p-2">${options.brandHtml}</div>` : ""}
    ${options.mastheadHtml ? `<div class="w-full border-b border-base-300/70 px-3 py-3 is-drawer-close:p-2">${options.mastheadHtml}</div>` : ""}
    <ul class="menu w-full grow gap-1 px-2">${sections}</ul>
    ${options.footerHtml ? `<div class="w-full border-t border-base-300/70 p-3 is-drawer-close:p-2">${options.footerHtml}</div>` : ""}
  </aside>`;
};

/**
 * Renders a breadcrumb row below the main navbar.
 *
 * @param ariaLabel Accessible breadcrumb label.
 * @param items Ordered breadcrumb items.
 * @param options Optional wrapper configuration.
 * @returns Breadcrumb row markup.
 */
export const renderBreadcrumbRow = (
  ariaLabel: string,
  items: readonly NavigationBreadcrumbItem[],
  options?: {
    readonly className?: string;
  },
): string => {
  if (items.length === 0) {
    return "";
  }

  const crumbs = items
    .map((item, index) => {
      const isLast = index === items.length - 1 || !item.href;
      if (isLast) {
        return `<li><span aria-current="page">${escapeHtml(item.label)}</span></li>`;
      }
      return `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
    })
    .join("");

  return `<div class="${escapeHtml(options?.className ?? "border-b border-base-300/60 bg-base-100/75 px-4 py-2 backdrop-blur lg:px-8")}">
    <nav aria-label="${escapeHtml(ariaLabel)}" class="breadcrumbs max-w-[1600px] text-sm">
      <ul>${crumbs}</ul>
    </nav>
  </div>`;
};

/**
 * Renders shared secondary navigation tabs.
 *
 * @param items Ordered tab items.
 * @param activeKey Active tab key.
 * @param ariaLabel Accessible label for the tab list.
 * @param colorToken Active accent color token.
 * @returns Tab navigation markup.
 */
export const renderSecondaryNav = (
  items: readonly SecondaryNavItem[],
  activeKey: string,
  ariaLabel: string,
  colorToken = "primary",
): string => {
  const renderedItems = items
    .map((item) => {
      const activeClass =
        item.key === activeKey ? `tab-active [--tab-color:var(--color-${colorToken})]` : "";
      const badgeHtml =
        item.badge !== undefined && item.badge > 0
          ? `<span class="badge badge-${colorToken} badge-xs">${item.badge}</span>`
          : "";
      const content = `${item.icon ? `<span class="icon">${item.icon}</span>` : ""}<span>${escapeHtml(item.label)}</span>${badgeHtml}`;
      const ariaSelected = item.key === activeKey ? "true" : "false";
      const htmxAttrs = item.htmx
        ? [
            item.htmx.get ? `hx-get="${escapeHtml(item.htmx.get)}"` : "",
            item.htmx.target ? `hx-target="${escapeHtml(item.htmx.target)}"` : "",
            item.htmx.swap ? `hx-swap="${escapeHtml(item.htmx.swap)}"` : "",
          ]
            .filter(Boolean)
            .join(" ")
        : "";

      if (item.href && !item.htmx?.get) {
        return `<a href="${escapeHtml(item.href)}" role="tab" class="tab ${activeClass}" aria-selected="${ariaSelected}" aria-label="${escapeHtml(item.label)}">${content}</a>`;
      }

      return `<button type="button" role="tab" class="tab ${activeClass}" aria-selected="${ariaSelected}" aria-label="${escapeHtml(item.label)}" ${htmxAttrs}>${content}</button>`;
    })
    .join("");

  return `<div class="overflow-x-auto pb-1">
    <nav class="tabs tabs-lg tabs-box bg-base-200/80 min-w-max" role="tablist" aria-label="${escapeHtml(ariaLabel)}">
      ${renderedItems}
    </nav>
  </div>`;
};

/**
 * Builds the public primary navigation model from canonical app routes.
 *
 * @param locale Active locale.
 * @param activeRoute Active route key.
 * @param projectId Optional project context.
 * @returns Primary navigation items.
 */
export const buildPublicPrimaryNavigation = (
  locale: LocaleCode,
  activeRoute: AppRouteKey,
  labels: {
    readonly home: string;
    readonly builder: string;
    readonly game: string;
  },
  icons: {
    readonly home: string;
    readonly builder: string;
    readonly game: string;
  },
  projectId?: string,
): readonly NavigationItem[] => {
  const projectScopedRoutes = new Set([appRoutes.builder, appRoutes.game]);
  return [
    {
      key: "home",
      label: labels.home,
      href: buildNavigationHref(appRoutes.home, locale),
      icon: icons.home,
      active: activeRoute === "home",
    },
    {
      key: "builder",
      label: labels.builder,
      href: buildNavigationHref(appRoutes.builder, locale, {
        projectId,
        includeProjectId: Boolean(projectId && projectScopedRoutes.has(appRoutes.builder)),
      }),
      icon: icons.builder,
      active: activeRoute === "builder",
    },
    {
      key: "game",
      label: labels.game,
      href: buildNavigationHref(appRoutes.game, locale, {
        projectId,
        includeProjectId: Boolean(projectId && projectScopedRoutes.has(appRoutes.game)),
      }),
      icon: icons.game,
      active: activeRoute === "game",
    },
  ] as const;
};
