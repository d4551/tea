import { describe, expect, test } from "bun:test";
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
            href: "/builder?lang=en-US&projectId=test",
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
            href: "/game?lang=en-US&projectId=test",
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
  });

  test("renders secondary navigation with horizontal overflow wrapper", () => {
    const html = renderSecondaryNav(
      [
        { key: "status", label: "Status", href: "/builder/ai?lang=en-US&projectId=test" },
        { key: "tools", label: "Tools", href: "/builder/ai/tools?lang=en-US&projectId=test" },
      ],
      "status",
      "AI tabs",
      "secondary",
    );

    expect(html).toContain('class="overflow-x-auto pb-1"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="AI tabs"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("tab-active");
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
    expect(html).not.toContain('href="#"');
  });
});
