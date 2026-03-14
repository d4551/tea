import { describe, expect, test } from "bun:test";
import {
  renderButton,
  renderField,
  renderProgress,
  renderRadialProgress,
} from "../src/views/shared/ui-components.ts";

describe("renderButton", () => {
  test("renders htmx params as a single serialized attribute set", () => {
    const html = renderButton({
      label: "Action",
      type: "button",
      htmx: {
        get: "/projects/new",
        params: {
          goal: "review",
          locale: "en-US",
        },
      },
    });

    expect(html).toContain('hx-get="/projects/new"');
    expect(html).toContain('hx-params="goal,locale"');
    expect(html).toContain(
      'hx-vals="{&quot;goal&quot;:&quot;review&quot;,&quot;locale&quot;:&quot;en-US&quot;}"',
    );
  });

  test("does not emit inline click handlers and defaults to a non-submitting button type", () => {
    const html = renderButton({
      label: "Action",
      htmx: {
        post: "/projects/new",
      },
    });

    expect(html).not.toContain("onclick=");
    expect(html).toContain('type="button"');
  });

  test("clamps progress value to max and emits safe value", () => {
    const html = renderProgress(250, 150);

    expect(html).toContain('value="150"');
    expect(html).toContain('max="150"');
    expect(html).toContain('aria-label="100%"');
  });

  test("renders radial progress with DaisyUI --value class binding", () => {
    const html = renderRadialProgress(87);

    expect(html).toContain("[--value:87]");
    expect(html).toContain('aria-valuenow="87"');
    expect(html).toContain(">87%</div>");
  });

  test("adds field-describedby and aria-invalid on validation errors", () => {
    const html = renderField({
      name: "questName",
      label: "Quest name",
      type: "text",
      value: "test",
      helpText: "Choose a unique quest title.",
      error: "Name is already used.",
    });

    expect(html).toContain('aria-describedby="questName-help questName-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('id="questName-help"');
    expect(html).toContain('id="questName-error"');
  });

  test("omits aria-describedby when no help/error metadata exists", () => {
    const html = renderField({
      name: "inventoryCode",
      label: "Inventory code",
      type: "text",
      value: "A1",
    });

    expect(html).not.toContain("aria-describedby=");
    expect(html).not.toContain('aria-invalid="true"');
  });
});
