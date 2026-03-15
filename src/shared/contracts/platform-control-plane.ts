import type {
  AutomationRunStatus,
  BuilderAssetKind,
  GenerationJobStatus,
  SceneMode,
  StarterProjectTemplateId,
} from "./game.ts";

/**
 * Explicit ownership scope contract shared by platform surfaces.
 */
export type OwnershipScope = "global" | "organization" | "project" | "release" | "session";

/**
 * Stable workspace identifiers for the top-level control plane.
 */
export type ControlPlaneWorkspaceId =
  | "games"
  | "libraries"
  | "templates"
  | "capabilities"
  | "releases"
  | "review";

/**
 * One typed scope reference used to label control-plane records.
 */
export interface ScopeReference {
  /** Ownership layer for the referenced record. */
  readonly scope: OwnershipScope;
  /** Stable identifier within the chosen scope. */
  readonly scopeId: string;
  /** Human-readable name for the referenced scope. */
  readonly label: string;
}

/**
 * Link record used instead of copying shared resources into projects.
 */
export interface ProjectAttachmentLink {
  /** Stable project identifier that consumes the shared record. */
  readonly projectId: string;
  /** Shared resource scope metadata. */
  readonly source: ScopeReference;
  /** Optional attachment label shown in the UI. */
  readonly label?: string;
}

/**
 * Project/game summary shown in control-plane portfolio views.
 */
export interface PlatformGameSummary {
  /** Stable project identifier. */
  readonly id: string;
  /** Game or app name. */
  readonly name: string;
  /** Supporting subtitle. */
  readonly subtitle: string;
  /** Owning scope metadata. */
  readonly scope: ScopeReference;
  /** Latest mutable draft version. */
  readonly version: number;
  /** Latest immutable release version. */
  readonly latestReleaseVersion: number;
  /** Currently published release version, when available. */
  readonly publishedReleaseVersion: number | null;
  /** Whether the project is published. */
  readonly published: boolean;
  /** Starter template provenance. */
  readonly templateId: StarterProjectTemplateId;
  /** Updated timestamp in epoch milliseconds. */
  readonly lastUpdatedAtMs: number;
  /** Count of authored scenes. */
  readonly sceneCount: number;
  /** Count of shared and project assets. */
  readonly assetCount: number;
  /** Count of reviewable artifacts. */
  readonly reviewCount: number;
}

/**
 * Shared library aggregate exposed by the control plane.
 */
export interface AssetLibrary {
  /** Stable library identifier. */
  readonly id: string;
  /** Owning scope metadata. */
  readonly scope: ScopeReference;
  /** Visible library name. */
  readonly name: string;
  /** Supporting description. */
  readonly description: string;
  /** Number of items inside the library. */
  readonly assetCount: number;
  /** Number of attached projects sourcing items from the library. */
  readonly attachedProjectCount: number;
}

/**
 * Shared asset record normalized for cross-project browsing.
 */
export interface SharedAsset {
  /** Stable shared asset identifier. */
  readonly id: string;
  /** Owning library identifier. */
  readonly libraryId: string;
  /** Display label. */
  readonly label: string;
  /** Canonical asset kind. */
  readonly kind: BuilderAssetKind;
  /** Runtime scene mode compatibility. */
  readonly sceneMode: SceneMode;
  /** Browser-accessible source or preview URL. */
  readonly source: string;
  /** Whether the asset is approved for runtime use. */
  readonly approved: boolean;
  /** Source ownership metadata. */
  readonly scope: ScopeReference;
  /** Project attachment links consuming this asset. */
  readonly attachments: readonly ProjectAttachmentLink[];
}

/**
 * Starter or reusable project template available in the platform catalog.
 */
export interface ProjectTemplate {
  /** Stable template identifier. */
  readonly id: string;
  /** Template ownership metadata. */
  readonly scope: ScopeReference;
  /** Human-readable template name. */
  readonly name: string;
  /** Supporting description. */
  readonly description: string;
  /** Backing starter template id. */
  readonly starterTemplateId: StarterProjectTemplateId;
  /** Default authored scene mode. */
  readonly defaultSceneMode: SceneMode;
  /** Whether the template is recommended. */
  readonly recommended: boolean;
}

/**
 * Capability policy/profile entry shown in the control plane.
 */
export interface CapabilityProfile {
  /** Stable profile identifier. */
  readonly id: string;
  /** Capability profile ownership metadata. */
  readonly scope: ScopeReference;
  /** Human-readable profile name. */
  readonly name: string;
  /** Supporting description. */
  readonly description: string;
  /** Health summary state. */
  readonly status: "ready" | "degraded" | "offline";
  /** Number of settings or lanes contained in the profile. */
  readonly settingCount: number;
  /** Number of ready provider lanes. */
  readonly readyLaneCount: number;
  /** Number of degraded or offline provider lanes. */
  readonly issueLaneCount: number;
  /** Stable provider lanes included in the profile. */
  readonly lanes: readonly string[];
}

/**
 * Immutable release summary used by the release workspace.
 */
export interface ReleaseRecord {
  /** Stable logical release identifier. */
  readonly id: string;
  /** Source project identifier. */
  readonly projectId: string;
  /** Project name shown in UI. */
  readonly projectName: string;
  /** Release ownership metadata. */
  readonly scope: ScopeReference;
  /** Immutable release version. */
  readonly version: number;
  /** Whether this is the active published release. */
  readonly published: boolean;
  /** Last update timestamp in epoch milliseconds. */
  readonly updatedAtMs: number;
}

/**
 * Unified review queue item exposed across generation and automation.
 */
export interface ReviewQueueItem {
  /** Stable queue item identifier. */
  readonly id: string;
  /** Project identifier owning the review item. */
  readonly projectId: string;
  /** Project name shown in UI. */
  readonly projectName: string;
  /** Queue item scope metadata. */
  readonly scope: ScopeReference;
  /** Control-plane lane for the item. */
  readonly lane: "generation" | "artifact" | "automation";
  /** Human-readable title. */
  readonly title: string;
  /** Supporting summary. */
  readonly summary: string;
  /** Review status. */
  readonly status: GenerationJobStatus | AutomationRunStatus | "pending-review" | "approved";
  /** Creation timestamp in epoch milliseconds. */
  readonly createdAtMs: number;
}

/**
 * Complete aggregated snapshot used to render control-plane pages.
 */
export interface ControlPlaneSnapshot {
  /** Portfolio games/projects. */
  readonly games: readonly PlatformGameSummary[];
  /** Shared library groups. */
  readonly libraries: readonly AssetLibrary[];
  /** Cross-project assets derived into libraries. */
  readonly sharedAssets: readonly SharedAsset[];
  /** Reusable starter and scene-kit templates. */
  readonly templates: readonly ProjectTemplate[];
  /** Capability and provider policy profiles. */
  readonly capabilityProfiles: readonly CapabilityProfile[];
  /** Immutable release records. */
  readonly releases: readonly ReleaseRecord[];
  /** Unified review queue entries. */
  readonly reviewQueue: readonly ReviewQueueItem[];
  /** Number of global knowledge documents. */
  readonly globalKnowledgeDocumentCount: number;
}
