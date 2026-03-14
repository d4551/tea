/**
 * SSE error handler for the game page.
 *
 * Reveals the reconnect button when an HTMX SSE error event fires.
 */

const boot = (): void => {
  document.body.addEventListener("htmx:sseError", () => {
    const reconnectButton = document.getElementById("game-reconnect");
    if (reconnectButton) {
      reconnectButton.classList.remove("hidden");
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
