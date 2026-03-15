import type { CapabilityState, CapabilityStatus } from "../../shared/contracts/game.ts";
import type { Messages as MessageCatalog } from "../../shared/i18n/messages.ts";

/**
 * Resolves the localized label for one capability status.
 *
 * @param messages Locale-resolved message catalog.
 * @param status Capability status.
 * @returns Localized badge label.
 */
export const getCapabilityStatusLabel = (
  messages: MessageCatalog,
  status: CapabilityStatus,
): string => {
  switch (status) {
    case "ready":
      return messages.ai.statusAvailable;
    case "degraded":
      return messages.builder.readinessPartial;
    default:
      return messages.ai.statusUnavailable;
  }
};

/**
 * Resolves the DaisyUI badge class for one capability status.
 *
 * @param status Capability status.
 * @returns DaisyUI badge tone class.
 */
export const getCapabilityStatusBadgeClass = (status: CapabilityStatus): string => {
  switch (status) {
    case "ready":
      return "badge-success";
    case "degraded":
      return "badge-warning";
    default:
      return "badge-ghost";
  }
};

/**
 * Reports whether a capability should be rendered as executable.
 *
 * @param state Capability state.
 * @returns True when the capability is ready or degraded.
 */
export const isCapabilityUsable = (state: CapabilityState): boolean =>
  state.status !== "unavailable";
