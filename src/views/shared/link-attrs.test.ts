import { describe, expect, test } from "bun:test";
import { buildLinkRelationship, renderLinkAttrs, renderLinkMetadataAttrs } from "./link-attrs.ts";

describe("shared link attribute helpers", () => {
  test("adds safe external-link relationships without duplicating caller values", () => {
    expect(buildLinkRelationship("_blank", "noreferrer custom noreferrer")).toBe(
      "noreferrer custom noopener",
    );
  });

  test("renders locale metadata and explicit ids for localized links", () => {
    const html = renderLinkMetadataAttrs({
      href: "/builder?lang=zh-CN",
      ariaLabel: "Builder",
      id: "builder-link",
      linkLanguage: "zh-CN",
    });

    expect(html).toContain('href="/builder?lang=zh-CN"');
    expect(html).toContain('aria-label="Builder"');
    expect(html).toContain('id="builder-link"');
    expect(html).toContain('hreflang="zh-CN"');
    expect(html).toContain('lang="zh-CN"');
  });

  test("renders aria-current only for active links with hrefs", () => {
    expect(
      renderLinkAttrs({
        href: "/projects/test/start?lang=en-US",
        active: true,
      }),
    ).toContain('aria-current="page"');

    expect(renderLinkAttrs({ active: true })).toBe("");
  });
});
