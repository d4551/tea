import { escapeHtml, getHtmx, resolveExtensionElement } from "./shared.ts";

const htmx = getHtmx();

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
      const loadingTitle = dataset.loadingTitle ?? rootDataset.loadingTitle ?? "";
      const loadingDescription = dataset.loadingDescription ?? rootDataset.loadingDescription ?? "";
      const sendErrorMessage = dataset.sendErrorMessage ?? rootDataset.sendErrorMessage ?? "";
      const responseErrorMessage =
        dataset.responseErrorMessage ?? rootDataset.responseErrorMessage ?? "";
      const indicator =
        root?.querySelector(`#${indicatorId}`) ?? document.getElementById(indicatorId);
      const panel = document.getElementById(panelId);

      if (!(indicator instanceof HTMLElement)) {
        return;
      }

      if (name === "htmx:beforeRequest") {
        indicator.textContent = loadingTitle;
        indicator.setAttribute("aria-busy", "true");
        if (element instanceof HTMLElement) {
          element.setAttribute("aria-busy", "true");
        }
        if (panel instanceof HTMLElement) {
          panel.setAttribute("aria-busy", "true");
          panel.innerHTML = `<div class="card-body">
  <h3 class="card-title text-info">${escapeHtml(loadingTitle)}</h3>
  <p>${escapeHtml(loadingDescription)}</p>
</div>`;
          panel.className = "card border border-info/30 bg-info/10";
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
      if (element instanceof HTMLElement) {
        element.removeAttribute("aria-busy");
      }
      panel?.removeAttribute("aria-busy");
    },
  });
}
