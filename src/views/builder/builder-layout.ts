/**
 * Builder Layout
 *
 * Server-rendered DaisyUI drawer layout for the game builder dashboard.
 * Provides persistent sidebar navigation and content area for HTMX swaps.
 */
import type { LocaleCode } from "../../config/environment.ts";
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
    <div class="drawer lg:drawer-open">
      <input id="builder-drawer" type="checkbox" class="drawer-toggle" aria-label="${escapeHtml(messages.common.openMenu)}" />

      <div class="drawer-content flex flex-col min-h-screen">
        <!-- Mobile navbar -->
        <nav class="navbar bg-base-100 border-b border-base-300 lg:hidden" role="navigation" aria-label="${escapeHtml(messages.builder.title)}">
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
        <main id="builder-content" class="flex-1 p-6 bg-base-200/30" role="main" aria-live="polite">
          ${body}
        </main>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side z-99">
        <label for="builder-drawer" class="drawer-overlay" aria-label="${escapeHtml(messages.builder.closeSidebar)}"></label>
        <aside class="bg-base-200 min-h-full w-72 flex flex-col" role="complementary" aria-label="${escapeHtml(messages.builder.title)}">
          <div class="p-4 border-b border-base-300">
            <a href="${escapeHtml(withLocaleQuery(appRoutes.builder, locale))}" class="text-xl font-bold flex items-center gap-2" aria-label="${escapeHtml(messages.builder.title)}">
              <span aria-hidden="true">🏗️</span> ${escapeHtml(messages.builder.title)}
            </a>
          </div>
          <nav aria-label="${escapeHtml(messages.builder.title)}">
            <ul class="menu p-4 gap-1">
              ${sidebarItems}
            </ul>
          </nav>
          <div class="mt-auto p-4 border-t border-base-300">
            <a href="${escapeHtml(withLocaleQuery(appRoutes.game, locale))}" class="btn btn-primary btn-sm w-full" aria-label="${escapeHtml(messages.navigation.game)}">
              <span aria-hidden="true">🎮</span> ${escapeHtml(messages.navigation.game)}
            </a>
          </div>
        </aside>
      </div>
    </div>`;
};
