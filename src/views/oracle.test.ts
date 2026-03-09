import { describe, expect, test } from "bun:test";
import { getMessages } from "../shared/i18n/translator.ts";
import { renderOraclePanel, toOraclePanelState } from "./oracle.ts";

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
});
