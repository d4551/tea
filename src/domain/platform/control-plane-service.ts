import { getAiRuntimeProfile } from "../ai/local-runtime-profile.ts";
import { knowledgeBaseService } from "../ai/knowledge-base-service.ts";
import { ProviderRegistry } from "../ai/providers/provider-registry.ts";
import { builderService } from "../builder/builder-service.ts";
import type { BuilderProjectSnapshot } from "../builder/builder-project-state-store.ts";
import { recommendedStarterProjectTemplateId, resolveStarterProjectTemplateId, starterProjectTemplateIds } from "../builder/starter-projects.ts";
import type { AiRuntimeSettingValue } from "../ai/ai-runtime-settings-service.ts";
import type {
  AssetLibrary,
  CapabilityProfile,
  ControlPlaneSnapshot,
  OwnershipScope,
  PlatformGameSummary,
  ProjectAttachmentLink,
  ProjectTemplate,
  ReleaseRecord,
  ReviewQueueItem,
  ScopeReference,
  SharedAsset,
} from "../../shared/contracts/platform-control-plane.ts";

const organizationScopeId = "tea-studio";

const toTitleCase = (value: string): string =>
  value
    .split(/[-_]/g)
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const buildScopeReference = (
  scope: OwnershipScope,
  scopeId: string,
  label: string,
): ScopeReference => ({
  scope,
  scopeId,
  label,
});

const compareByUpdatedDesc = <T extends { readonly lastUpdatedAtMs: number }>(
  left: T,
  right: T,
): number => right.lastUpdatedAtMs - left.lastUpdatedAtMs;

const compareByCreatedDesc = <T extends { readonly createdAtMs: number }>(
  left: T,
  right: T,
): number => right.createdAtMs - left.createdAtMs;

const buildProjectAttachment = (
  projectId: string,
  projectName: string,
  label?: string,
): ProjectAttachmentLink => ({
  projectId,
  source: buildScopeReference("project", projectId, projectName),
  label,
});

const buildGames = (projects: readonly BuilderProjectSnapshot[]): readonly PlatformGameSummary[] =>
  projects
    .map((project) => ({
      id: project.id,
      name: project.brand.appName,
      subtitle: project.brand.appSubtitle,
      scope: buildScopeReference("project", project.id, project.brand.appName),
      version: project.version,
      latestReleaseVersion: project.latestReleaseVersion,
      publishedReleaseVersion: project.publishedReleaseVersion,
      published: project.published,
      templateId: resolveStarterProjectTemplateId(project.source),
      lastUpdatedAtMs: project.lastUpdatedAtMs,
      sceneCount: project.scenes.size,
      assetCount: project.assets.size + project.animationClips.size,
      reviewCount:
        Array.from(project.generationJobs.values()).filter((job) => job.status !== "succeeded").length +
        Array.from(project.artifacts.values()).filter((artifact) => !artifact.approved).length +
        Array.from(project.automationRuns.values()).filter((run) =>
          ["queued", "running", "blocked_for_approval"].includes(run.status),
        ).length,
    }))
    .sort(compareByUpdatedDesc);

const buildSharedAssets = (projects: readonly BuilderProjectSnapshot[]): readonly SharedAsset[] => {
  const sharedAssets: SharedAsset[] = [];

  for (const project of projects) {
    for (const asset of project.assets.values()) {
      const libraryId = asset.approved ? "global-shared-assets" : "organization-review-assets";
      sharedAssets.push({
        id: `${project.id}:${asset.id}`,
        libraryId,
        label: asset.label,
        kind: asset.kind,
        sceneMode: asset.sceneMode,
        source: asset.source,
        approved: asset.approved,
        scope: buildScopeReference("project", project.id, project.brand.appName),
        attachments: [
          buildProjectAttachment(
            project.id,
            project.brand.appName,
            asset.approved ? "runtime-ready" : "awaiting-review",
          ),
        ],
      });
    }
  }

  return sharedAssets.sort((left, right) => left.label.localeCompare(right.label));
};

const buildLibraries = (sharedAssets: readonly SharedAsset[]): readonly AssetLibrary[] => {
  const approvedAssets = sharedAssets.filter((asset) => asset.approved);
  const pendingAssets = sharedAssets.filter((asset) => !asset.approved);

  return [
    {
      id: "global-shared-assets",
      scope: buildScopeReference("global", "global-shared-assets", "Global"),
      name: "Shared runtime assets",
      description: "Approved assets ready for reuse across games and releases.",
      assetCount: approvedAssets.length,
      attachedProjectCount: new Set(
        approvedAssets.flatMap((asset) => asset.attachments.map((attachment) => attachment.projectId)),
      ).size,
    },
    {
      id: "organization-review-assets",
      scope: buildScopeReference("organization", organizationScopeId, "Studio"),
      name: "Review-stage assets",
      description: "Draft and generated assets that still need approval before broad reuse.",
      assetCount: pendingAssets.length,
      attachedProjectCount: new Set(
        pendingAssets.flatMap((asset) => asset.attachments.map((attachment) => attachment.projectId)),
      ).size,
    },
  ] as const;
};

const buildTemplates = (): readonly ProjectTemplate[] =>
  starterProjectTemplateIds.map((starterTemplateId) => ({
    id: starterTemplateId,
    scope: buildScopeReference("global", `starter-template:${starterTemplateId}`, "Global"),
    name: toTitleCase(starterTemplateId),
    description: `Starter template ${starterTemplateId}.`,
    starterTemplateId,
    defaultSceneMode: starterTemplateId === "3d-game" ? "3d" : "2d",
    recommended: starterTemplateId === recommendedStarterProjectTemplateId,
  }));

const describeProfile = (lane: string): string => {
  if (lane === "image-generation") {
    return "Image generation policy and sizing controls.";
  }
  return `${toTitleCase(lane)} provider policy and runtime settings.`;
};

const deriveLaneStatus = (
  lane: string,
  providerStatusByName: ReadonlyMap<string, "ready" | "degraded" | "offline">,
): CapabilityProfile["status"] => {
  const direct = providerStatusByName.get(lane);
  if (direct === "ready" || direct === "degraded" || direct === "offline") {
    return direct;
  }
  if (lane === "image-generation" || lane === "transformers-local") {
    return providerStatusByName.get("transformers") ?? "offline";
  }
  if (lane === "openai-compatible-local") {
    return providerStatusByName.get("openai-compatible-local") ?? "offline";
  }
  if (lane === "openai-compatible-cloud") {
    return providerStatusByName.get("openai-compatible-cloud") ?? "offline";
  }
  return "ready";
};

const buildCapabilityProfiles = async (): Promise<readonly CapabilityProfile[]> => {
  const runtimeProfile = await getAiRuntimeProfile();
  const providerRegistry = await ProviderRegistry.getInstance();
  const status = await providerRegistry.getStatus();
  const providerStatusByName = new Map(
    status.providers.map((provider) => [provider.name, provider.readiness] as const),
  );
  const settingsByLane = new Map<string, AiRuntimeSettingValue[]>();

  for (const setting of runtimeProfile.settings) {
    const laneSettings = settingsByLane.get(setting.providerLane) ?? [];
    laneSettings.push(setting);
    settingsByLane.set(setting.providerLane, laneSettings);
  }

  return Array.from(settingsByLane.entries())
    .map(([lane, settings]) => {
      const readiness = deriveLaneStatus(lane, providerStatusByName);
      const readyLaneCount = readiness === "ready" ? 1 : 0;
      const issueLaneCount = readiness === "ready" ? 0 : 1;

      return {
        id: lane,
        scope: buildScopeReference("global", lane, "Global"),
        name: toTitleCase(lane),
        description: describeProfile(lane),
        status: readiness,
        settingCount: settings.length,
        readyLaneCount,
        issueLaneCount,
        lanes: [lane],
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
};

const buildReleases = (
  projects: readonly BuilderProjectSnapshot[],
): readonly ReleaseRecord[] =>
  projects
    .filter((project) => project.latestReleaseVersion > 0)
    .map((project) => ({
      id: `${project.id}:v${project.latestReleaseVersion}`,
      projectId: project.id,
      projectName: project.brand.appName,
      scope: buildScopeReference(
        "release",
        `${project.id}:v${project.latestReleaseVersion}`,
        `${project.brand.appName} v${project.latestReleaseVersion}`,
      ),
      version: project.latestReleaseVersion,
      published: project.published,
      updatedAtMs: project.lastUpdatedAtMs,
    }))
    .sort((left, right) => right.updatedAtMs - left.updatedAtMs);

const buildReviewQueue = (
  projects: readonly BuilderProjectSnapshot[],
): readonly ReviewQueueItem[] => {
  const queue: ReviewQueueItem[] = [];

  for (const project of projects) {
    const projectScope = buildScopeReference("project", project.id, project.brand.appName);

    for (const job of project.generationJobs.values()) {
      if (job.status === "succeeded") {
        continue;
      }
      queue.push({
        id: `generation:${project.id}:${job.id}`,
        projectId: project.id,
        projectName: project.brand.appName,
        scope: projectScope,
        lane: "generation",
        title: `${toTitleCase(job.kind)} job`,
        summary: job.prompt,
        status: job.status,
        createdAtMs: job.createdAtMs,
      });
    }

    for (const artifact of project.artifacts.values()) {
      if (artifact.approved) {
        continue;
      }
      queue.push({
        id: `artifact:${project.id}:${artifact.id}`,
        projectId: project.id,
        projectName: project.brand.appName,
        scope: projectScope,
        lane: "artifact",
        title: artifact.label,
        summary: artifact.summary,
        status: "pending-review",
        createdAtMs: artifact.createdAtMs,
      });
    }

    for (const run of project.automationRuns.values()) {
      if (!["queued", "running", "blocked_for_approval"].includes(run.status)) {
        continue;
      }
      queue.push({
        id: `automation:${project.id}:${run.id}`,
        projectId: project.id,
        projectName: project.brand.appName,
        scope: projectScope,
        lane: "automation",
        title: run.goal,
        summary: run.statusMessage,
        status: run.status,
        createdAtMs: run.createdAtMs,
      });
    }
  }

  return queue.sort(compareByCreatedDesc);
};

/**
 * Aggregates top-level control-plane data from existing project, release, asset, and AI state.
 */
export class ControlPlaneService {
  /**
   * Loads the current control-plane snapshot.
   *
   * @returns Aggregated platform snapshot for portfolio and platform pages.
   */
  public async getSnapshot(): Promise<ControlPlaneSnapshot> {
    const projects = await builderService.listProjects();
    const [capabilityProfiles, globalKnowledgeDocumentCount] =
      await Promise.all([
        buildCapabilityProfiles(),
        knowledgeBaseService.countDocuments(),
      ]);
    const games = buildGames(projects);
    const sharedAssets = buildSharedAssets(projects);
    const releases = buildReleases(projects);
    const reviewQueue = buildReviewQueue(projects);

    return {
      games,
      libraries: buildLibraries(sharedAssets),
      sharedAssets,
      templates: buildTemplates(),
      capabilityProfiles,
      releases,
      reviewQueue,
      globalKnowledgeDocumentCount,
    };
  }
}

/** Shared singleton used by route handlers and SSR views. */
export const controlPlaneService = new ControlPlaneService();
