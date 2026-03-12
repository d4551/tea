/**
 * HTMX Server Toast Extension
 *
 * Listens for the `showToast` HX-Trigger response header and renders
 * a DaisyUI toast notification. The header value is a JSON object:
 *
 * @example Server response header:
 *   HX-Trigger: {"showToast": {"message": "Project saved", "type": "success"}}
 */
import { escapeHtml } from "./shared.ts";

const CONTAINER_ID = "toast-container";
const DISMISS_MS = 4000;
const FADE_MS = 300;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Maps toast type to DaisyUI alert class. */
const alertClass = (type: string): string => {
  switch (type) {
    case "success":
      return "alert-success";
    case "error":
      return "alert-error";
    case "warning":
      return "alert-warning";
    default:
      return "alert-info";
  }
};

/** Maps toast type to a status SVG icon. */
const alertIcon = (type: string): string => {
  switch (type) {
    case "success":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    case "error":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    case "warning":
      return '<svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
    default:
      return '<svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
  }
};

/** Renders and auto-dismisses a toast notification. */
const showToast = (payload: unknown): void => {
  if (!isRecord(payload)) {
    return;
  }

  const message = payload["message"];
  if (typeof message !== "string") {
    return;
  }

  const typedType = payload["type"];

  const container = document.getElementById(CONTAINER_ID);
  if (!container) return;

  const type = typedType === "success" || typedType === "error" || typedType === "warning"
    ? typedType
    : "info";
  const el = document.createElement("div");
  el.className = `alert ${alertClass(type)} alert-soft shadow-lg transition-opacity duration-300 opacity-100`;
  el.setAttribute("role", "alert");
  el.setAttribute("aria-live", "assertive");
  el.innerHTML = `${alertIcon(type)}<span>${escapeHtml(message)}</span>`;

  container.appendChild(el);

  setTimeout(() => {
    el.classList.add("opacity-0");
    setTimeout(() => {
      el.remove();
    }, FADE_MS);
  }, DISMISS_MS);
};

document.body.addEventListener("showToast", (evt: Event) => {
  if (evt instanceof CustomEvent) {
    showToast(evt.detail);
  }
});
