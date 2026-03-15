import { describe, expect, test } from "bun:test";
import { getMessages } from "../shared/i18n/translator.ts";
import { renderOraclePanel, renderOracleSection, toOraclePanelState } from "./oracle.ts";

describe("oracle view contract", () => {
  test("maps retryable outcomes into the retryable UI state", () => {
    const panelState = toOraclePanelState(
      {
        state: "error",
        retryable: true,
        message: "Retry later.",
      },
      "auto",
      "Where should I go next?",
    );

    expect(panelState.state).toBe("error-retryable");
  });

  test("renders localized idle content and focus-management hooks", () => {
    const messages = getMessages("zh-CN");

    const html = renderOraclePanel(messages, {
      state: "idle",
      mode: "auto",
      question: "",
    });

    expect(html).toContain(messages.aiPlayground.idleHint);
    expect(html).toContain('data-focus-panel="true"');
    expect(html).toContain('hx-ext="focus-panel"');
  });

  test("renders loading state from the canonical panel contract", () => {
    const messages = getMessages("en-US");

    const html = renderOraclePanel(messages, {
      state: "loading",
      mode: "auto",
      question: "How should the river market sound?",
    });

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-oracle-loading-question="true"');
    expect(html).toContain("How should the river market sound?");
  });

  test("embeds a server-rendered loading template for client-side request feedback", () => {
    const messages = getMessages("en-US");

    const html = renderOracleSection(
      messages,
      {
        state: "idle",
        mode: "auto",
        question: "",
      },
      "en-US",
    );

    expect(html).toContain('data-oracle-loading-template-id="oracle-loading-template"');
    expect(html).toContain('<template id="oracle-loading-template">');
    expect(html).toContain('data-oracle-loading-question="true"');
  });

  test("renders page context hidden inputs for context-aware oracle requests", () => {
    const messages = getMessages("en-US");

    const html = renderOracleSection(
      messages,
      {
        state: "idle",
        mode: "auto",
        question: "",
      },
      "en-US",
      {
        variant: "drawer",
        pageContext: {
          currentPath: "/projects/abc/world",
          activeRoute: "builderScenes",
          projectId: "abc-123",
        },
      },
    );

    expect(html).toContain('<input type="hidden" name="context_path" value="/projects/abc/world" />');
    expect(html).toContain('<input type="hidden" name="context_route" value="builderScenes" />');
    expect(html).toContain('<input type="hidden" name="context_project" value="abc-123" />');
  });

  test("omits optional context_project when projectId is absent", () => {
    const messages = getMessages("en-US");

    const html = renderOracleSection(
      messages,
      {
        state: "idle",
        mode: "auto",
        question: "",
      },
      "en-US",
      {
        variant: "drawer",
        pageContext: {
          currentPath: "/projects/abc/world",
          activeRoute: "builderScenes",
        },
      },
    );

    expect(html).toContain('<input type="hidden" name="context_path" value="/projects/abc/world" />');
    expect(html).toContain('<input type="hidden" name="context_route" value="builderScenes" />');
    expect(html).not.toContain('name="context_project"');
  });

  test("switches layout classes between drawer and page variants", () => {
    const messages = getMessages("en-US");
    const panelState = {
      state: "idle",
      mode: "auto",
      question: "",
    } as const;

    const pageVariant = renderOracleSection(messages, panelState, "en-US", {
      variant: "page",
      pageContext: {
        currentPath: "/projects/abc/world",
        activeRoute: "builderScenes",
        projectId: "abc-123",
      },
    });
    const drawerVariant = renderOracleSection(messages, panelState, "en-US", {
      variant: "drawer",
      pageContext: {
        currentPath: "/projects/abc/world",
        activeRoute: "builderScenes",
        projectId: "abc-123",
      },
    });

    expect(pageVariant).toContain('class="grid gap-4 lg:grid-cols-[1.5fr_1fr]"');
    expect(pageVariant).toContain('class="card-title text-2xl"');
    expect(drawerVariant).toContain('class="flex flex-col gap-4 overflow-y-auto"');
    expect(drawerVariant).toContain('class="card-title text-lg"');
  });
});
