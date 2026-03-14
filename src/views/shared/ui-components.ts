/**
 * Shared UI Components
 *
 * Reusable DaisyUI v5 component functions following best practices.
 * Provides consistent patterns for cards, buttons, badges, forms, and navigation.
 */

import { escapeHtml } from "../layout.ts";

/* ------------------------------------------------------------------ */
/* Shared CSS Class Constants (DRY)                                   */
/* ------------------------------------------------------------------ */

/** DaisyUI card variants. Use for article/div wrappers. */
export const cardClasses = {
  default: "bg-base-200 card",
  bordered: "bg-base-200 card",
  borderedGlass: "bg-base-200 card",
  borderedGlassNoBlur: "bg-base-200 card",
  borderedNoShadow: "bg-base-200 card",
} as const;

/** DaisyUI loading spinner classes for HTMX indicators. */
export const spinnerClasses = {
  xs: "loading loading-spinner loading-xs htmx-indicator",
  sm: "loading loading-spinner loading-sm htmx-indicator",
} as const;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Color tokens supported by DaisyUI.
 */
export type ColorToken =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "info"
  | "error";

/**
 * Size variants for components.
 */
export type Size = "xs" | "sm" | "md" | "lg";

/**
 * Card variant configuration.
 */
export interface CardConfig {
  /** Card body content. */
  readonly body: string;
  /** Optional card title. */
  readonly title?: string;
  /** Optional card subtitle/description. */
  readonly description?: string;
  /** Optional card actions HTML. */
  readonly actions?: string;
  /** Optional card footer HTML. */
  readonly footer?: string;
  /** Card variant style. */
  readonly variant?: "bordered" | "elevated" | "interactive" | "glass";
  /** Optional color accent token. */
  readonly colorToken?: ColorToken;
  /** Optional additional CSS classes. */
  readonly className?: string;
  /** Optional ARIA role. */
  readonly role?: string;
  /** Optional ARIA label. */
  readonly ariaLabel?: string;
  /** Optional id attribute. */
  readonly id?: string;
}

/**
 * Button configuration.
 */
export interface ButtonConfig {
  /** Button label text. */
  readonly label: string;
  /** Button variant. */
  readonly variant?: "primary" | "secondary" | "accent" | "neutral" | "ghost" | "link" | "outline";
  /** Button size. */
  readonly size?: Size;
  /** Optional button type attribute. */
  readonly type?: "button" | "submit" | "reset";
  /** Optional href for link buttons. */
  readonly href?: string;
  /** Optional HTMX attributes. */
  readonly htmx?: {
    readonly get?: string;
    readonly post?: string;
    readonly put?: string;
    readonly patch?: string;
    readonly delete?: string;
    readonly target?: string;
    readonly swap?: string;
    readonly indicator?: string;
    readonly disabledElt?: string;
    readonly confirm?: string;
    readonly params?: Record<string, string>;
  };
  /** Optional leading icon SVG. */
  readonly leadingIcon?: string;
  /** Optional trailing icon SVG. */
  readonly trailingIcon?: string;
  /** Optional loading state. */
  readonly loading?: boolean;
  /** Optional disabled state. */
  readonly disabled?: boolean;
  /** Optional additional CSS classes. */
  readonly className?: string;
  /** Optional ARIA label (for accessibility). */
  readonly ariaLabel?: string;
  /** Optional id attribute. */
  readonly id?: string;
}

/**
 * Badge configuration.
 */
export interface BadgeConfig {
  /** Badge content. */
  readonly content: string;
  /** Badge variant. */
  readonly variant?: "outline" | "soft" | "dash";
  /** Optional color token. */
  readonly colorToken?: ColorToken;
  /** Optional size. */
  readonly size?: "xs" | "sm" | "md" | "lg";
  /** Optional additional CSS classes. */
  readonly className?: string;
}

/**
 * Alert configuration.
 */
export interface AlertConfig {
  /** Alert content. */
  readonly content: string;
  /** Optional alert title. */
  readonly title?: string;
  /** Alert variant. */
  readonly variant?: "info" | "success" | "warning" | "error" | "neutral";
  /** Optional soft style. */
  readonly soft?: boolean;
  /** Optional icon SVG. */
  readonly icon?: string;
  /** Optional actions HTML. */
  readonly actions?: string;
  /** Optional additional CSS classes. */
  readonly className?: string;
  /** Optional ARIA role. */
  readonly role?: "alert" | "status";
}

/**
 * Tab item configuration.
 */
export interface TabItem {
  /** Unique tab key. */
  readonly key: string;
  /** Display label. */
  readonly label: string;
  /** Optional icon SVG. */
  readonly icon?: string;
  /** Optional badge count. */
  readonly badge?: number;
  /** Optional href for link tabs. */
  readonly href?: string;
  /** Optional HTMX attributes. */
  readonly htmx?: {
    readonly get?: string;
    readonly target?: string;
    readonly swap?: string;
  };
  /** Optional disabled state. */
  readonly disabled?: boolean;
}

/**
 * Tab configuration.
 */
export interface TabsConfig {
  /** Tab items. */
  readonly tabs: readonly TabItem[];
  /** Currently active tab key. */
  readonly activeKey: string;
  /** Optional color token for active tab. */
  readonly colorToken?: ColorToken;
  /** Optional size. */
  readonly size?: "xs" | "sm" | "md" | "lg";
  /** Optional boxed style. */
  readonly boxed?: boolean;
  /** Optional aria-label for the tab list. */
  readonly ariaLabel?: string;
  /** Optional additional CSS classes. */
  readonly className?: string;
}

/**
 * Stat configuration for stats component.
 */
export interface StatConfig {
  /** Stat title/label. */
  readonly title: string;
  /** Stat value. */
  readonly value: string | number;
  /** Optional stat description. */
  readonly description?: string;
  /** Optional figure/icon SVG. */
  readonly figure?: string;
  /** Optional color token for value. */
  readonly colorToken?: ColorToken;
}

/**
 * Stats component configuration.
 */
export interface StatsConfig {
  /** Stat items. */
  readonly stats: readonly StatConfig[];
  /** Optional vertical layout on mobile. */
  readonly vertical?: boolean;
  /** Optional additional CSS classes. */
  readonly className?: string;
  /** Optional ARIA label. */
  readonly ariaLabel?: string;
}

/**
 * Hero component configuration.
 */
export interface HeroConfig {
  /** Hero title text. */
  readonly title: string;
  /** Optional hero subtitle. */
  readonly subtitle?: string;
  /** Optional action buttons/content area. */
  readonly actions?: string;
  /** Optional hero media column content. */
  readonly media?: string;
  /** Optional minimum height utility class. */
  readonly minHeightClass?: string;
  /** Optional additional wrapper classes. */
  readonly className?: string;
  /** Optional hero content area classes. */
  readonly contentClassName?: string;
}

/**
 * Collapse configuration.
 */
export interface CollapseConfig {
  /** Summary title/label. */
  readonly title: string;
  /** Body content rendered inside collapse-content. */
  readonly content: string;
  /** Whether collapse should be open by default. */
  readonly open?: boolean;
  /** Optional additional classes for root details. */
  readonly className?: string;
  /** Optional aria-label override. */
  readonly ariaLabel?: string;
}

/**
 * Status indicator configuration.
 */
export interface StatusConfig {
  /** Status token for the indicator. */
  readonly tone:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "info"
    | "error";
  /** Optional size variant for status dot. */
  readonly size?: "xs" | "sm" | "md" | "lg";
  /** Optional animation token. */
  readonly animation?: "dot" | "ping" | "bounce";
  /** Optional wrapper classes. */
  readonly className?: string;
}

/**
 * Form field configuration.
 */
export interface FieldConfig {
  /** Field name. */
  readonly name: string;
  /** Field label. */
  readonly label: string;
  /** Field type. */
  readonly type?: "text" | "number" | "email" | "password" | "url" | "textarea" | "select";
  /** Optional placeholder. */
  readonly placeholder?: string;
  /** Optional current value. */
  readonly value?: string | number;
  /** Optional help text. */
  readonly helpText?: string;
  /** Optional error message. */
  readonly error?: string;
  /** Optional required. */
  readonly required?: boolean;
  /** Optional disabled. */
  readonly disabled?: boolean;
  /** Optional min value (for number). */
  readonly min?: number;
  /** Optional max value (for number). */
  readonly max?: number;
  /** Optional step value (for number). */
  readonly step?: string;
  /** Optional input classes. */
  readonly inputClassName?: string;
  /** Optional id (defaults to name). */
  readonly id?: string;
  /** For select type, the options. */
  readonly options?: readonly {
    readonly value: string;
    readonly label: string;
    readonly selected?: boolean;
  }[];
}

/* ------------------------------------------------------------------ */
/* Card Components                                                    */
/* ------------------------------------------------------------------ */

/**
 * Renders a DaisyUI card with consistent structure.
 */
export const renderCard = (config: CardConfig): string => {
  const variant = config.variant ?? "bordered";
  const colorToken = config.colorToken;

  const variantClasses: Record<string, string> = {
    bordered: cardClasses.bordered,
    elevated: "card card-elevated bg-base-100",
    interactive: "card card-interactive card-border bg-base-100 shadow-sm",
    glass: "card card-border bg-base-100/90 backdrop-blur-sm shadow-lg",
  };

  const baseClasses = variantClasses[variant] ?? variantClasses.bordered;
  const colorClass = colorToken ? `border-${colorToken}/20` : "";
  const extraClasses = config.className ?? "";
  const classes = [baseClasses, colorClass, extraClasses].filter(Boolean).join(" ");

  const idAttr = config.id ? ` id="${escapeHtml(config.id)}"` : "";
  const roleAttr = config.role ? ` role="${config.role}"` : "";
  const ariaLabelAttr = config.ariaLabel ? ` aria-label="${escapeHtml(config.ariaLabel)}"` : "";

  const titleHtml = config.title ? `<h3 class="card-title">${escapeHtml(config.title)}</h3>` : "";
  const descHtml = config.description
    ? `<p class="text-sm text-base-content/70">${escapeHtml(config.description)}</p>`
    : "";
  const actionsHtml = config.actions
    ? `<div class="card-actions justify-end">${config.actions}</div>`
    : "";
  const footerHtml = config.footer
    ? `<div class="card-footer pt-2 border-t border-base-300">${config.footer}</div>`
    : "";

  return `<article class="${classes}"${idAttr}${roleAttr}${ariaLabelAttr}>
  <div class="card-body gap-3">
    ${titleHtml}
    ${descHtml}
    ${config.body}
    ${actionsHtml}
    ${footerHtml}
  </div>
</article>`;
};

/** Default empty state icon (inbox). */
const emptyStateIconDefault = `<svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>`;

/**
 * Renders an empty state card.
 */
export const renderEmptyState = (
  icon: string,
  title: string,
  description: string,
  actions?: string,
): string => {
  return `<div class="empty-state flex flex-col items-center justify-center gap-4 text-center" role="status" aria-label="${escapeHtml(title)}">
  ${icon}
  <div class="space-y-1">
    <h3 class="font-semibold text-base-content/70">${escapeHtml(title)}</h3>
    <p class="text-sm text-base-content/50 max-w-sm">${escapeHtml(description)}</p>
  </div>
  ${actions ? `<div class="flex flex-wrap gap-2 justify-center">${actions}</div>` : ""}
</div>`;
};

/**
 * Renders a compact empty state for builder panels.
 */
export const renderEmptyStateCompact = (
  title: string,
  description: string,
  icon = emptyStateIconDefault,
): string =>
  `<div class="empty-state empty-state-compact" role="status" aria-label="${escapeHtml(title)}">
  ${icon}
  <div class="space-y-1">
    <h3 class="font-semibold text-base-content/70">${escapeHtml(title)}</h3>
    <p class="text-sm text-base-content/50">${escapeHtml(description)}</p>
  </div>
</div>`;

/* ------------------------------------------------------------------ */
/* Button Components                                                  */
/* ------------------------------------------------------------------ */

const sizeClasses: Record<Size, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

const variantClasses: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  link: "btn-link",
  outline: "btn-outline",
};

/**
 * Renders a DaisyUI button.
 */
export const renderButton = (config: ButtonConfig): string => {
  const size = config.size ?? "sm";
  const variant = config.variant ?? "primary";
  const ariaLabel = config.ariaLabel ?? config.label;
  const typeAttr = ` type="${config.type ?? "button"}"`;

  const classes = [
    "btn",
    variantClasses[variant] ?? "",
    sizeClasses[size] ?? "",
    config.loading ? "loading" : "",
    config.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const disabledAttr = config.disabled ? " disabled" : "";
  const ariaLabelAttr = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : "";
  const idAttr = config.id ? ` id="${escapeHtml(config.id)}"` : "";

  const htmxAttrs = config.htmx ? renderHtmxAttrs(config.htmx) : "";

  const leadingIcon = config.leadingIcon ? `<span class="icon">${config.leadingIcon}</span>` : "";
  const trailingIcon = config.trailingIcon
    ? `<span class="icon">${config.trailingIcon}</span>`
    : "";

  const content = `${leadingIcon}${escapeHtml(config.label)}${trailingIcon}`;

  if (config.href) {
    return `<a href="${escapeHtml(config.href)}" class="${classes}"${ariaLabelAttr}${idAttr}${htmxAttrs}>${content}</a>`;
  }

  return `<button class="${classes}"${typeAttr}${disabledAttr}${ariaLabelAttr}${idAttr}${htmxAttrs}>${content}</button>`;
};

/**
 * Renders HTMX attributes from config.
 */
const renderHtmxAttrs = (htmx: NonNullable<ButtonConfig["htmx"]>): string => {
  const attrs: string[] = [];

  if (htmx.get) attrs.push(`hx-get="${escapeHtml(htmx.get)}"`);
  if (htmx.post) attrs.push(`hx-post="${escapeHtml(htmx.post)}"`);
  if (htmx.put) attrs.push(`hx-put="${escapeHtml(htmx.put)}"`);
  if (htmx.patch) attrs.push(`hx-patch="${escapeHtml(htmx.patch)}"`);
  if (htmx.delete) attrs.push(`hx-delete="${escapeHtml(htmx.delete)}"`);
  if (htmx.target) attrs.push(`hx-target="${escapeHtml(htmx.target)}"`);
  if (htmx.swap) attrs.push(`hx-swap="${escapeHtml(htmx.swap)}"`);
  if (htmx.indicator) attrs.push(`hx-indicator="${escapeHtml(htmx.indicator)}"`);
  if (htmx.disabledElt) attrs.push(`hx-disabled-elt="${escapeHtml(htmx.disabledElt)}"`);
  if (htmx.confirm) attrs.push(`hx-confirm="${escapeHtml(htmx.confirm)}"`);

  if (htmx.params) {
    const keys = Object.keys(htmx.params);
    if (keys.length > 0) {
      attrs.push(`hx-params="${escapeHtml(keys.join(","))}"`);
      attrs.push(`hx-vals="${escapeHtml(JSON.stringify(htmx.params))}"`);
    }
  }

  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
};

/**
 * Renders a button group (join component).
 */
export const renderButtonGroup = (
  buttons: readonly ButtonConfig[],
  options?: { readonly className?: string; readonly ariaLabel?: string },
): string => {
  const ariaLabelAttr = options?.ariaLabel ? ` aria-label="${escapeHtml(options.ariaLabel)}"` : "";
  const classAttr = options?.className ?? "";
  const buttonsHtml = buttons
    .map((btn, index) => {
      const isFirst = index === 0;
      const isLast = index === buttons.length - 1;
      const joinClass = isFirst ? "join-item" : isLast ? "join-item" : "join-item";
      return renderButton({ ...btn, className: `${btn.className ?? ""} ${joinClass}` });
    })
    .join("");

  return `<div class="join ${classAttr}" role="group"${ariaLabelAttr}>${buttonsHtml}</div>`;
};

/* ------------------------------------------------------------------ */
/* Badge Components                                                   */
/* ------------------------------------------------------------------ */

/**
 * Renders a DaisyUI badge.
 */
export const renderBadge = (config: BadgeConfig): string => {
  const variant = config.variant ?? "outline";
  const colorToken = config.colorToken ?? "";
  const size = config.size ?? "";

  const classes = [
    "badge",
    variant === "soft" ? "badge-soft" : variant === "dash" ? "badge-dash" : "badge-outline",
    colorToken ? `badge-${colorToken}` : "",
    size ? `badge-${size}` : "",
    config.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<span class="${classes}">${escapeHtml(config.content)}</span>`;
};

/**
 * Renders an indicator badge (for notifications).
 */
export const renderIndicator = (
  count: number,
  options?: { readonly colorToken?: ColorToken; readonly className?: string },
): string => {
  if (count <= 0) return "";

  const colorToken = options?.colorToken ?? "primary";
  const classes = ["indicator-item", "badge", `badge-${colorToken}`, options?.className ?? ""]
    .filter(Boolean)
    .join(" ");

  return `<span class="${classes}">${count > 99 ? "99+" : count}</span>`;
};

/* ------------------------------------------------------------------ */
/* Alert Components                                                   */
/* ------------------------------------------------------------------ */

/**
 * Renders a DaisyUI alert.
 */
export const renderAlert = (config: AlertConfig): string => {
  const variant = config.variant ?? "info";
  const softClass = config.soft ? "alert-soft" : "";
  const roleAttr = config.role ?? "status";

  const classes = ["alert", `alert-${variant}`, softClass, config.className ?? ""]
    .filter(Boolean)
    .join(" ");

  const icon = config.icon
    ? config.icon
    : `<svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

  const titleHtml = config.title ? `<h3 class="font-bold">${escapeHtml(config.title)}</h3>` : "";
  const descHtml = config.content ? `<div class="text-sm">${escapeHtml(config.content)}</div>` : "";
  const actionsHtml = config.actions ? `<div class="flex gap-2">${config.actions}</div>` : "";

  return `<div role="${roleAttr}" class="${classes}">
  ${icon}
  <div>
    ${titleHtml}
    ${descHtml}
  </div>
  ${actionsHtml}
</div>`;
};

/* ------------------------------------------------------------------ */
/* Tab Components                                                     */
/* ------------------------------------------------------------------ */

/**
 * Renders DaisyUI tabs.
 */
export const renderTabs = (config: TabsConfig): string => {
  const {
    tabs,
    activeKey,
    colorToken = "primary",
    size = "md",
    boxed = false,
    ariaLabel = tabs.find((tab) => tab.key === activeKey)?.label ?? tabs[0]?.label ?? "",
    className = "",
  } = config;

  const sizeClass = size === "md" ? "" : `tabs-${size}`;
  const boxedClass = boxed ? "tabs-boxed bg-base-200" : "";
  const containerClasses = ["tabs", sizeClass, boxedClass, className].filter(Boolean).join(" ");

  const tabItems = tabs
    .map((tab) => {
      const isActive = tab.key === activeKey;
      const activeClass = isActive ? `tab-active [--tab-color:var(--color-${colorToken})]` : "";
      const badgeHtml =
        tab.badge !== undefined && tab.badge > 0
          ? `<span class="badge badge-${colorToken} badge-xs ml-1">${tab.badge}</span>`
          : "";

      const iconHtml = tab.icon ? `<span class="icon">${tab.icon}</span>` : "";

      const content = `${iconHtml}${escapeHtml(tab.label)}${badgeHtml}`;

      const htmxAttrs = tab.htmx ? renderTabHtmxAttrs(tab.htmx) : "";

      const disabledAttr = tab.disabled ? " disabled" : "";
      const activeAttr = isActive ? ' aria-selected="true"' : ' aria-selected="false"';

      if (tab.href && !tab.htmx) {
        return `<a href="${escapeHtml(tab.href)}" class="tab ${activeClass}" role="tab"${activeAttr}${disabledAttr} aria-label="${escapeHtml(tab.label)}">${content}</a>`;
      }

      return `<button type="button" class="tab ${activeClass}" role="tab"${activeAttr}${disabledAttr} aria-label="${escapeHtml(tab.label)}"${htmxAttrs}>${content}</button>`;
    })
    .join("");

  return `<nav class="${containerClasses}" role="tablist" aria-label="${escapeHtml(ariaLabel)}">${tabItems}</nav>`;
};

/**
 * Renders tabbed content container with panels.
 */
export const renderTabbedContent = (
  tabs: TabsConfig,
  panels: readonly { readonly key: string; readonly content: string }[],
  options?: { readonly className?: string },
): string => {
  const tabsHtml = renderTabs(tabs);
  const panelsHtml = panels
    .map((panel) => {
      const isActive = panel.key === tabs.activeKey;
      const activeClass = isActive ? "" : "hidden";
      return `<div class="${activeClass}" role="tabpanel" data-tab-panel="${escapeHtml(panel.key)}">${panel.content}</div>`;
    })
    .join("");

  const containerClasses = options?.className ?? "space-y-4";

  return `<div class="${containerClasses}">${tabsHtml}${panelsHtml}</div>`;
};

const renderTabHtmxAttrs = (htmx: NonNullable<TabItem["htmx"]>): string => {
  const attrs: string[] = [];
  if (htmx.get) attrs.push(`hx-get="${escapeHtml(htmx.get)}"`);
  if (htmx.target) attrs.push(`hx-target="${escapeHtml(htmx.target)}"`);
  if (htmx.swap) attrs.push(`hx-swap="${escapeHtml(htmx.swap)}"`);
  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
};

/* ------------------------------------------------------------------ */
/* Stats Components                                                   */
/* ------------------------------------------------------------------ */

/**
 * Renders a DaisyUI stats component.
 */
export const renderStats = (config: StatsConfig): string => {
  const { stats, vertical = false, className = "", ariaLabel } = config;

  const layoutClass = vertical ? "stats-vertical" : "stats-vertical sm:stats-horizontal";
  const ariaLabelAttr = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : "";

  const statItems = stats
    .map((stat) => {
      const valueClass = stat.colorToken ? `text-${stat.colorToken}` : "";
      const figureHtml = stat.figure ? `<div class="stat-figure">${stat.figure}</div>` : "";
      const descHtml = stat.description
        ? `<div class="stat-desc">${escapeHtml(stat.description)}</div>`
        : "";

      return `<div class="stat">
  ${figureHtml}
  <div class="stat-title">${escapeHtml(stat.title)}</div>
  <div class="stat-value ${valueClass}">${escapeHtml(String(stat.value))}</div>
  ${descHtml}
</div>`;
    })
    .join("");

  return `<div class="stats ${layoutClass} bg-base-200 border border-base-300 ${className}"${ariaLabelAttr}>${statItems}</div>`;
};

/**
 * Renders a DaisyUI hero section.
 */
export const renderHero = (config: HeroConfig): string => {
  const minHeightClass = config.minHeightClass ?? "min-h-[50vh]";
  const className = [
    "hero",
    minHeightClass,
    "bg-base-200",
    "overflow-hidden",
    config.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const contentClassName = config.contentClassName ?? "max-w-4xl py-10";

  return `<section class="${className}">
  <div class="hero-content ${contentClassName}">
    <div class="max-w-full">
      <h1 class="text-display font-bold">${escapeHtml(config.title)}</h1>
      ${config.subtitle ? `<p class="text-base-content/75 mt-3 leading-7">${escapeHtml(config.subtitle)}</p>` : ""}
      ${config.actions ? `<div class="hero-actions mt-6 flex flex-wrap gap-2">${config.actions}</div>` : ""}
    </div>
    ${config.media ?? ""}
  </div>
</section>`;
};

/**
 * Renders a DaisyUI collapse block.
 */
export const renderCollapse = (config: CollapseConfig): string => {
  const openAttr = config.open ? " open" : "";
  const ariaLabel = config.ariaLabel ? ` aria-label="${escapeHtml(config.ariaLabel)}"` : "";

  return `<details class="collapse ${config.className ?? "bg-base-200/50 rounded-box border border-dashed border-base-300"}"${openAttr}${ariaLabel}>
    <summary class="collapse-title font-medium text-sm">${escapeHtml(config.title)}</summary>
    <div class="collapse-content">
      ${config.content}
    </div>
</details>`;
};

/**
 * Renders a DaisyUI status indicator element.
 */
export const renderStatus = (config: StatusConfig): string => {
  const size = config.size ?? "sm";
  const sizeClass = `status-${size}`;
  const animationClass = config.animation ? `status-${config.animation}` : "";
  const classes = [
    "status",
    `status-${config.tone}`,
    sizeClass,
    animationClass,
    config.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<span class="${classes}" aria-hidden="true"></span>`;
};

/* ------------------------------------------------------------------ */
/* Form Components                                                    */
/* ------------------------------------------------------------------ */

/**
 * Renders a DaisyUI fieldset with label and input.
 */
export const renderField = (config: FieldConfig): string => {
  const id = config.id ?? config.name;
  const idAttr = ` id="${escapeHtml(id)}"`;
  const nameAttr = ` name="${escapeHtml(config.name)}"`;
  const placeholderAttr = config.placeholder
    ? ` placeholder="${escapeHtml(config.placeholder)}"`
    : "";
  const valueAttr =
    config.value !== undefined ? ` value="${escapeHtml(String(config.value))}"` : "";
  const requiredAttr = config.required ? ' required aria-required="true"' : "";
  const disabledAttr = config.disabled ? " disabled" : "";
  const hasError = (config.error?.length ?? 0) > 0;
  const hasHelpText = (config.helpText?.length ?? 0) > 0;
  const errorClass = hasError ? " input-error" : "";
  const ariaInvalidAttr = hasError ? ' aria-invalid="true"' : "";
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedByIds = [hasHelpText ? helpId : "", hasError ? errorId : ""]
    .filter(Boolean)
    .join(" ");
  const ariaDescribedByAttr = describedByIds
    ? ` aria-describedby="${escapeHtml(describedByIds)}"`
    : "";
  const ariaLabelAttr = ` aria-label="${escapeHtml(config.label)}"`;

  const inputClasses = [
    config.type === "textarea" ? "textarea" : config.type === "select" ? "select" : "input",
    "w-full",
    errorClass,
    config.inputClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const rowsAttr = config.type === "textarea" ? ` rows="4"` : "";
  const minAttr = config.min !== undefined ? ` min="${config.min}"` : "";
  const maxAttr = config.max !== undefined ? ` max="${config.max}"` : "";
  const stepAttr = config.step ? ` step="${config.step}"` : "";

  let inputHtml: string;
  if (config.type === "textarea") {
    inputHtml = `<textarea${idAttr}${nameAttr}${placeholderAttr}${rowsAttr}${requiredAttr}${disabledAttr}${ariaInvalidAttr}${ariaDescribedByAttr} class="${inputClasses}">${config.value !== undefined ? escapeHtml(String(config.value)) : ""}</textarea>`;
  } else if (config.type === "select") {
    const optionsHtml = (config.options ?? [])
      .map(
        (opt) =>
          `<option value="${escapeHtml(opt.value)}"${opt.selected ? " selected" : ""}>${escapeHtml(opt.label)}</option>`,
      )
      .join("");
    inputHtml = `<select${idAttr}${nameAttr}${ariaLabelAttr}${requiredAttr}${disabledAttr}${ariaInvalidAttr}${ariaDescribedByAttr} class="${inputClasses}">${optionsHtml}</select>`;
  } else {
    const typeAttr = ` type="${config.type ?? "text"}"`;
    inputHtml = `<input${idAttr}${nameAttr}${typeAttr}${placeholderAttr}${valueAttr}${minAttr}${maxAttr}${stepAttr}${requiredAttr}${disabledAttr}${ariaInvalidAttr}${ariaDescribedByAttr} class="${inputClasses}" />`;
  }

  const helpHtml = config.helpText
    ? `<p class="label" id="${helpId}">${escapeHtml(config.helpText)}</p>`
    : "";
  const errorHtml = config.error
    ? `<p class="text-error text-sm mt-1" id="${errorId}" role="alert">${escapeHtml(config.error)}</p>`
    : "";

  return `<fieldset class="fieldset">
  <legend class="fieldset-legend">${escapeHtml(config.label)}</legend>
  ${inputHtml}
  ${helpHtml}
  ${errorHtml}
</fieldset>`;
};

/**
 * Renders projectId and locale hidden inputs for builder forms.
 * Single source of truth for the repeated pattern across builder views.
 */
export const renderBuilderHiddenFields = (projectId: string, locale: string): string =>
  `<input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
        <input type="hidden" name="locale" value="${escapeHtml(locale)}" />`;

/**
 * Renders a loading spinner.
 */
export const renderSpinner = (
  size: "xs" | "sm" | "md" | "lg" = "sm",
  options?: { readonly id?: string; readonly ariaLabel?: string },
): string => {
  const sizeClass = size === "md" ? "" : `loading-${size}`;
  const idAttr = options?.id ? ` id="${escapeHtml(options.id)}"` : "";
  const ariaLabelAttr = options?.ariaLabel ? ` aria-label="${escapeHtml(options.ariaLabel)}"` : "";

  return `<span${idAttr} class="loading loading-spinner ${sizeClass} htmx-indicator"${ariaLabelAttr}></span>`;
};

/**
 * Renders a skeleton placeholder.
 */
export const renderSkeleton = (options?: {
  readonly className?: string;
  readonly width?: string;
  readonly height?: string;
}): string => {
  const widthClass = options?.width ? `w-[${options.width}]` : "";
  const heightClass = options?.height ? `h-[${options.height}]` : "";
  const classes = ["skeleton", widthClass, heightClass, options?.className ?? ""]
    .filter(Boolean)
    .join(" ");

  return `<div class="${classes}"></div>`;
};

/* ------------------------------------------------------------------ */
/* Progress Components                                                */
/* ------------------------------------------------------------------ */

/**
 * Renders a progress bar.
 */
export const renderProgress = (
  value: number,
  max: number = 100,
  options?: {
    readonly colorToken?: ColorToken;
    readonly className?: string;
    readonly ariaLabel?: string;
  },
): string => {
  const colorClass = options?.colorToken ? `progress-${options.colorToken}` : "";
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(safeMax, Math.round(value))) : 0;
  const percentageLabel = `${Math.round((safeValue / safeMax) * 100)}%`;
  const ariaLabelText = options?.ariaLabel ?? percentageLabel;
  const ariaLabelAttr = ` aria-label="${escapeHtml(ariaLabelText)}"`;

  return `<progress class="progress ${colorClass} ${options?.className ?? ""}" value="${safeValue}" max="${safeMax}"${ariaLabelAttr}></progress>`;
};

/**
 * Renders a radial progress indicator.
 */
export const renderRadialProgress = (
  value: number,
  options?: {
    readonly colorToken?: ColorToken;
    readonly className?: string;
    readonly ariaLabel?: string;
  },
): string => {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  const colorClass = options?.colorToken ? `text-${options.colorToken}` : "";
  const valueClass = `[--value:${safeValue}]`;
  const ariaLabelAttr = options?.ariaLabel ? ` aria-label="${escapeHtml(options.ariaLabel)}"` : "";

  return `<div class="radial-progress ${valueClass} ${colorClass} ${
    options?.className ?? ""
  }" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${safeValue}"${ariaLabelAttr}>${safeValue}%</div>`;
};

/* ------------------------------------------------------------------ */
/* Kbd Component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Renders a keyboard key hint.
 */
export const renderKbd = (
  keys: readonly string[],
  options?: { readonly className?: string },
): string => {
  const kbdItems = keys.map((key) => `<kbd class="kbd kbd-sm">${escapeHtml(key)}</kbd>`).join("");

  const classes = ["flex", "items-center", "gap-1", options?.className ?? ""]
    .filter(Boolean)
    .join(" ");

  return `<span class="${classes}">${kbdItems}</span>`;
};

/* ------------------------------------------------------------------ */
/* Timeline Component                                                 */
/* ------------------------------------------------------------------ */

/**
 * Timeline item configuration.
 */
export interface TimelineItem {
  /** Item content. */
  readonly content: string;
  /** Optional title. */
  readonly title?: string;
  /** Optional icon SVG. */
  readonly icon?: string;
  /** Optional status color. */
  readonly status?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral";
}

/**
 * Renders a timeline component.
 */
export const renderTimeline = (
  items: readonly TimelineItem[],
  options?: { readonly compact?: boolean; readonly className?: string },
): string => {
  const compactClass = options?.compact ? "timeline-compact" : "";
  const containerClasses = ["timeline", "timeline-vertical", compactClass, options?.className ?? ""]
    .filter(Boolean)
    .join(" ");

  const timelineItems = items
    .map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === items.length - 1;
      const hrBefore = isFirst ? "" : '<hr class="bg-primary/20" />';
      const hrAfter = isLast ? "" : '<hr class="bg-primary/20" />';

      const statusClass = item.status ? `text-${item.status}` : "";
      const iconDefault = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true"><circle cx="10" cy="10" r="5" /></svg>`;
      const icon = item.icon ?? iconDefault;

      const titleHtml = item.title
        ? `<div class="font-medium">${escapeHtml(item.title)}</div>`
        : "";
      const contentHtml = `<div class="text-sm text-base-content/70">${item.content}</div>`;

      return `<li>
  ${hrBefore}
  <div class="timeline-middle ${statusClass}">${icon}</div>
  <div class="timeline-end timeline-box bg-base-200/60 border-base-300/50">${titleHtml}${contentHtml}</div>
  ${hrAfter}
</li>`;
    })
    .join("");

  return `<ul class="${containerClasses}" role="list">${timelineItems}</ul>`;
};
