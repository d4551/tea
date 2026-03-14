/**
 * Focus-trap and close-event management for game page modals.
 *
 * Handles save-slot, load-slot, and key-bindings dialogs:
 * - Traps Tab/Shift-Tab within the active `.modal-box`
 * - Restores focus to the trigger element on close
 * - Supports `data-modal-trigger` attributes for declarative modal opening
 */

const getFocusables = (root: Element): HTMLElement[] =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (el) =>
      !(
        (el instanceof HTMLButtonElement ||
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement) &&
        el.disabled
      ) && el.offsetParent !== null,
  );

const trapFocus = (event: KeyboardEvent, dialogElement: HTMLDialogElement): void => {
  if (event.key !== "Tab") {
    return;
  }

  const box = dialogElement.querySelector(".modal-box");
  if (!box) {
    return;
  }

  const focusables = getFocusables(box);
  if (focusables.length === 0) {
    return;
  }

  const first = focusables[0] as HTMLElement | undefined;
  const last = focusables[focusables.length - 1] as HTMLElement | undefined;

  if (!first || !last) {
    return;
  }

  if (event.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }
};

const wireDialog = (
  dialogId: string,
  focusState: { focusedBeforeOpen: Element | null },
): void => {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
  if (!dialog) {
    return;
  }

  dialog.addEventListener("toggle", () => {
    if (dialog.open) {
      focusState.focusedBeforeOpen = document.activeElement;
    } else {
      const returnTarget =
        focusState.focusedBeforeOpen instanceof HTMLElement
          ? focusState.focusedBeforeOpen
          : null;
      if (returnTarget) {
        returnTarget.focus();
      }
    }
  });

  dialog.addEventListener("keydown", (event) => {
    trapFocus(event, dialog);
  });
};

const boot = (): void => {
  const focusState = { focusedBeforeOpen: null as Element | null };

  wireDialog("save_slot_modal", focusState);
  wireDialog("load_slot_modal", focusState);
  wireDialog("key_bindings_modal", focusState);

  document.body.addEventListener("closeSaveModal", () => {
    const saveModal = document.getElementById("save_slot_modal") as HTMLDialogElement | null;
    if (saveModal) {
      saveModal.close();
    }
  });

  /** Declarative modal opening via `data-modal-trigger` attribute. */
  document.addEventListener("click", (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-modal-trigger]");
    if (!trigger) {
      return;
    }

    const targetId = trigger.dataset.modalTrigger;
    if (!targetId) {
      return;
    }

    const dialog = document.getElementById(targetId) as HTMLDialogElement | null;
    if (dialog) {
      dialog.showModal();
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
