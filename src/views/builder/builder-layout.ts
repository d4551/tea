/**
 * Builder Layout
 *
 * Server-rendered DaisyUI drawer layout for the game builder dashboard.
 * Provides persistent sidebar navigation and content area for HTMX swaps.
 */
import { appConfig, type LocaleCode } from "../../config/environment.ts";
import { appRoutes, withLocaleQuery } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

/**
 * Sidebar navigation items for the builder.
 */
const builderNavItems = (messages: Messages) =>
  [
    { key: "dashboard", label: messages.builder.dashboard, href: appRoutes.builder, icon: "📊" },
    { key: "scenes", label: messages.builder.scenes, href: appRoutes.builderScenes, icon: "🏯" },
    { key: "npcs", label: messages.builder.npcs, href: appRoutes.builderNpcs, icon: "👤" },
    {
      key: "dialogue",
      label: messages.builder.dialogue,
      href: appRoutes.builderDialogue,
      icon: "💬",
    },
    { key: "assets", label: messages.builder.assets, href: appRoutes.builderAssets, icon: "🎨" },
    { key: "ai", label: messages.builder.ai, href: appRoutes.builderAi, icon: "🤖" },
  ] as const;

/**
 * Renders the builder drawer layout wrapping page content.
 *
 * @param props Layout inputs.
 * @returns HTML string with DaisyUI drawer and sidebar navigation.
 */
export const renderBuilderLayout = (props: {
  locale: LocaleCode;
  messages: Messages;
  activeTab: string;
  body: string;
}): string => {
  const { locale, messages, activeTab, body } = props;
  const navItems = builderNavItems(messages);

  const sidebarItems = navItems
    .map((item) => {
      const isActive = item.key === activeTab;
      const activeClass = isActive ? "menu-active font-semibold" : "";
      const ariaCurrent = isActive ? ' aria-current="page"' : "";
      const href = withLocaleQuery(item.href, locale);
      return `<li>
        <a class="${activeClass}" href="${escapeHtml(href)}"${ariaCurrent}
           aria-label="${escapeHtml(item.label)}"
           hx-get="${escapeHtml(href)}" hx-target="#builder-content" hx-push-url="true" hx-swap="innerHTML">
          <span aria-hidden="true">${item.icon}</span> ${escapeHtml(item.label)}
        </a>
      </li>`;
    })
    .join("");

  return `
    <div class="drawer bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--color-base-200)_42%,transparent),transparent)] lg:drawer-open">
      <input id="builder-drawer" type="checkbox" class="drawer-toggle" aria-label="${escapeHtml(messages.common.openMenu)}" />

      <div class="drawer-content flex flex-col min-h-screen">
        <!-- Mobile navbar -->
        <nav class="navbar border-b border-base-300 bg-base-100/90 backdrop-blur lg:hidden" role="navigation" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="flex-none">
            <label for="builder-drawer" class="btn btn-square btn-ghost" aria-label="${escapeHtml(messages.common.openMenu)}">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <span class="text-lg font-semibold">${escapeHtml(messages.builder.title)}</span>
          </div>
          <div class="flex-none">
            <a href="${escapeHtml(withLocaleQuery(appRoutes.game, locale))}" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(messages.navigation.game)}">
              <span aria-hidden="true">🎮</span> ${escapeHtml(messages.navigation.game)}
            </a>
          </div>
        </nav>

        <!-- Page content -->
        <main id="builder-content" class="flex-1 p-6" role="main" aria-live="polite">
          ${body}
        </main>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side z-99">
        <label for="builder-drawer" class="drawer-overlay" aria-label="${escapeHtml(messages.builder.closeSidebar)}"></label>
        <aside class="min-h-full w-72 border-r border-base-300 bg-base-200/85 backdrop-blur" role="complementary" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="border-b border-base-300 p-4">
            <a href="${escapeHtml(withLocaleQuery(appRoutes.builder, locale))}" class="flex items-center gap-2 text-xl font-bold" aria-label="${escapeHtml(messages.builder.title)}">
              <span aria-hidden="true">🏗️</span> ${escapeHtml(messages.builder.title)}
            </a>
            <p class="mt-2 text-sm text-base-content/65">${escapeHtml(messages.builder.flowDescription)}</p>
          </div>
          <nav aria-label="${escapeHtml(messages.builder.title)}">
            <ul class="menu p-4 gap-1">
              ${sidebarItems}
            </ul>
          </nav>
          <div class="mt-auto space-y-3 border-t border-base-300 p-4">
            <div class="rounded-box border border-base-300 bg-base-100/80 p-3 text-sm">
              <div class="font-medium">${escapeHtml(messages.builder.localRuntimeTitle)}</div>
              <div class="mt-1 text-base-content/65">${escapeHtml(appConfig.ai.transformersCacheDirectory)}</div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <a href="${escapeHtml(withLocaleQuery(appRoutes.game, locale))}" class="btn btn-primary btn-sm w-full" aria-label="${escapeHtml(messages.navigation.game)}">
                <span aria-hidden="true">🎮</span> ${escapeHtml(messages.navigation.game)}
              </a>
              <a href="${escapeHtml(appConfig.api.docsPath)}" class="btn btn-outline btn-sm w-full" aria-label="${escapeHtml(messages.builder.docsLabel)}">
                ${escapeHtml(messages.builder.docsLabel)}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>`;
};
