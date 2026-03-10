import { getHtmx, resolveExtensionElement } from "./shared.ts";

const htmx = getHtmx();

const resolveOracleForm = (root: Element | null): HTMLFormElement | null => {
  if (root instanceof HTMLFormElement) {
    return root;
  }

  return root?.closest("form") ?? null;
};

const resolveLoadingPanel = (templateId: string, question: string): HTMLElement | null => {
  const template = document.getElementById(templateId);
  if (!(template instanceof HTMLTemplateElement)) {
    return null;
  }

  const fragment = template.content.cloneNode(true);
  if (!(fragment instanceof DocumentFragment)) {
    return null;
  }

  const panel = fragment.firstElementChild;
  if (!(panel instanceof HTMLElement)) {
    return null;
  }

  const questionTarget = panel.querySelector<HTMLElement>('[data-oracle-loading-question="true"]');
  if (questionTarget) {
    questionTarget.textContent = question;
  }

  return panel;
};

if (htmx) {
  htmx.defineExtension("oracle-indicator", {
    onEvent(name, event) {
      const element = resolveExtensionElement(event);
      if (!element) {
        return;
      }

      const root = element.closest("form, section, div");
      const dataset = element instanceof HTMLElement ? element.dataset : {};
      const rootDataset = root instanceof HTMLElement ? root.dataset : {};
      const indicatorId =
        dataset.oracleIndicatorId ?? rootDataset.oracleIndicatorId ?? "oracle-loading";
      const panelId = dataset.oraclePanelId ?? rootDataset.oraclePanelId ?? "oracle-panel";
      const loadingTemplateId =
        dataset.oracleLoadingTemplateId ??
        rootDataset.oracleLoadingTemplateId ??
        "oracle-loading-template";
      const loadingTitle = dataset.loadingTitle ?? rootDataset.loadingTitle ?? "";
      const sendErrorMessage = dataset.sendErrorMessage ?? rootDataset.sendErrorMessage ?? "";
      const responseErrorMessage =
        dataset.responseErrorMessage ?? rootDataset.responseErrorMessage ?? "";
      const indicator =
        root?.querySelector(`#${indicatorId}`) ?? document.getElementById(indicatorId);
      const panel = document.getElementById(panelId);
      const form = resolveOracleForm(root);

      if (!(indicator instanceof HTMLElement)) {
        return;
      }

      if (name === "htmx:beforeRequest") {
        indicator.textContent = loadingTitle;
        indicator.setAttribute("aria-busy", "true");
        if (form instanceof HTMLElement) {
          form.setAttribute("aria-busy", "true");
        }
        if (panel instanceof HTMLElement) {
          const question =
            form?.querySelector<HTMLInputElement>('input[name="question"]')?.value.trim() ?? "";
          const loadingPanel = resolveLoadingPanel(loadingTemplateId, question);
          if (loadingPanel instanceof HTMLElement) {
            panel.replaceWith(loadingPanel);
          } else {
            panel.setAttribute("aria-busy", "true");
          }
        }
        return;
      }

      if (name === "htmx:sseMessage") {
        indicator.textContent = indicator.textContent?.endsWith("\u25ae")
          ? loadingTitle
          : `${loadingTitle} \u25ae`;
        return;
      }

      if (name === "htmx:afterSwap") {
        indicator.textContent = "";
      } else if (name === "htmx:responseError") {
        indicator.textContent = responseErrorMessage;
      } else if (name === "htmx:sendError") {
        indicator.textContent = sendErrorMessage;
      } else {
        return;
      }

      indicator.removeAttribute("aria-busy");
      if (form instanceof HTMLElement) {
        form.removeAttribute("aria-busy");
      }
      document.getElementById(panelId)?.removeAttribute("aria-busy");
    },
  });
}
