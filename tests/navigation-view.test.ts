import { describe, expect, test } from "bun:test";
import {
  paginateWorkspaceItems,
  renderWorkspaceBrowseControls,
} from "../src/views/builder/workspace-shell.ts";
import {
  type NavigationGroup,
  renderActionDropdown,
  renderCollapsibleSidebarMenu,
  renderSecondaryNav,
} from "../src/views/shared/navigation.ts";

describe("shared navigation renderers", () => {
  test("renders grouped sidebar navigation with active state and htmx targeting", () => {
    const groups: readonly NavigationGroup[] = [
      {
        title: "Overview",
        items: [
          {
            key: "dashboard",
            label: "Dashboard",
            href: "/projects/test/start?lang=en-US",
            active: true,
            icon: "<svg></svg>",
            htmx: {
              target: "#main-content",
              swap: "innerHTML",
              pushUrl: true,
            },
          },
        ],
      },
      {
        title: "Runtime",
        items: [
          {
            key: "play",
            label: "Play",
            href: "/projects/test/playtest?lang=en-US",
            icon: "<svg></svg>",
          },
        ],
      },
    ];

    const html = renderCollapsibleSidebarMenu(groups, {
      ariaLabel: "Builder navigation",
      brandHtml: "<span>TEA</span>",
    });

    expect(html).toContain('aria-label="Builder navigation"');
    expect(html).toContain("Overview");
    expect(html).toContain("Runtime");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('hx-target="#main-content"');
    expect(html).toContain('hx-swap="innerHTML"');
    expect(html).toContain('hx-push-url="true"');
    expect(html).toContain("surface-scroll-fade-y");
  });

  test("renders secondary navigation with horizontal overflow wrapper", () => {
    const html = renderSecondaryNav(
      [
        {
          key: "status",
          label: "Status",
          href: "/projects/test/settings?lang=en-US",
          htmx: {
            get: "/projects/test/settings?lang=en-US",
            target: "#main-content",
            swap: "innerHTML",
            pushUrl: true,
          },
        },
        { key: "tools", label: "Tools", href: "/projects/test/settings/tools?lang=en-US" },
      ],
      "status",
      "AI tabs",
      "secondary",
    );

    expect(html).toContain(
      'class="surface-scroll surface-scroll-x surface-scroll-fade-x touch-pan-x px-1 pb-1"',
    );
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="AI tabs"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("tab-active");
    expect(html).toContain('hx-get="/projects/test/settings?lang=en-US"');
    expect(html).toContain('hx-target="#main-content"');
    expect(html).toContain('hx-swap="innerHTML"');
    expect(html).toContain('hx-push-url="true"');
  });

  test("adds locale metadata to linked secondary tabs", () => {
    const html = renderSecondaryNav(
      [
        {
          key: "status",
          label: "状态",
          href: "/projects/test/settings?lang=zh-CN",
          linkLanguage: "zh-CN",
        },
      ],
      "status",
      "AI tabs",
    );

    expect(html).toContain('hreflang="zh-CN"');
    expect(html).toContain('lang="zh-CN"');
  });

  test("renders action dropdown entries without placeholder hrefs", () => {
    const html = renderActionDropdown(
      "Asset actions",
      '<span class="btn btn-ghost btn-xs">Open</span>',
      [
        {
          key: "open-source",
          label: "Open source",
          href: "/public/assets/item.png",
          target: "_blank",
          rel: "noreferrer",
        },
      ],
      { widthClass: "w-40" },
    );

    expect(html).toContain('class="dropdown dropdown-end"');
    expect(html).toContain('href="/public/assets/item.png"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).not.toContain('href="#"');
  });

  test("renders server-driven browse controls with pagination state", () => {
    const html = renderWorkspaceBrowseControls({
      action: "/projects/test/world?lang=en-US",
      search: "tea",
      searchLabel: "Filter scenes",
      searchPlaceholder: "Search scenes",
      submitLabel: "Filter results",
      resultsLabel: "Results",
      previousLabel: "Previous",
      nextLabel: "Next",
      pageLabel: "Page",
      page: 2,
      totalPages: 3,
      totalItems: 14,
      startIndex: 7,
      endIndex: 12,
      hiddenFields: { lang: "en-US", projectId: "test", sceneId: "tea-house" },
      htmxTarget: "#builder-content",
      previousHref: "/projects/test/world?lang=en-US&page=1",
      nextHref: "/projects/test/world?lang=en-US&page=3",
    });

    expect(html).toContain('hx-get="/projects/test/world?lang=en-US"');
    expect(html).toContain('hx-target="#builder-content"');
    expect(html).toContain('name="search"');
    expect(html).toContain('name="page" value="1"');
    expect(html).toContain('name="sceneId" value="tea-house"');
    expect(html).toContain("Results: 7-12 / 14");
    expect(html).toContain("Page 2 / 3");
  });

  test("paginates workspace items with clamped page metadata", () => {
    const paginated = paginateWorkspaceItems(["a", "b", "c", "d", "e"], 99, 2);

    expect(paginated.items).toEqual(["e"]);
    expect(paginated.page).toBe(3);
    expect(paginated.totalPages).toBe(3);
    expect(paginated.startIndex).toBe(5);
    expect(paginated.endIndex).toBe(5);
  });
});
