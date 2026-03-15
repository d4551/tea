import { describe, expect, test } from "bun:test";
import type { BuilderAsset } from "../../shared/contracts/game.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { renderAssetsEditor } from "./assets-editor.ts";

const baseAsset = {
  sceneMode: "2d",
  tags: [],
  variants: [],
  approved: false,
  createdAtMs: 0,
  updatedAtMs: 0,
} as const satisfies Pick<
  BuilderAsset,
  "sceneMode" | "tags" | "variants" | "approved" | "createdAtMs" | "updatedAtMs"
>;

describe("renderAssetsEditor", () => {
  test("renders explicit empty selection states and disables clip creation without a selected asset", () => {
    const messages = getMessages("en-US");
    const html = renderAssetsEditor(messages, "en-US", "default", [], []);

    expect(html).toContain(messages.builder.assetSelectionRequired);
    expect(html).toContain('disabled aria-disabled="true"');
    expect(html).not.toContain(messages.builder.advancedTools);
  });

  test("renders a clear unavailable preview state for non-visual asset kinds", () => {
    const messages = getMessages("en-US");
    const html = renderAssetsEditor(messages, "en-US", "default", [
      {
        ...baseAsset,
        id: "asset.audio.wind",
        kind: "audio",
        label: "Wind Loop",
        source: "/public/uploads/wind.wav",
        sourceFormat: "wav",
        sourceMimeType: "audio/wav",
      },
    ], []);

    expect(html).toContain(messages.builder.assetPreviewUnavailable);
  });
});
