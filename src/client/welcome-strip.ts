/**
 * Welcome-strip first-visit reveal and dismiss handler.
 *
 * Reads `tea-forge-visited` from localStorage; when unset, reveals the
 * `#welcome-strip` element. The dismiss button sets the flag and hides the strip.
 */
import { readLocalStorage, writeLocalStorage } from "../shared/utils/browser-storage.ts";

const STORAGE_KEY = "tea-forge-visited";

const boot = (): void => {
  const strip = document.getElementById("welcome-strip");
  if (!strip) {
    return;
  }

  const visited = readLocalStorage(STORAGE_KEY);
  if (visited === null) {
    strip.classList.remove("hidden");
  }

  const dismissButton = strip.querySelector("button");
  if (dismissButton) {
    dismissButton.addEventListener("click", () => {
      writeLocalStorage(STORAGE_KEY, "true");
      strip.classList.add("hidden");
    });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
