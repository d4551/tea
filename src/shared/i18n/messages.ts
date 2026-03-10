import type { LocaleCode } from "../../config/environment.ts";

/**
 * Full translation contract used by pages, API payloads, and UI partials.
 */
export interface Messages {
  readonly metadata: {
    readonly appName: string;
    readonly appSubtitle: string;
  };
  readonly navigation: {
    readonly home: string;
    readonly game: string;
    readonly builder: string;
    readonly localeLabel: string;
    readonly localeNameEnglish: string;
    readonly localeNameChinese: string;
    readonly switchToEnglish: string;
    readonly switchToChinese: string;
  };
  readonly common: {
    readonly openMenu: string;
    readonly closeMenu: string;
    readonly closeSidebar: string;
    readonly closeAiChat: string;
    readonly openAiAssistant: string;
    readonly mobileNavigation: string;
    readonly primaryNavigation: string;
    readonly skipToContent: string;
    readonly loading: string;
    readonly retry: string;
    readonly backToTop: string;
    readonly themeLabel: string;
    readonly themeSilk: string;
    readonly themeAutumn: string;
    readonly themeForgeDark: string;
    readonly themeForgeLight: string;
    readonly breadcrumbLabel: string;
    readonly socialNavLabel: string;
    readonly githubLabel: string;
    readonly discordLabel: string;
    readonly twitterLabel: string;
    readonly projectConfigured: string;
    readonly noProjectBound: string;
    readonly contextLabel: string;
  };
  readonly pages: {
    readonly home: {
      readonly title: string;
      readonly heroTitle: string;
      readonly heroDescription: string;
      readonly welcomeBack: string;
      readonly builderCardTitle: string;
      readonly builderCardDescription: string;
      readonly builderCardCta: string;
      readonly openUnifiedBuilder: string;
      readonly talkToAiOracle: string;
      readonly playerCardTitle: string;
      readonly playerCardDescription: string;
      readonly playerCardCta: string;
      readonly playtestBuild: string;
      readonly playtestBuildDescription: string;
      readonly statusUnpublishedDraft: string;
      readonly launchPlayerSurface: string;
      readonly projectActivity: string;
      readonly activityEmptyTitle: string;
      readonly activityEmptyDescription: string;
      readonly projectCreatedInWorkspace: string;
      readonly waitingForInitialSceneDraft: string;
      readonly awaitingPublication: string;
      readonly statsScenes: string;
      readonly statsNpcs: string;
      readonly statsGenerations: string;
      readonly loopTitle: string;
      readonly loopDescription: string;
      readonly loopSteps: readonly string[];
      readonly architectureTitle: string;
      readonly architectureDescription: string;
      readonly reliabilityTitle: string;
      readonly reliabilityDescription: string;
      readonly progressiveEnhancementTitle: string;
      readonly progressiveEnhancementDescription: string;
      readonly docsCta: string;
    };
  };
  readonly aiPlayground: {
    readonly cardTitle: string;
    readonly cardDescription: string;
    readonly promptLabel: string;
    readonly promptPlaceholder: string;
    readonly submit: string;
    readonly loadingTitle: string;
    readonly loadingDescription: string;
    readonly modeAuto: string;
    readonly idleHint: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
    readonly successTitle: string;
    readonly retryableErrorTitle: string;
    readonly retryableErrorDescription: string;
    readonly nonRetryableErrorTitle: string;
    readonly nonRetryableErrorDescription: string;
    readonly unauthorizedTitle: string;
    readonly unauthorizedDescription: string;
    readonly networkErrorDescription: string;
    readonly validationTooLong: string;
  };
  readonly footer: {
    readonly title: string;
    readonly copy: string;
    readonly ctaLabel: string;
  };
  readonly api: {
    readonly healthOk: string;
    readonly frameworkErrors: {
      readonly validation: string;
      readonly notFound: string;
      readonly sessionMissing: string;
      readonly sessionExpired: string;
      readonly invalidCommand: string;
      readonly aiProviderFailure: string;
      readonly internal: string;
    };
  };
  readonly ai: {
    readonly statusAvailable: string;
    readonly statusUnavailable: string;
    readonly generating: string;
    readonly fallbackDialogue: string;
    readonly noProviderAvailable: string;
    readonly visionNotAvailable: string;
    readonly retrievalAssistUnavailable: string;
    readonly toolPlanningUnavailable: string;
    readonly dialogueGenerationUnavailable: string;
    readonly sceneGenerationUnavailable: string;
    readonly designAssistUnavailable: string;
    readonly audioPayloadTooLarge: string;
    readonly audioPayloadInvalid: string;
    readonly audioTranscriptionUnavailable: string;
    readonly audioSynthesisUnavailable: string;
  };
  readonly game: {
    readonly sessionExpiredStream: string;
    readonly sessionDeletedStream: string;
    readonly hudStreamFailed: string;
    readonly unknownLevel: string;
    readonly connectingToRealm: string;
    readonly initialXp: string;
    readonly xpLabel: string;
    readonly levelLabel: string;
    readonly gameCanvasLabel: string;
    readonly connectionStatus: string;
    readonly connectionConnected: string;
    readonly connectionDisconnected: string;
    readonly connectionReconnecting: string;
    readonly connectionExpired: string;
    readonly connectionMissing: string;
    readonly reconnectAction: string;
    readonly queueLabel: string;
    readonly controlsTitle: string;
    readonly controlsMove: string;
    readonly controlsInteract: string;
    readonly controlsAdvance: string;
    readonly runtimeSurfaceLabel: string;
    readonly runtimeSurfaceHint: string;
    readonly runtimeSurfaceActive: string;
    readonly runtimeSurfaceInactive: string;
    readonly objectiveTitle: string;
    readonly objectiveDescription: string;
    readonly sessionContextTitle: string;
    readonly sessionIdLabel: string;
    readonly sceneLabel: string;
    readonly sceneModeLabel: string;
    readonly sceneMode2d: string;
    readonly sceneMode3d: string;
    readonly projectLabel: string;
    readonly localeLabel: string;
    readonly builderReturn: string;
    readonly publishedProjectLabel: string;
    readonly projectUnavailableValue: string;
    readonly projectUnavailableTitle: string;
    readonly projectUnavailableDescription: string;
    readonly projectUnpublishedTitle: string;
    readonly projectUnpublishedDescription: string;
    readonly sessionUnavailableTitle: string;
    readonly sessionUnavailableDescription: string;
    readonly invalidInviteTitle: string;
    readonly invalidInviteDescription: string;
    readonly returnToBuilder: string;
    readonly multiplayerTitle: string;
    readonly multiplayerDescription: string;
    readonly participantsLabel: string;
    readonly participantRoleLabel: string;
    readonly participantRoleOwner: string;
    readonly participantRoleController: string;
    readonly participantRoleSpectator: string;
    readonly inviteControllerAction: string;
    readonly inviteSpectatorAction: string;
    readonly inviteLinkLabel: string;
    readonly spectatorModeHint: string;
    readonly invalidCommand: string;
    readonly invalidDirection: string;
    readonly chatMissingFields: string;
    readonly unknownCommandType: string;
    readonly sessionOwnershipMismatch: string;
    readonly sessionAccessDenied: string;
    readonly spectatorControlDenied: string;
    readonly sessionExpiredRequest: string;
    readonly sessionNotFoundRequest: string;
    readonly commandRejected: string;
    readonly commandQueueFull: string;
    readonly commandDropped: string;
    readonly commandExpired: string;
    readonly chatRateLimited: string;
    readonly commandTypeMissing: string;
    readonly saveCooldownActive: string;
    readonly inventoryAction: string;
    readonly inventoryClose: string;
    readonly inventoryTitle: string;
    readonly inventoryCapacity: string;
    readonly inventoryStorage: string;
    readonly inventoryItems: string;
    readonly inventoryEmpty: string;
    readonly inventoryWeight: string;
    readonly inventoryGold: string;
    readonly inventoryManageHint: string;
    readonly inventorySessionIdLabel: string;
    readonly cutsceneSkip: string;
    readonly cutsceneAdvanceHint: string;
    readonly cutsceneInProgress: string;
    readonly cutsceneBadge: string;
    readonly combatTitle: string;
    readonly combatPhaseLabel: string;
    readonly combatTurnLabel: string;
    readonly combatPartyLabel: string;
    readonly combatHostilesLabel: string;
    readonly combatLogEmpty: string;
    readonly combatActionHint: string;
    readonly combatPhaseIntro: string;
    readonly combatPhasePlayerTurn: string;
    readonly combatPhaseEnemyTurn: string;
    readonly combatPhaseVictory: string;
    readonly combatPhaseDefeat: string;
    readonly hitPointsShortLabel: string;
  };
  readonly builder: {
    readonly projectNotFound: string;
    readonly sceneNotFound: string;
    readonly npcNotFound: string;
    readonly dialogueNotFound: string;
    readonly missingPrompt: string;
    readonly sceneIdRequired: string;
    readonly invalidPatchPlan: string;
    readonly publishValidationFailed: string;
    readonly publishValidationNoScenes: string;
    readonly publishValidation3dSceneNeedsWebgpu: string;
    readonly publishValidationSceneSpawnOutOfBounds: string;
    readonly publishValidationSceneNpcOutOfBounds: string;
    readonly publishValidationNodeAssetMissing: string;
    readonly publishValidationNodeAssetUnapproved: string;
    readonly publishValidationNodeAssetSceneModeMismatch: string;
    readonly publishValidationNodeAssetKindMismatch: string;
    readonly publishValidationNodeAssetFormatUnsupported: string;
    readonly publishValidationNodeClipMissing: string;
    readonly publishValidationNodeClipSceneModeMismatch: string;
    readonly publishValidationNodeClipAssetMismatch: string;
    readonly publishValidationClipAssetMissing: string;
    readonly publishValidationClipAssetSceneModeMismatch: string;
    readonly noDialogues: string;
    readonly title: string;
    readonly dashboard: string;
    readonly workspaceTitle: string;
    readonly workspaceJumpBack: string;
    readonly scenes: string;
    readonly npcs: string;
    readonly dialogue: string;
    readonly assets: string;
    readonly mechanics: string;
    readonly automation: string;
    readonly ai: string;
    readonly animations: string;
    readonly addScene: string;
    readonly editScene: string;
    readonly addNpc: string;
    readonly editNpc: string;
    readonly addDialogue: string;
    readonly generateDialogue: string;
    readonly uploadAsset: string;
    readonly addAssetPath: string;
    readonly addAssetFile: string;
    readonly critiqueAsset: string;
    readonly testDialogue: string;
    readonly designAssist: string;
    readonly activeSessions: string;
    readonly totalScenes: string;
    readonly totalNpcs: string;
    readonly aiStatus: string;
    readonly noScenes: string;
    readonly noNpcs: string;
    readonly noAssets: string;
    readonly noAnimationClips: string;
    readonly noGenerationJobs: string;
    readonly noQuests: string;
    readonly noTriggers: string;
    readonly noDialogueGraphs: string;
    readonly noFlags: string;
    readonly noCollisions: string;
    readonly noSceneNodes: string;
    readonly noAutomationRuns: string;
    readonly save: string;
    readonly cancel: string;
    readonly delete: string;
    readonly preview: string;
    readonly sceneId: string;
    readonly sceneIdPlaceholder: string;
    readonly sceneTitle: string;
    readonly sceneBackgroundLabel: string;
    readonly scenePreviewTitle: string;
    readonly runtimePreviewTitle: string;
    readonly spawnPoint: string;
    readonly geometry: string;
    readonly sceneModeLabel: string;
    readonly sceneMode2d: string;
    readonly sceneMode3d: string;
    readonly sceneNodes: string;
    readonly collisions: string;
    readonly npcName: string;
    readonly labelField: string;
    readonly npcLabel: string;
    readonly npcPosition: string;
    readonly interactRadius: string;
    readonly wanderRadius: string;
    readonly wanderSpeed: string;
    readonly idlePauseMinMs: string;
    readonly idlePauseMaxMs: string;
    readonly greetLineKey: string;
    readonly greetOnApproach: string;
    readonly dialogueKey: string;
    readonly dialogueLine: string;
    readonly providerStatus: string;
    readonly availableModels: string;
    readonly knowledgeWorkspaceTitle: string;
    readonly knowledgeWorkspaceDescription: string;
    readonly knowledgeTitleLabel: string;
    readonly knowledgeSourceLabel: string;
    readonly knowledgeTextLabel: string;
    readonly ingestKnowledgeDocument: string;
    readonly deleteKnowledgeDocument: string;
    readonly deleteKnowledgeDocumentConfirm: string;
    readonly knowledgeChunksLabel: string;
    readonly noKnowledgeDocuments: string;
    readonly retrievalWorkspaceTitle: string;
    readonly retrievalWorkspaceDescription: string;
    readonly retrievalPromptPlaceholder: string;
    readonly runRetrievalAssist: string;
    readonly retrievalResultTitle: string;
    readonly noKnowledgeMatches: string;
    readonly toolPlanWorkspaceTitle: string;
    readonly toolPlanWorkspaceDescription: string;
    readonly toolPlanGoalPlaceholder: string;
    readonly previewToolPlan: string;
    readonly toolPlanPreviewTitle: string;
    readonly toolPlanPreviewDescription: string;
    readonly closeSidebar: string;
    readonly currentProject: string;
    readonly projectIdLabel: string;
    readonly projectIdPlaceholder: string;
    readonly projectDraftVersion: string;
    readonly projectPublishedVersion: string;
    readonly projectStatus: string;
    readonly projectLastUpdated: string;
    readonly projectStatusDraft: string;
    readonly projectStatusPublished: string;
    readonly versionPrefix: string;
    readonly projectStatusUnpublished: string;
    readonly createProject: string;
    readonly switchProject: string;
    readonly exitBuilder: string;
    readonly publishProject: string;
    readonly unpublishProject: string;
    readonly playPublishedBuild: string;
    readonly createProjectHelp: string;
    readonly projectPlayHint: string;
    readonly capabilityHeader: string;
    readonly statusHeader: string;
    readonly visionLabel: string;
    readonly sentimentLabel: string;
    readonly embeddingsLabel: string;
    readonly speechToTextLabel: string;
    readonly speechSynthesisLabel: string;
    readonly voicePreviewTitle: string;
    readonly voicePreviewDescription: string;
    readonly synthesizeTextPlaceholder: string;
    readonly synthesizeSubmit: string;
    readonly transcribeSubmit: string;
    readonly transcribeFileLabel: string;
    readonly localInferenceLabel: string;
    readonly idLabel: string;
    readonly titleLabel: string;
    readonly descriptionLabel: string;
    readonly npcIdLabel: string;
    readonly messageLabel: string;
    readonly promptLabel: string;
    readonly widthLabel: string;
    readonly heightLabel: string;
    readonly xLabel: string;
    readonly yLabel: string;
    readonly zLabel: string;
    readonly yesLabel: string;
    readonly noLabel: string;
    readonly filterAction: string;
    readonly openDetails: string;
    readonly selectNode: string;
    readonly selectedNodeLabel: string;
    readonly noNodeSelected: string;
    readonly transformModeTranslate: string;
    readonly transformModeRotate: string;
    readonly transformModeScale: string;
    readonly createSceneNode: string;
    readonly continueAuthoring: string;
    readonly quickActionScene: string;
    readonly quickActionSceneDesc: string;
    readonly quickActionNpc: string;
    readonly quickActionNpcDesc: string;
    readonly quickActionDialogue: string;
    readonly quickActionDialogueDesc: string;
    readonly quickActionAi: string;
    readonly quickActionAiDesc: string;
    readonly statusBarProject: string;
    readonly statusBarAi: string;
    readonly statusBarJobs: string;
    readonly aiAssistFab: string;
    readonly nodeIdLabel: string;
    readonly nodeTypeLabel: string;
    readonly layerLabel: string;
    readonly assetIdFieldLabel: string;
    readonly animationClipIdFieldLabel: string;
    readonly generationTargetLabel: string;
    readonly operationsJsonLabel: string;
    readonly rotationLabel: string;
    readonly scaleLabel: string;
    readonly sceneNodeTypeSprite: string;
    readonly sceneNodeTypeTile: string;
    readonly sceneNodeTypeSpawn: string;
    readonly sceneNodeTypeTrigger: string;
    readonly sceneNodeTypeCamera: string;
    readonly sceneNodeTypeModel: string;
    readonly sceneNodeTypeLight: string;
    readonly assetKindPortrait: string;
    readonly assetKindSpriteSheet: string;
    readonly assetKindBackground: string;
    readonly assetKindModel: string;
    readonly assetKindAudio: string;
    readonly assetKindDocument: string;
    readonly generationKindPortrait: string;
    readonly generationKindSpriteSheet: string;
    readonly generationKindTiles: string;
    readonly generationKindVoiceLine: string;
    readonly generationKindAnimationPlan: string;
    readonly generationKindCombatEncounter: string;
    readonly generationKindItemSet: string;
    readonly generationKindCutsceneScript: string;
    readonly triggerEventLabel: string;
    readonly triggerEventSceneEnter: string;
    readonly triggerEventNpcInteract: string;
    readonly triggerEventChat: string;
    readonly triggerEventDialogueConfirmed: string;
    readonly triggerEventCombatVictory: string;
    readonly triggerEventItemAcquired: string;
    readonly rotationXLabel: string;
    readonly rotationYLabel: string;
    readonly rotationZLabel: string;
    readonly scaleXLabel: string;
    readonly scaleYLabel: string;
    readonly scaleZLabel: string;
    readonly sceneWidthDesc: string;
    readonly sceneHeightDesc: string;
    readonly assetPlaceholder: string;
    readonly testNpcPlaceholder: string;
    readonly testMessagePlaceholder: string;
    readonly assistPromptPlaceholder: string;
    readonly flowTitle: string;
    readonly flowDescription: string;
    readonly flowSteps: readonly string[];
    readonly engineOptionsTitle: string;
    readonly engineOptionsDescription: string;
    readonly runtimeLaneTitle: string;
    readonly runtimeLaneDescription: string;
    readonly pluginLaneTitle: string;
    readonly pluginLaneDescription: string;
    readonly aiLaneTitle: string;
    readonly aiLaneDescription: string;
    readonly apiSurfaceTitle: string;
    readonly apiSurfaceDescription: string;
    readonly localRuntimeTitle: string;
    readonly localRuntimeDescription: string;
    readonly runtimeLabel: string;
    readonly modelLabel: string;
    readonly taskLabel: string;
    readonly configKeyLabel: string;
    readonly aiConfigOverrideHelp: string;
    readonly docsLabel: string;
    readonly runtimeStackValue: string;
    readonly sceneLibraryTitle: string;
    readonly sceneCreateDescription: string;
    readonly sceneCreateTitlePlaceholder: string;
    readonly sceneBackgroundPlaceholder: string;
    readonly npcRosterTitle: string;
    readonly npcCreateDescription: string;
    readonly npcCreateSceneLabel: string;
    readonly npcCreateKeyPlaceholder: string;
    readonly npcCreateLabelPlaceholder: string;
    readonly assetsWorkspaceTitle: string;
    readonly assetKindLabel: string;
    readonly assetSourceLabel: string;
    readonly animationClipsTitle: string;
    readonly createAnimationClip: string;
    readonly clipAssetLabel: string;
    readonly clipStateTagLabel: string;
    readonly clipFrameCountLabel: string;
    readonly clipPlaybackLabel: string;
    readonly clipTimelineDuration: string;
    readonly clipTimelineLoop: string;
    readonly clipTimelineNoLoop: string;
    readonly clipIdLabel: string;
    readonly generationJobsTitle: string;
    readonly generationJobKindLabel: string;
    readonly generationPromptLabel: string;
    readonly createGenerationJob: string;
    readonly dialogueSearchLabel: string;
    readonly dialogueSearchPlaceholder: string;
    readonly dialogueWorkspaceTitle: string;
    readonly dialogueCreateDescription: string;
    readonly dialogueKeyPlaceholder: string;
    readonly addLinePlaceholder: string;
    readonly mechanicsWorkspaceTitle: string;
    readonly questsTitle: string;
    readonly triggersTitle: string;
    readonly dialogueGraphsTitle: string;
    readonly flagsTitle: string;
    readonly mechanicsDetailHint: string;
    readonly createQuest: string;
    readonly editQuest: string;
    readonly questIdLabel: string;
    readonly questTitlePlaceholder: string;
    readonly questDescriptionPlaceholder: string;
    readonly createTrigger: string;
    readonly editTrigger: string;
    readonly triggerIdLabel: string;
    readonly triggerLabelPlaceholder: string;
    readonly createDialogueGraph: string;
    readonly editDialogueGraph: string;
    readonly graphIdLabel: string;
    readonly graphTitlePlaceholder: string;
    readonly assetLabelPlaceholder: string;
    readonly assetIdPlaceholder: string;
    readonly clipIdPlaceholder: string;
    readonly questIdPlaceholder: string;
    readonly triggerIdPlaceholder: string;
    readonly graphIdPlaceholder: string;
    readonly nodeIdPlaceholder: string;
    readonly layerPlaceholder: string;
    readonly stateTagPlaceholder: string;
    readonly sourcePathPlaceholder: string;
    readonly dialogueNpcIdPlaceholder: string;
    readonly operationsJsonPlaceholder: string;
    readonly assetStatusApproved: string;
    readonly assetStatusDraft: string;
    readonly generationPromptPlaceholder: string;
    readonly generationTargetPlaceholder: string;
    readonly triggerSceneGlobal: string;
    readonly nodesCountLabel: string;
    readonly automationWorkspaceTitle: string;
    readonly automationGoalLabel: string;
    readonly automationGoalPlaceholder: string;
    readonly automationStepsJsonLabel: string;
    readonly automationStepsJsonPlaceholder: string;
    readonly automationStepsJsonHelp: string;
    readonly createAutomationRun: string;
    readonly approveAction: string;
    readonly cancelAction: string;
    readonly jobStatusQueued: string;
    readonly jobStatusRunning: string;
    readonly jobStatusBlockedForApproval: string;
    readonly jobStatusSucceeded: string;
    readonly jobStatusFailed: string;
    readonly jobStatusCanceled: string;
    readonly longRunningStatusProcessing: string;
    readonly generationStatusDraftReadyForReview: string;
    readonly generatedLabelPrefix: string;
    readonly reviewLabelPrefix: string;
    readonly generatedArtifactSummaryFromPrompt: string;
    readonly generatedArtifactSummaryTargetPrefix: string;
    readonly automationEvidenceLabel: string;
    readonly automationContextLabel: string;
    readonly automationPlanArtifactLabel: string;
    readonly automationBundleArtifactLabel: string;
    readonly automationArtifactsLabel: string;
    readonly openAutomationEvidence: string;
    readonly automationStepBrowser: string;
    readonly automationStepHttp: string;
    readonly automationStepBuilder: string;
    readonly automationStepAttachFile: string;
    readonly automationSummaryCaptureReviewContext: string;
    readonly automationSummaryPrepareDraftPlan: string;
    readonly automationSummaryAttachReviewEvidence: string;
    readonly automationSummaryBrowserGoto: string;
    readonly automationSummaryBrowserClick: string;
    readonly automationSummaryBrowserFill: string;
    readonly automationSummaryBrowserAssertText: string;
    readonly automationSummaryBrowserScreenshot: string;
    readonly automationSummaryHttpRequest: string;
    readonly automationSummaryBuilderCreateScene: string;
    readonly automationSummaryBuilderCreateTrigger: string;
    readonly automationSummaryBuilderCreateQuest: string;
    readonly automationSummaryBuilderCreateDialogueGraph: string;
    readonly automationSummaryBuilderCreateAsset: string;
    readonly automationSummaryBuilderCreateAnimationClip: string;
    readonly automationSummaryBuilderQueueGenerationJob: string;
    readonly automationSummaryAttachGeneratedArtifact: string;
    readonly automationArtifactSummaryCapturedReviewEvidence: string;
    readonly automationArtifactSummaryCapturedProjectContext: string;
    readonly automationArtifactSummaryGeneratedToolPlan: string;
    readonly automationArtifactSummaryAttachedExecutionBundle: string;
    readonly automationStatusQueuedForProcessing: string;
    readonly automationStatusApprovedForApply: string;
    readonly automationStatusCanceledByReview: string;
    readonly automationStatusPlanReadyForReview: string;
    readonly automationStatusCapturingFallbackEvidence: string;
    readonly automationStatusOriginUnavailable: string;
    readonly assistantReviewTitle: string;
    readonly assistantReviewDescription: string;
    readonly previewChanges: string;
    readonly applyChanges: string;
    readonly previewReady: string;
    readonly applyComplete: string;
    readonly noPublishedRelease: string;
    readonly patchOperations: string;
    readonly activeProjectMissing: string;
    readonly platformReadinessTitle: string;
    readonly platformReadinessDescription: string;
    readonly platformReadinessWarning: string;
    readonly readinessImplemented: string;
    readonly readinessPartial: string;
    readonly readinessMissing: string;
    readonly implementedCountLabel: string;
    readonly partialCountLabel: string;
    readonly missingCountLabel: string;
    readonly sceneBaselineCountLabel: string;
    readonly spriteManifestCountLabel: string;
    readonly draftVersionLabel: string;
    readonly latestReleaseLabel: string;
    readonly publishedReleaseLabel: string;
    readonly sceneNodeCountLabel: string;
    readonly collisionMaskCountLabel: string;
    readonly modelAssetCountLabel: string;
    readonly openUsdAssetCountLabel: string;
    readonly animationTimelineCountLabel: string;
    readonly dialogueGraphCountLabel: string;
    readonly questCountLabel: string;
    readonly triggerCountLabel: string;
    readonly flagCountLabel: string;
    readonly generationJobCountLabel: string;
    readonly automationRunCountLabel: string;
    readonly automationStepCountLabel: string;
    readonly artifactCountLabel: string;
    readonly providerCountLabel: string;
    readonly capabilityReleaseFlowTitle: string;
    readonly capabilityReleaseFlowDescription: string;
    readonly capability2dRuntimeTitle: string;
    readonly capability2dRuntimeDescription: string;
    readonly capability3dRuntimeTitle: string;
    readonly capability3dRuntimeDescription: string;
    readonly capabilitySpritePipelineTitle: string;
    readonly capabilitySpritePipelineDescription: string;
    readonly capabilityAnimationPipelineTitle: string;
    readonly capabilityAnimationPipelineDescription: string;
    readonly capabilityMechanicsTitle: string;
    readonly capabilityMechanicsDescription: string;
    readonly capabilityAiAuthoringTitle: string;
    readonly capabilityAiAuthoringDescription: string;
    readonly capabilityAutomationTitle: string;
    readonly capabilityAutomationDescription: string;
    readonly capabilityWebgpuRendererTitle: string;
    readonly capabilityWebgpuRendererDescription: string;
    readonly capabilityAiOnnxGpuTitle: string;
    readonly capabilityAiOnnxGpuDescription: string;
  };
}

type IsRecord<T> =
  T extends Record<string, unknown> ? (T extends readonly unknown[] ? false : true) : false;
type InternalMessageKey<T, TPrefix extends string = ""> = T extends string
  ? TPrefix
  : IsRecord<T> extends true
    ? {
        [K in Extract<keyof T, string>]: InternalMessageKey<
          T[K],
          `${TPrefix}${TPrefix extends "" ? "" : "."}${K}`
        >;
      }[Extract<keyof T, string>]
    : never;

/**
 * Strictly typed message key union for user-facing strings.
 */
export type TranslatedMessageKey = InternalMessageKey<Messages>;

/**
 * Locale-aware string resolution for strict template rendering.
 */
export interface MessageLookupOptions {
  /** Optional message suffix added when a lookup key is missing. */
  readonly missingValueFallback?: string;
}

/**
 * Resolves a typed message key for a resolved message catalog.
 *
 * @param messages Localized message catalog.
 * @param key Typed message key.
 * @param options Optional fallback options.
 * @returns Human-readable message for the key.
 */
export const translateMessage = (
  messages: Messages,
  key: TranslatedMessageKey,
  options: MessageLookupOptions = {},
): string => {
  const keyPath = String(key);
  const parts = keyPath.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) {
      return options.missingValueFallback ?? keyPath;
    }

    if (!(part in current)) {
      return options.missingValueFallback ?? keyPath;
    }

    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current !== "string") {
    return options.missingValueFallback ?? keyPath;
  }

  return current;
};

/**
 * Translation table keyed by locale.
 */
export const messagesByLocale: Record<LocaleCode, Messages> = {
  "en-US": {
    metadata: {
      appName: "Game Forge",
      appSubtitle: "AI-powered video game creator",
    },
    navigation: {
      home: "Home",
      game: "Play",
      builder: "Create",
      localeLabel: "Language",
      localeNameEnglish: "English",
      localeNameChinese: "中文",
      switchToEnglish: "Switch language to English",
      switchToChinese: "Switch language to Chinese",
    },
    common: {
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      closeSidebar: "Close sidebar",
      closeAiChat: "Close AI chat",
      openAiAssistant: "Open AI Assistant",
      mobileNavigation: "Mobile navigation",
      primaryNavigation: "Primary navigation",
      skipToContent: "Skip to main content",
      loading: "Loading",
      retry: "Retry",
      backToTop: "Back to top",
      themeLabel: "Theme",
      themeSilk: "Silk",
      themeAutumn: "Autumn",
      themeForgeDark: "Dark",
      themeForgeLight: "Light",
      breadcrumbLabel: "Breadcrumb",
      socialNavLabel: "Social links",
      githubLabel: "GitHub",
      discordLabel: "Discord",
      twitterLabel: "Twitter / X",
      projectConfigured: "Project configured",
      noProjectBound: "No project bound",
      contextLabel: "Context",
    },
    pages: {
      home: {
        title: "AI Game Creator",
        heroTitle: "Build your world with AI",
        heroDescription:
          "Create scenes, characters, and stories — powered by local AI models. Design, publish, and play your game from a single creative workspace.",
        welcomeBack: "Welcome back. Here's an overview of your current project workspace.",
        builderCardTitle: "Build Worlds",
        builderCardDescription:
          "Design environments, place objects, and craft the spaces your players will explore. AI helps generate terrain, lighting, and atmosphere.",
        builderCardCta: "Start creating",
        openUnifiedBuilder: "Open Unified Builder",
        talkToAiOracle: "Talk to AI Oracle",
        playerCardTitle: "Play Your Game",
        playerCardDescription:
          "Launch your published game and experience it as a player. Test gameplay, refine mechanics, and share with others.",
        playerCardCta: "Play now",
        playtestBuild: "Playtest Build",
        playtestBuildDescription:
          "Validate your scenes, dialogues, and mechanics by dropping directly into the runtime surface.",
        statusUnpublishedDraft: "Status: Unpublished Draft",
        launchPlayerSurface: "Launch Player Surface",
        projectActivity: "Project Activity",
        activityEmptyTitle: "No project activity yet",
        activityEmptyDescription:
          "Create or import a project in the unified builder to unlock scene metrics, review history, and publish events.",
        projectCreatedInWorkspace: "Project created in workspace",
        waitingForInitialSceneDraft: "Waiting for initial scene draft",
        awaitingPublication: "Awaiting publication",
        statsScenes: "Scenes",
        statsNpcs: "NPCs",
        statsGenerations: "Generations",
        loopTitle: "Creation flow",
        loopDescription:
          "From first idea to playable game — AI assists at every step of the creative process.",
        loopSteps: ["Design your world", "Create with AI", "Publish and play"],
        architectureTitle: "Build Worlds",
        architectureDescription:
          "Design rich environments with scenes, terrain, and interactive objects. AI generates descriptions, layouts, and atmospheric details.",
        reliabilityTitle: "Create Characters",
        reliabilityDescription:
          "Bring NPCs to life with unique personalities, dialogue trees, and AI-generated conversations that respond to player choices.",
        progressiveEnhancementTitle: "AI Assistant",
        progressiveEnhancementDescription:
          "Local AI models generate dialogue, critique your designs, and automate repetitive tasks — all running on your machine.",
        docsCta: "API reference",
      },
    },
    aiPlayground: {
      cardTitle: "AI Assistant",
      cardDescription:
        "Generate dialogue, scene descriptions, character backstories, and more. Your local AI creates content for your game in seconds.",
      promptLabel: "What would you like to create?",
      promptPlaceholder:
        "Describe a scene, generate character dialogue, or brainstorm game mechanics",
      submit: "Generate",
      loadingTitle: "Creating",
      loadingDescription: "Your AI assistant is generating content.",
      modeAuto: "Auto",
      idleHint: "Describe what you want to create and the AI will generate it for you.",
      emptyTitle: "Nothing to generate",
      emptyDescription: "Tell the AI what you want to create.",
      successTitle: "Generated content",
      retryableErrorTitle: "AI temporarily busy",
      retryableErrorDescription: "The AI model is busy. Try again in a moment.",
      nonRetryableErrorTitle: "Generation failed",
      nonRetryableErrorDescription:
        "This request could not be processed. Try rephrasing your prompt.",
      unauthorizedTitle: "Sign in required",
      unauthorizedDescription: "Please sign in to use the AI assistant.",
      networkErrorDescription: "Could not reach the AI model. Check your connection and try again.",
      validationTooLong: "Your prompt is too long. Try shortening it.",
    },
    footer: {
      title: "Game Forge",
      copy: "Create video games with AI-powered tools.",
      ctaLabel: "API reference",
    },
    api: {
      healthOk: "Service is healthy",
      frameworkErrors: {
        validation: "Request validation failed.",
        notFound: "Requested resource was not found.",
        sessionMissing: "Missing session identifier.",
        sessionExpired: "Session has expired and must be recreated.",
        invalidCommand: "The command payload is invalid.",
        aiProviderFailure: "AI provider unavailable.",
        internal: "Unexpected server error.",
      },
    },
    ai: {
      statusAvailable: "AI Assistant Ready",
      statusUnavailable: "AI Assistant Offline",
      generating: "Generating...",
      fallbackDialogue: "The mountain mist obscures the path... Try again later.",
      noProviderAvailable: "No AI provider is currently available.",
      visionNotAvailable: "Vision analysis requires an Ollama vision model.",
      retrievalAssistUnavailable:
        "Retrieval-assisted guidance is currently unavailable from the configured AI providers.",
      toolPlanningUnavailable:
        "Structured tool planning is currently unavailable from the configured AI providers.",
      dialogueGenerationUnavailable:
        "Dialogue generation is currently unavailable from the configured AI providers.",
      sceneGenerationUnavailable:
        "Scene generation is currently unavailable from the configured AI providers.",
      designAssistUnavailable:
        "Design assistance is currently unavailable from the configured AI providers.",
      audioPayloadTooLarge: "Audio upload is too large for the configured runtime limit.",
      audioPayloadInvalid: "Audio payload could not be decoded as a WAV recording.",
      audioTranscriptionUnavailable:
        "Speech transcription is currently unavailable from the configured AI providers.",
      audioSynthesisUnavailable:
        "Speech synthesis is currently unavailable from the configured AI providers.",
    },
    game: {
      sessionExpiredStream: "Session has expired and will stop streaming.",
      sessionDeletedStream: "Session was deleted and cannot be resumed.",
      hudStreamFailed: "HUD stream failed.",
      unknownLevel: "Unknown",
      connectingToRealm: "Connecting to Realm...",
      initialXp: "XP: 0 / Lvl 1",
      xpLabel: "XP",
      levelLabel: "Lv",
      gameCanvasLabel: "Game world canvas",
      connectionStatus: "connecting",
      connectionConnected: "connected",
      connectionDisconnected: "disconnected",
      connectionReconnecting: "reconnecting",
      connectionExpired: "session expired",
      connectionMissing: "session missing",
      reconnectAction: "Reconnect",
      queueLabel: "queue",
      controlsTitle: "Controls",
      controlsMove: "Move: WASD or arrow keys",
      controlsInteract: "Interact: E, Enter, or Space",
      controlsAdvance: "Advance dialogue: Escape",
      runtimeSurfaceLabel: "Playable runtime surface",
      runtimeSurfaceHint:
        "Focus the runtime surface to capture keyboard movement and interaction controls.",
      runtimeSurfaceActive: "Runtime controls active.",
      runtimeSurfaceInactive: "Runtime controls inactive.",
      objectiveTitle: "Session objective",
      objectiveDescription:
        "Validate the published scene, dialogue pacing, and runtime stability before returning to the builder.",
      sessionContextTitle: "Current session",
      sessionIdLabel: "Session ID",
      sceneLabel: "Scene",
      sceneModeLabel: "Scene mode",
      sceneMode2d: "2D",
      sceneMode3d: "3D",
      projectLabel: "Project",
      localeLabel: "Locale",
      builderReturn: "Back to builder",
      publishedProjectLabel: "Published project",
      projectUnavailableValue: "No project bound",
      projectUnavailableTitle: "Project not found",
      projectUnavailableDescription:
        "The requested project does not exist. Switch back to the builder and select or create a valid project.",
      projectUnpublishedTitle: "Project is not published",
      projectUnpublishedDescription:
        "This player surface only runs immutable published releases. Publish the draft in the builder first.",
      sessionUnavailableTitle: "Session could not be restored",
      sessionUnavailableDescription:
        "The runtime could not hydrate a valid session snapshot. Retry from the builder or start a fresh published session.",
      invalidInviteTitle: "Invite is invalid",
      invalidInviteDescription:
        "The multiplayer invite has expired or is no longer valid. Ask the session owner for a fresh invite link.",
      returnToBuilder: "Return to builder",
      multiplayerTitle: "Multiplayer",
      multiplayerDescription:
        "Invite controllers or spectators into the current runtime session without leaving the published build.",
      participantsLabel: "Participants",
      participantRoleLabel: "Role",
      participantRoleOwner: "Owner",
      participantRoleController: "Controller",
      participantRoleSpectator: "Spectator",
      inviteControllerAction: "Create controller invite",
      inviteSpectatorAction: "Create spectator invite",
      inviteLinkLabel: "Join link",
      spectatorModeHint:
        "Spectators can observe the live session but cannot issue gameplay commands.",
      invalidCommand: "Invalid command payload",
      invalidDirection: "Invalid move direction",
      chatMissingFields: "Chat commands require npcId and message",
      unknownCommandType: "Unknown command type",
      sessionOwnershipMismatch: "Session ownership mismatch.",
      sessionAccessDenied: "Session access denied.",
      spectatorControlDenied: "Spectators cannot control gameplay.",
      sessionExpiredRequest: "The requested session has expired.",
      sessionNotFoundRequest: "Session not found.",
      commandRejected: "Command rejected.",
      commandQueueFull: "Command queue is full.",
      commandDropped: "Command was dropped.",
      commandExpired: "Command expired before it could be processed.",
      chatRateLimited: "Chat commands are temporarily rate limited.",
      commandTypeMissing: "Command type was not resolved for the accepted command.",
      saveCooldownActive: "Save is cooling down.",
      inventoryAction: "Item action",
      inventoryClose: "Close inventory",
      inventoryTitle: "Inventory",
      inventoryCapacity: "Capacity",
      inventoryStorage: "Storage",
      inventoryItems: "Items",
      inventoryEmpty: "Empty",
      inventoryWeight: "Weight",
      inventoryGold: "Gold",
      inventoryManageHint: "Use inventory commands to manage items.",
      inventorySessionIdLabel: "ID",
      cutsceneAdvanceHint: "Use advance cutscene (Space/Enter) to continue.",
      cutsceneInProgress: "Cinematic in progress...",
      cutsceneBadge: "Cinematic",
      cutsceneSkip: "Skip cutscene",
      combatTitle: "Combat engagement",
      combatPhaseLabel: "Phase",
      combatTurnLabel: "Turn",
      combatPartyLabel: "Party",
      combatHostilesLabel: "Hostiles",
      combatLogEmpty: "Combat initiated...",
      combatActionHint: "Use combat commands to resolve this encounter.",
      combatPhaseIntro: "Intro",
      combatPhasePlayerTurn: "Player turn",
      combatPhaseEnemyTurn: "Enemy turn",
      combatPhaseVictory: "Victory",
      combatPhaseDefeat: "Defeat",
      hitPointsShortLabel: "HP",
    },
    builder: {
      projectNotFound: "Project not found",
      sceneNotFound: "Scene not found",
      npcNotFound: "NPC not found",
      dialogueNotFound: "Dialogue key not found",
      missingPrompt: "Prompt is required",
      sceneIdRequired: "Scene id is required",
      invalidPatchPlan: "Patch plan contains invalid operations",
      publishValidationFailed: "Publish blocked until builder validation passes.",
      publishValidationNoScenes: "Add at least one scene before publishing.",
      publishValidation3dSceneNeedsWebgpu:
        "Scene {sceneId} requires the WebGPU renderer preference.",
      publishValidationSceneSpawnOutOfBounds:
        "Scene {sceneId} places the player spawn outside scene bounds.",
      publishValidationSceneNpcOutOfBounds:
        "Scene {sceneId} places NPC {npcId} outside scene bounds.",
      publishValidationNodeAssetMissing:
        "Scene {sceneId} node {nodeId} references missing asset {assetId}.",
      publishValidationNodeAssetUnapproved:
        "Scene {sceneId} node {nodeId} references unapproved asset {assetId}.",
      publishValidationNodeAssetSceneModeMismatch:
        "Scene {sceneId} node {nodeId} expects {expectedSceneMode} assets but {assetId} is {actualSceneMode}.",
      publishValidationNodeAssetKindMismatch:
        "Scene {sceneId} node {nodeId} cannot use asset {assetId} of kind {assetKind}.",
      publishValidationNodeAssetFormatUnsupported:
        "Scene {sceneId} node {nodeId} cannot use asset {assetId} with source format {sourceFormat}.",
      publishValidationNodeClipMissing:
        "Scene {sceneId} node {nodeId} references missing animation clip {clipId}.",
      publishValidationNodeClipSceneModeMismatch:
        "Scene {sceneId} node {nodeId} expects {expectedSceneMode} clips but {clipId} is {actualSceneMode}.",
      publishValidationNodeClipAssetMismatch:
        "Scene {sceneId} node {nodeId} links asset {assetId} but clip {clipId} belongs to another asset.",
      publishValidationClipAssetMissing:
        "Animation clip {clipId} references missing asset {assetId}.",
      publishValidationClipAssetSceneModeMismatch:
        "Animation clip {clipId} does not match asset {assetId}: expected {expectedSceneMode}, got {actualSceneMode}.",
      noDialogues: "No dialogue entries found",
      title: "Game Builder",
      dashboard: "Dashboard",
      workspaceTitle: "Builder Workspace",
      workspaceJumpBack:
        "Jump back into your world or start crafting something new with the help of your AI co-pilot.",
      scenes: "Scenes",
      npcs: "NPCs",
      dialogue: "Dialogue",
      assets: "Assets",
      mechanics: "Mechanics",
      automation: "Automation",
      ai: "AI Tools",
      animations: "Animations",
      addScene: "Add Scene",
      editScene: "Edit Scene",
      addNpc: "Add NPC",
      editNpc: "Edit NPC",
      addDialogue: "Add Line",
      generateDialogue: "Generate with AI",
      uploadAsset: "Upload Asset",
      addAssetPath: "Add Asset (path)",
      addAssetFile: "Upload File",
      critiqueAsset: "AI Critique",
      testDialogue: "Test Dialogue",
      designAssist: "Design Assistant",
      activeSessions: "Active Sessions",
      totalScenes: "Total Scenes",
      totalNpcs: "Total NPCs",
      aiStatus: "AI Status",
      noScenes: "No scenes defined yet.",
      noNpcs: "No NPCs defined yet.",
      noAssets: "No assets created yet.",
      noAnimationClips: "No animation clips created yet.",
      noGenerationJobs: "No generation jobs queued yet.",
      noQuests: "No quests created yet.",
      noTriggers: "No triggers created yet.",
      noDialogueGraphs: "No dialogue graphs created yet.",
      noFlags: "No flags authored yet.",
      noCollisions: "No collision volumes defined yet.",
      noSceneNodes: "No scene nodes authored yet.",
      noAutomationRuns: "No automation runs queued yet.",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      preview: "Preview",
      sceneId: "Scene ID",
      sceneIdPlaceholder: "scene.teaHouse.annex",
      sceneTitle: "Scene Title",
      sceneBackgroundLabel: "Background asset",
      scenePreviewTitle: "Scene preview",
      runtimePreviewTitle: "Runtime preview",
      spawnPoint: "Spawn Point",
      geometry: "Geometry",
      sceneModeLabel: "Scene mode",
      sceneMode2d: "2D",
      sceneMode3d: "3D",
      sceneNodes: "Scene nodes",
      collisions: "Collisions",
      npcName: "NPC Name",
      labelField: "Label",
      npcLabel: "NPC Label",
      npcPosition: "Position",
      interactRadius: "Interact Radius",
      wanderRadius: "Wander Radius",
      wanderSpeed: "Wander Speed",
      idlePauseMinMs: "Idle pause min (ms)",
      idlePauseMaxMs: "Idle pause max (ms)",
      greetLineKey: "Greeting line key",
      greetOnApproach: "Greet on approach",
      dialogueKey: "Dialogue Key",
      dialogueLine: "Dialogue Line",
      providerStatus: "Provider Status",
      availableModels: "Available Models",
      knowledgeWorkspaceTitle: "Knowledge workspace",
      knowledgeWorkspaceDescription:
        "Index project-specific implementation notes, lore, or asset references for grounded retrieval and agentic planning.",
      knowledgeTitleLabel: "Document title",
      knowledgeSourceLabel: "Document source",
      knowledgeTextLabel: "Document text",
      ingestKnowledgeDocument: "Index knowledge document",
      deleteKnowledgeDocument: "Delete document",
      deleteKnowledgeDocumentConfirm: "Delete this indexed knowledge document?",
      knowledgeChunksLabel: "chunks",
      noKnowledgeDocuments: "No knowledge documents indexed yet.",
      retrievalWorkspaceTitle: "Retrieval test",
      retrievalWorkspaceDescription:
        "Ground an implementation answer in the project knowledge base before applying AI-authored changes.",
      retrievalPromptPlaceholder:
        "What builder steps should I take to wire a new quest intro with grounded dialogue?",
      runRetrievalAssist: "Run retrieval assist",
      retrievalResultTitle: "Grounded retrieval result",
      noKnowledgeMatches: "No indexed knowledge chunks matched this prompt.",
      toolPlanWorkspaceTitle: "Tool plan preview",
      toolPlanWorkspaceDescription:
        "Generate a structured agent/tool plan before running automation or applying project mutations.",
      toolPlanGoalPlaceholder:
        "Prepare a safe builder plan to add a guide NPC, connect its dialogue graph, and publish a reviewable draft.",
      previewToolPlan: "Preview tool plan",
      toolPlanPreviewTitle: "Structured tool plan",
      toolPlanPreviewDescription:
        "Review the generated step sequence before turning it into automation or manual builder work.",
      closeSidebar: "Close sidebar",
      currentProject: "Current project",
      projectIdLabel: "Project ID",
      projectIdPlaceholder: "adventure-quest",
      projectDraftVersion: "Draft version",
      projectPublishedVersion: "Published release",
      projectStatus: "Status",
      projectLastUpdated: "Last updated",
      projectStatusDraft: "Draft only",
      projectStatusPublished: "Published",
      versionPrefix: "v",
      projectStatusUnpublished: "Unpublished",
      createProject: "Create project",
      switchProject: "Switch project",
      exitBuilder: "Exit builder",
      publishProject: "Publish release",
      unpublishProject: "Unpublish release",
      playPublishedBuild: "Play published build",
      createProjectHelp:
        "Create a new project from the current baseline or switch to an existing project by ID.",
      projectPlayHint: "Only published releases can be launched in the player.",
      capabilityHeader: "Capability",
      statusHeader: "Status",
      visionLabel: "Vision",
      sentimentLabel: "Sentiment",
      embeddingsLabel: "Embeddings",
      speechToTextLabel: "Speech to Text",
      speechSynthesisLabel: "Text to Speech",
      voicePreviewTitle: "Voice Preview",
      voicePreviewDescription:
        "Test speech synthesis and transcription capabilities using the configured AI providers.",
      synthesizeTextPlaceholder: "Enter text to synthesize...",
      synthesizeSubmit: "Synthesize",
      transcribeSubmit: "Transcribe",
      transcribeFileLabel: "Audio file",
      localInferenceLabel: "Local Inference",
      idLabel: "ID",
      titleLabel: "Title",
      descriptionLabel: "Description",
      npcIdLabel: "NPC ID",
      messageLabel: "Message",
      promptLabel: "Prompt",
      widthLabel: "Width",
      heightLabel: "Height",
      xLabel: "X",
      yLabel: "Y",
      zLabel: "Z",
      yesLabel: "Yes",
      noLabel: "No",
      filterAction: "Filter results",
      openDetails: "Open details",
      selectNode: "Select node",
      selectedNodeLabel: "Selected node",
      noNodeSelected: "No node selected",
      transformModeTranslate: "Translate",
      transformModeRotate: "Rotate",
      transformModeScale: "Scale",
      createSceneNode: "Create scene node",
      continueAuthoring: "Continue authoring",
      quickActionScene: "New Scene",
      quickActionSceneDesc: "Create a new environment for your game world.",
      quickActionNpc: "Add Character",
      quickActionNpcDesc: "Bring a new NPC to life with AI-powered dialogue.",
      quickActionDialogue: "Write Dialogue",
      quickActionDialogueDesc: "Craft conversations and story branches.",
      quickActionAi: "Generate with AI",
      quickActionAiDesc: "Use AI to create scenes, dialogue, or assets.",
      statusBarProject: "Project",
      statusBarAi: "AI Engine",
      statusBarJobs: "Jobs",
      aiAssistFab: "AI Assist",
      nodeIdLabel: "Node ID",
      nodeTypeLabel: "Node type",
      layerLabel: "Layer",
      assetIdFieldLabel: "Asset ID",
      animationClipIdFieldLabel: "Animation clip ID",
      generationTargetLabel: "Target ID",
      operationsJsonLabel: "Patch operations JSON",
      rotationLabel: "Rotation",
      scaleLabel: "Scale",
      sceneNodeTypeSprite: "Sprite",
      sceneNodeTypeTile: "Tile",
      sceneNodeTypeSpawn: "Spawn marker",
      sceneNodeTypeTrigger: "Trigger volume",
      sceneNodeTypeCamera: "Camera",
      sceneNodeTypeModel: "Model",
      sceneNodeTypeLight: "Light",
      assetKindPortrait: "Portrait",
      assetKindSpriteSheet: "Sprite sheet",
      assetKindBackground: "Background",
      assetKindModel: "3D model",
      assetKindAudio: "Audio",
      assetKindDocument: "Document",
      generationKindPortrait: "Portrait",
      generationKindSpriteSheet: "Sprite sheet",
      generationKindTiles: "Tiles",
      generationKindVoiceLine: "Voice line",
      generationKindAnimationPlan: "Animation plan",
      generationKindCombatEncounter: "Combat encounter",
      generationKindItemSet: "Item set",
      generationKindCutsceneScript: "Cutscene script",
      triggerEventLabel: "Trigger event",
      triggerEventSceneEnter: "Scene enter",
      triggerEventNpcInteract: "NPC interact",
      triggerEventChat: "Chat",
      triggerEventDialogueConfirmed: "Dialogue confirmed",
      triggerEventCombatVictory: "Combat victory",
      triggerEventItemAcquired: "Item acquired",
      rotationXLabel: "Rotation X",
      rotationYLabel: "Rotation Y",
      rotationZLabel: "Rotation Z",
      scaleXLabel: "Scale X",
      scaleYLabel: "Scale Y",
      scaleZLabel: "Scale Z",
      sceneWidthDesc: "Scene width in pixels",
      sceneHeightDesc: "Scene height in pixels",
      assetPlaceholder: "Your asset inventory for scenes and characters.",
      testNpcPlaceholder: "forestGuide",
      testMessagePlaceholder: "Tell me about the ancient ruins...",
      assistPromptPlaceholder: "How should I balance the quest guide NPC dialogue...",
      flowTitle: "Creation steps",
      flowDescription: "Follow these steps to bring your game idea to life.",
      flowSteps: [
        "Pick your game engine",
        "Add AI-powered characters",
        "Build worlds and stories",
        "Preview and polish",
        "Publish your game",
      ],
      engineOptionsTitle: "Creation paths",
      engineOptionsDescription: "Choose the workspace that fits your current creative goal.",
      runtimeLaneTitle: "Scene Studio",
      runtimeLaneDescription:
        "Design and preview game scenes, test character interactions, and fine-tune your worlds in real time.",
      pluginLaneTitle: "Character Workshop",
      pluginLaneDescription:
        "Create memorable NPCs, write branching dialogue, and shape character personalities.",
      aiLaneTitle: "AI Forge",
      aiLaneDescription:
        "AI-powered tools for generating dialogue, sprites, voices, and game assets.",
      apiSurfaceTitle: "Capabilities",
      apiSurfaceDescription: "Check which AI features are available and view integration details.",
      localRuntimeTitle: "AI Engine",
      localRuntimeDescription:
        "Your local AI engine powers characters, generates assets, and assists with game design.",
      runtimeLabel: "Engine",
      modelLabel: "AI Model",
      taskLabel: "Task",
      configKeyLabel: "Config",
      aiConfigOverrideHelp:
        "Override any model through its config-key environment variable, then restart the server.",
      docsLabel: "Docs",
      runtimeStackValue: "Game Forge Engine",
      sceneLibraryTitle: "Scene library",
      sceneCreateDescription: "Create or select a scene, then refine its layout and preview.",
      sceneCreateTitlePlaceholder: "enchantedForest",
      sceneBackgroundPlaceholder: "/assets/images/backgrounds/enchanted-forest.png",
      npcRosterTitle: "NPC roster",
      npcCreateDescription:
        "Add NPCs into a scene, then tune movement, dialogue, and greeting behavior.",
      npcCreateSceneLabel: "Owning scene",
      npcCreateKeyPlaceholder: "forestGuide",
      npcCreateLabelPlaceholder: "npc.forestGuide.label",
      assetsWorkspaceTitle: "Asset workspace",
      assetKindLabel: "Asset kind",
      assetSourceLabel: "Asset source",
      animationClipsTitle: "Animation clips",
      createAnimationClip: "Create animation clip",
      clipAssetLabel: "Asset",
      clipStateTagLabel: "State tag",
      clipFrameCountLabel: "Frame count",
      clipPlaybackLabel: "Playback FPS",
      clipTimelineDuration: "Duration",
      clipTimelineLoop: "Loops",
      clipTimelineNoLoop: "One-shot",
      clipIdLabel: "Clip ID",
      generationJobsTitle: "Generation jobs",
      generationJobKindLabel: "Job kind",
      generationPromptLabel: "Prompt",
      createGenerationJob: "Queue generation job",
      dialogueSearchLabel: "Filter dialogue",
      dialogueSearchPlaceholder: "Search by NPC or dialogue key",
      dialogueWorkspaceTitle: "Dialogue workspace",
      dialogueCreateDescription:
        "Keep dialogue grouped by NPC and use AI to draft new lines before saving.",
      dialogueKeyPlaceholder: "npc.forestGuide.greet",
      addLinePlaceholder: "Welcome, traveler. The leaves have been expecting you.",
      mechanicsWorkspaceTitle: "Mechanics workspace",
      questsTitle: "Quests",
      triggersTitle: "Triggers",
      dialogueGraphsTitle: "Dialogue graphs",
      flagsTitle: "Flags",
      mechanicsDetailHint: "Select a quest, trigger, or dialogue graph to edit.",
      createQuest: "Create quest",
      editQuest: "Edit quest",
      questIdLabel: "Quest ID",
      questTitlePlaceholder: "Meet the guide",
      questDescriptionPlaceholder: "Guide the player through the authored intro.",
      createTrigger: "Create trigger",
      editTrigger: "Edit trigger",
      triggerIdLabel: "Trigger ID",
      triggerLabelPlaceholder: "Talk to the guide",
      createDialogueGraph: "Create graph",
      editDialogueGraph: "Edit dialogue graph",
      graphIdLabel: "Graph ID",
      graphTitlePlaceholder: "Guide intro graph",
      assetLabelPlaceholder: "Hero Portrait",
      assetIdPlaceholder: "asset.custom.hero",
      clipIdPlaceholder: "clip.hero.idle",
      questIdPlaceholder: "quest.new",
      triggerIdPlaceholder: "trigger.new",
      graphIdPlaceholder: "graph.npc.guide",
      nodeIdPlaceholder: "node.hero.spawn",
      layerPlaceholder: "foreground",
      stateTagPlaceholder: "idle-down",
      sourcePathPlaceholder: "/assets/images/custom.png",
      dialogueNpcIdPlaceholder: "forestGuide",
      operationsJsonPlaceholder:
        '[{"op":"replace","path":"/dialogues/en-US/npc.guide.greet","value":"..."}]',
      assetStatusApproved: "approved",
      assetStatusDraft: "draft",
      generationPromptPlaceholder: "Generate an autumn river trader portrait with warm tones.",
      generationTargetPlaceholder: "scene or asset target (optional)",
      triggerSceneGlobal: "global",
      nodesCountLabel: "nodes",
      automationWorkspaceTitle: "Automation workspace",
      automationGoalLabel: "Automation goal",
      automationGoalPlaceholder:
        "Collect review evidence for the current scene, queue attachments, and prepare a draft apply plan.",
      automationStepsJsonLabel: "Executable steps JSON",
      automationStepsJsonPlaceholder:
        '[{"kind":"goto","path":"/builder?projectId=demo"},{"kind":"screenshot","fileStem":"demo-review","fullPage":true},{"kind":"attach-generated-artifact","sourceStepId":"step.capture-workspace"}]',
      automationStepsJsonHelp:
        "Provide an optional JSON array of executable browser, HTTP, builder, or attach-file steps. Leave blank to use the default workspace review run.",
      createAutomationRun: "Queue automation run",
      approveAction: "Approve",
      cancelAction: "Cancel",
      jobStatusQueued: "Queued",
      jobStatusRunning: "Running",
      jobStatusBlockedForApproval: "Awaiting approval",
      jobStatusSucceeded: "Succeeded",
      jobStatusFailed: "Failed",
      jobStatusCanceled: "Canceled",
      longRunningStatusProcessing: "Processing",
      generationStatusDraftReadyForReview: "Draft ready for review",
      generatedLabelPrefix: "Generated",
      reviewLabelPrefix: "Review",
      generatedArtifactSummaryFromPrompt: "Generated draft from builder prompt",
      generatedArtifactSummaryTargetPrefix: "Generated draft for",
      automationEvidenceLabel: "Automation evidence",
      automationContextLabel: "Project context",
      automationPlanArtifactLabel: "Automation plan",
      automationBundleArtifactLabel: "Execution bundle",
      automationArtifactsLabel: "Automation artifacts",
      openAutomationEvidence: "Open artifact",
      automationStepBrowser: "Browser",
      automationStepHttp: "HTTP",
      automationStepBuilder: "Builder",
      automationStepAttachFile: "Attach file",
      automationSummaryCaptureReviewContext: "Capture builder review context",
      automationSummaryPrepareDraftPlan: "Generate structured execution plan",
      automationSummaryAttachReviewEvidence: "Attach execution bundle for review",
      automationSummaryBrowserGoto: "Navigate to URL",
      automationSummaryBrowserClick: "Click element",
      automationSummaryBrowserFill: "Fill form field",
      automationSummaryBrowserAssertText: "Assert page text",
      automationSummaryBrowserScreenshot: "Capture screenshot",
      automationSummaryHttpRequest: "Send HTTP request",
      automationSummaryBuilderCreateScene: "Create scene",
      automationSummaryBuilderCreateTrigger: "Create trigger",
      automationSummaryBuilderCreateQuest: "Create quest",
      automationSummaryBuilderCreateDialogueGraph: "Create dialogue graph",
      automationSummaryBuilderCreateAsset: "Create asset",
      automationSummaryBuilderCreateAnimationClip: "Create animation clip",
      automationSummaryBuilderQueueGenerationJob: "Queue generation job",
      automationSummaryAttachGeneratedArtifact: "Attach generated artifact",
      automationArtifactSummaryCapturedReviewEvidence: "Captured builder review evidence",
      automationArtifactSummaryCapturedProjectContext: "Captured project review context",
      automationArtifactSummaryGeneratedToolPlan: "Generated structured tool plan",
      automationArtifactSummaryAttachedExecutionBundle: "Attached execution bundle",
      automationStatusQueuedForProcessing: "Queued for processing",
      automationStatusApprovedForApply: "Approved for apply",
      automationStatusCanceledByReview: "Canceled by review",
      automationStatusPlanReadyForReview: "Automation plan ready for review",
      automationStatusCapturingFallbackEvidence: "Capturing fallback review evidence",
      automationStatusOriginUnavailable:
        "Local builder automation origin is unavailable. Start the builder runtime and retry.",
      assistantReviewTitle: "Review AI changes",
      assistantReviewDescription:
        "Generate structured operations, preview them against the active project, then apply only the valid changes.",
      previewChanges: "Preview changes",
      applyChanges: "Apply changes",
      previewReady: "Preview ready",
      applyComplete: "Changes applied",
      noPublishedRelease: "No published release",
      patchOperations: "Patch operations",
      activeProjectMissing:
        "The selected project could not be loaded. Create it or switch to an existing project.",
      platformReadinessTitle: "Platform readiness",
      platformReadinessDescription:
        "This matrix shows the real product surface today: release publishing works, but game creation systems beyond the narrow baseline runtime remain partial or missing.",
      platformReadinessWarning:
        "The builder can author and publish the current baseline, but sprite generation, animation tooling, advanced mechanics, and automation are not fully wired yet.",
      readinessImplemented: "Implemented",
      readinessPartial: "Partial",
      readinessMissing: "Missing",
      implementedCountLabel: "Implemented",
      partialCountLabel: "Partial",
      missingCountLabel: "Missing",
      sceneBaselineCountLabel: "Baseline scenes",
      spriteManifestCountLabel: "Sprite manifests",
      draftVersionLabel: "Draft version",
      latestReleaseLabel: "Latest release",
      publishedReleaseLabel: "Published release",
      sceneNodeCountLabel: "Scene nodes",
      collisionMaskCountLabel: "Collision masks",
      modelAssetCountLabel: "Model assets",
      openUsdAssetCountLabel: "OpenUSD assets",
      animationTimelineCountLabel: "Timelines",
      dialogueGraphCountLabel: "Dialogue graphs",
      questCountLabel: "Quests",
      triggerCountLabel: "Triggers",
      flagCountLabel: "Flags",
      generationJobCountLabel: "Generation jobs",
      automationRunCountLabel: "Automation runs",
      automationStepCountLabel: "Automation steps",
      artifactCountLabel: "Artifacts",
      providerCountLabel: "Providers",
      capabilityReleaseFlowTitle: "Release flow",
      capabilityReleaseFlowDescription:
        "Projects can be authored, published into immutable releases, and opened in the player against a project-bound build.",
      capability2dRuntimeTitle: "2D runtime",
      capability2dRuntimeDescription:
        "A narrow browser runtime exists for one baseline content model, but there is no broad 2D world editor or reusable game-authoring pipeline yet.",
      capability3dRuntimeTitle: "3D runtime",
      capability3dRuntimeDescription:
        "Three.js is only used for atmosphere and lighting under the sprite scene. There is still no real 3D scene graph, asset pipeline, or builder authoring workflow, so 3D should be treated as missing rather than partial.",
      capabilitySpritePipelineTitle: "Sprite pipeline",
      capabilitySpritePipelineDescription:
        "The builder now supports upload, manual registration, and reviewable generated artifacts, but spritesheet parsing, packing, and reusable asset management are still incomplete.",
      capabilityAnimationPipelineTitle: "Animation pipeline",
      capabilityAnimationPipelineDescription:
        "Runtime animation manifests are supported, but there is no animation timeline, state editor, retargeting flow, or generator for new motion sets.",
      capabilityMechanicsTitle: "Mechanics systems",
      capabilityMechanicsDescription:
        "Movement, collisions, authored quests, dialogue graphs, and trigger evaluation exist, but combat, inventory, cutscenes, and richer event orchestration are still partial.",
      capabilityAiAuthoringTitle: "AI authoring",
      capabilityAiAuthoringDescription:
        "Dialogue, scene description, critique, and patch review are wired, but AI-driven asset generation and mechanics authoring are only partial today.",
      capabilityAutomationTitle: "Automation / RPA",
      capabilityAutomationDescription:
        "A lifecycle-managed worker now executes real review-context capture, structured planning, and execution-bundle attachment steps, but broader browser and tool orchestration are still partial.",
      capabilityWebgpuRendererTitle: "WebGPU Renderer",
      capabilityWebgpuRendererDescription:
        "PixiJS can auto-detect and prefer WebGPU for 2D rendering when supported, falling back to WebGL seamlessly.",
      capabilityAiOnnxGpuTitle: "ONNX GPU Acceleration",
      capabilityAiOnnxGpuDescription:
        "Transformers.js pipelines can target the WebGPU device for GPU-accelerated ONNX inference when available.",
    },
  },
  "zh-CN": {
    metadata: {
      appName: "游戏锻造局",
      appSubtitle: "AI 驱动的电子游戏创作工具",
    },
    navigation: {
      home: "首页",
      game: "游玩",
      builder: "创作",
      localeLabel: "语言",
      localeNameEnglish: "English",
      localeNameChinese: "中文",
      switchToEnglish: "切换到英文",
      switchToChinese: "切换到中文",
    },
    common: {
      openMenu: "打开导航菜单",
      closeMenu: "关闭导航菜单",
      closeSidebar: "关闭侧边栏",
      closeAiChat: "关闭 AI 对话",
      openAiAssistant: "打开 AI 助手",
      mobileNavigation: "移动端导航",
      primaryNavigation: "主导航",
      skipToContent: "跳转到主要内容",
      loading: "加载中",
      retry: "重试",
      backToTop: "返回顶部",
      themeLabel: "主题",
      themeSilk: "丝绸",
      themeAutumn: "秋色",
      themeForgeDark: "深色",
      themeForgeLight: "浅色",
      breadcrumbLabel: "面包屑导航",
      socialNavLabel: "社交链接",
      githubLabel: "GitHub",
      discordLabel: "Discord",
      twitterLabel: "Twitter / X",
      projectConfigured: "已配置项目",
      noProjectBound: "未绑定项目",
      contextLabel: "上下文",
    },
    pages: {
      home: {
        title: "AI 游戏创作器",
        heroTitle: "用 AI 构建你的世界",
        heroDescription:
          "创建场景、角色和故事 —— 由本地 AI 模型驱动。在同一个创意工作空间中设计、发布并游玩你的游戏。",
        welcomeBack: "欢迎回来。这是你当前项目工作区的概览。",
        builderCardTitle: "构建世界",
        builderCardDescription:
          "设计环境、放置物体，打造玩家将要探索的空间。AI 帮助生成地形、光照和氛围。",
        builderCardCta: "开始创作",
        openUnifiedBuilder: "打开统一构建器",
        talkToAiOracle: "与 AI 助手对话",
        playerCardTitle: "游玩你的游戏",
        playerCardDescription:
          "启动已发布的游戏，以玩家视角体验。测试玩法、调整机制，并与他人分享。",
        playerCardCta: "立即游玩",
        playtestBuild: "试玩构建",
        playtestBuildDescription: "直接进入运行时界面，验证场景、对话和机制。",
        statusUnpublishedDraft: "状态：未发布草稿",
        launchPlayerSurface: "启动玩家界面",
        projectActivity: "项目动态",
        activityEmptyTitle: "暂无项目动态",
        activityEmptyDescription:
          "在统一构建器中创建或导入项目后，这里会显示场景指标、审阅历史和发布事件。",
        projectCreatedInWorkspace: "项目已在工作区创建",
        waitingForInitialSceneDraft: "等待初始场景草稿",
        awaitingPublication: "等待发布",
        statsScenes: "场景",
        statsNpcs: "NPC",
        statsGenerations: "生成",
        loopTitle: "创作流程",
        loopDescription: "从第一个想法到可玩的游戏 —— AI 在创意过程的每一步都提供协助。",
        loopSteps: ["设计你的世界", "用 AI 创作", "发布与游玩"],
        architectureTitle: "构建世界",
        architectureDescription:
          "设计丰富的环境，包含场景、地形和交互物体。AI 生成描述、布局和氛围细节。",
        reliabilityTitle: "创建角色",
        reliabilityDescription:
          "赋予 NPC 独特的个性、对话树和 AI 生成的对话，让他们能回应玩家的选择。",
        progressiveEnhancementTitle: "AI 助手",
        progressiveEnhancementDescription:
          "本地 AI 模型生成对话、审阅你的设计并自动化重复性任务 —— 全部在你的机器上运行。",
        docsCta: "API 参考",
      },
    },
    aiPlayground: {
      cardTitle: "AI 助手",
      cardDescription:
        "生成对话、场景描述、角色背景故事等内容。本地 AI 在数秒内为你的游戏创建内容。",
      promptLabel: "你想创建什么？",
      promptPlaceholder: "描述一个场景、生成角色对话，或头脑风暴游戏机制",
      submit: "生成",
      loadingTitle: "正在创建",
      loadingDescription: "AI 助手正在生成内容。",
      modeAuto: "自动",
      idleHint: "描述你想创建的内容，AI 会为你生成。",
      emptyTitle: "无内容可生成",
      emptyDescription: "告诉 AI 你想创建什么。",
      successTitle: "生成内容",
      retryableErrorTitle: "AI 暂时繁忙",
      retryableErrorDescription: "AI 模型正忙，请稍后重试。",
      nonRetryableErrorTitle: "生成失败",
      nonRetryableErrorDescription: "此请求无法处理，请尝试重新描述你的提示。",
      unauthorizedTitle: "需要登录",
      unauthorizedDescription: "请先登录以使用 AI 助手。",
      networkErrorDescription: "无法连接 AI 模型，请检查连接后重试。",
      validationTooLong: "提示文本过长，请缩短内容。",
    },
    footer: {
      title: "游戏锻造局",
      copy: "用 AI 工具创建电子游戏。",
      ctaLabel: "API 参考",
    },
    api: {
      healthOk: "服务状态正常",
      frameworkErrors: {
        validation: "请求参数校验失败。",
        notFound: "请求的资源不存在。",
        sessionMissing: "缺少会话标识符。",
        sessionExpired: "会话已过期，请重新创建。",
        invalidCommand: "指令参数不合法。",
        aiProviderFailure: "AI 模块暂时不可用。",
        internal: "服务器发生未预期错误。",
      },
    },
    ai: {
      statusAvailable: "AI 助手已就绪",
      statusUnavailable: "AI 助手离线",
      generating: "生成中...",
      fallbackDialogue: "山雾迷蒙，前路未明……请稍后再试。",
      noProviderAvailable: "当前无可用的 AI 提供程序。",
      visionNotAvailable: "视觉分析需要 Ollama 视觉模型。",
      retrievalAssistUnavailable: "当前配置的 AI 提供方暂时无法执行检索增强问答。",
      toolPlanningUnavailable: "当前配置的 AI 提供方暂时无法生成工具执行计划。",
      dialogueGenerationUnavailable: "当前配置的 AI 提供方暂时无法生成对话内容。",
      sceneGenerationUnavailable: "当前配置的 AI 提供方暂时无法生成场景描述。",
      designAssistUnavailable: "当前配置的 AI 提供方暂时无法提供设计辅助建议。",
      audioPayloadTooLarge: "音频上传超过了当前运行时允许的大小限制。",
      audioPayloadInvalid: "音频内容无法解析为有效的 WAV 录音。",
      audioTranscriptionUnavailable: "当前配置的 AI 提供方暂时无法执行语音转写。",
      audioSynthesisUnavailable: "当前配置的 AI 提供方暂时无法执行语音合成。",
    },
    game: {
      sessionExpiredStream: "会话已过期，将停止推送。",
      sessionDeletedStream: "会话已删除，无法恢复。",
      hudStreamFailed: "HUD 推送流异常。",
      unknownLevel: "未知",
      connectingToRealm: "连接中...",
      initialXp: "经验: 0 / 等级 1",
      xpLabel: "经验",
      levelLabel: "等级",
      gameCanvasLabel: "游戏世界画布",
      connectionStatus: "连接中",
      connectionConnected: "已连接",
      connectionDisconnected: "已断开",
      connectionReconnecting: "重连中",
      connectionExpired: "会话已过期",
      connectionMissing: "会话不存在",
      reconnectAction: "重新连接",
      queueLabel: "队列",
      controlsTitle: "操作说明",
      controlsMove: "移动：WASD 或方向键",
      controlsInteract: "交互：E、回车或空格",
      controlsAdvance: "推进对话：Escape",
      runtimeSurfaceLabel: "可游玩运行时区域",
      runtimeSurfaceHint: "请先聚焦运行时区域，再使用键盘移动与交互。",
      runtimeSurfaceActive: "运行时控制已激活。",
      runtimeSurfaceInactive: "运行时控制未激活。",
      objectiveTitle: "本次验证目标",
      objectiveDescription: "确认已发布场景、对话节奏与运行时稳定性后，再返回构建器继续迭代。",
      sessionContextTitle: "当前会话",
      sessionIdLabel: "会话 ID",
      sceneLabel: "场景",
      sceneModeLabel: "场景模式",
      sceneMode2d: "2D",
      sceneMode3d: "3D",
      projectLabel: "项目",
      localeLabel: "语言",
      builderReturn: "返回构建器",
      publishedProjectLabel: "已发布项目",
      projectUnavailableValue: "未绑定项目",
      projectUnavailableTitle: "项目不存在",
      projectUnavailableDescription: "请求的项目不存在。请返回构建器，切换到有效项目或创建新项目。",
      projectUnpublishedTitle: "项目尚未发布",
      projectUnpublishedDescription: "玩家视图只运行不可变的已发布版本。请先在构建器中发布草稿。",
      sessionUnavailableTitle: "无法恢复会话",
      sessionUnavailableDescription:
        "运行时未能恢复有效的会话快照。请返回构建器重新进入，或启动一个新的已发布会话。",
      invalidInviteTitle: "邀请已失效",
      invalidInviteDescription: "该多人邀请已经过期或不可用。请向会话所有者索取新的邀请链接。",
      returnToBuilder: "返回构建器",
      multiplayerTitle: "多人协作",
      multiplayerDescription: "在不离开已发布构建的前提下，邀请控制者或旁观者加入当前运行会话。",
      participantsLabel: "参与者",
      participantRoleLabel: "角色",
      participantRoleOwner: "所有者",
      participantRoleController: "控制者",
      participantRoleSpectator: "旁观者",
      inviteControllerAction: "创建控制者邀请",
      inviteSpectatorAction: "创建旁观者邀请",
      inviteLinkLabel: "加入链接",
      spectatorModeHint: "旁观者可以观察实时会话，但不能发送游戏指令。",
      invalidCommand: "无效命令",
      invalidDirection: "无效移动方向",
      chatMissingFields: "缺少聊天对象或消息内容",
      unknownCommandType: "未识别的命令类型",
      sessionOwnershipMismatch: "会话所有权不匹配。",
      sessionAccessDenied: "没有访问该会话的权限。",
      spectatorControlDenied: "旁观者无法控制游戏。",
      sessionExpiredRequest: "请求的会话已过期。",
      sessionNotFoundRequest: "未找到会话。",
      commandRejected: "命令已被拒绝。",
      commandQueueFull: "命令队列已满。",
      commandDropped: "命令已被丢弃。",
      commandExpired: "命令在处理前已过期。",
      chatRateLimited: "聊天命令触发了限流，请稍后重试。",
      commandTypeMissing: "已接受命令缺少解析后的命令类型。",
      saveCooldownActive: "保存仍在冷却中。",
      inventoryAction: "物品操作",
      inventoryClose: "关闭背包",
      inventoryTitle: "背包",
      inventoryCapacity: "容量",
      inventoryStorage: "仓储",
      inventoryItems: "物品",
      inventoryEmpty: "空",
      inventoryWeight: "重量",
      inventoryGold: "金币",
      inventoryManageHint: "使用背包指令来管理物品。",
      inventorySessionIdLabel: "ID",
      cutsceneAdvanceHint: "使用推进过场指令（空格 / 回车）继续。",
      cutsceneInProgress: "过场动画进行中……",
      cutsceneBadge: "过场",
      cutsceneSkip: "跳过过场动画",
      combatTitle: "战斗交锋",
      combatPhaseLabel: "阶段",
      combatTurnLabel: "回合",
      combatPartyLabel: "我方",
      combatHostilesLabel: "敌方",
      combatLogEmpty: "战斗已开始……",
      combatActionHint: "使用战斗指令来推进当前遭遇战。",
      combatPhaseIntro: "开场",
      combatPhasePlayerTurn: "玩家回合",
      combatPhaseEnemyTurn: "敌方回合",
      combatPhaseVictory: "胜利",
      combatPhaseDefeat: "失败",
      hitPointsShortLabel: "生命值",
    },
    builder: {
      projectNotFound: "项目未找到",
      sceneNotFound: "场景未找到",
      npcNotFound: "NPC 未找到",
      dialogueNotFound: "对话键未找到",
      missingPrompt: "必须提供提示词",
      sceneIdRequired: "必须提供场景 ID",
      invalidPatchPlan: "补丁方案包含无效操作",
      publishValidationFailed: "发布已被阻止，必须先通过构建器校验。",
      publishValidationNoScenes: "发布前至少需要一个场景。",
      publishValidation3dSceneNeedsWebgpu: "场景 {sceneId} 需要优先使用 WebGPU 渲染器。",
      publishValidationSceneSpawnOutOfBounds: "场景 {sceneId} 的玩家出生点超出了场景边界。",
      publishValidationSceneNpcOutOfBounds: "场景 {sceneId} 中的 NPC {npcId} 超出了场景边界。",
      publishValidationNodeAssetMissing:
        "场景 {sceneId} 的节点 {nodeId} 引用了缺失资源 {assetId}。",
      publishValidationNodeAssetUnapproved:
        "场景 {sceneId} 的节点 {nodeId} 引用了未批准资源 {assetId}。",
      publishValidationNodeAssetSceneModeMismatch:
        "场景 {sceneId} 的节点 {nodeId} 需要 {expectedSceneMode} 资源，但 {assetId} 是 {actualSceneMode}。",
      publishValidationNodeAssetKindMismatch:
        "场景 {sceneId} 的节点 {nodeId} 不能使用类型为 {assetKind} 的资源 {assetId}。",
      publishValidationNodeAssetFormatUnsupported:
        "场景 {sceneId} 的节点 {nodeId} 不能使用源格式为 {sourceFormat} 的资源 {assetId}。",
      publishValidationNodeClipMissing:
        "场景 {sceneId} 的节点 {nodeId} 引用了缺失动画片段 {clipId}。",
      publishValidationNodeClipSceneModeMismatch:
        "场景 {sceneId} 的节点 {nodeId} 需要 {expectedSceneMode} 动画片段，但 {clipId} 是 {actualSceneMode}。",
      publishValidationNodeClipAssetMismatch:
        "场景 {sceneId} 的节点 {nodeId} 绑定了资源 {assetId}，但动画片段 {clipId} 属于其他资源。",
      publishValidationClipAssetMissing: "动画片段 {clipId} 引用了缺失资源 {assetId}。",
      publishValidationClipAssetSceneModeMismatch:
        "动画片段 {clipId} 与资源 {assetId} 的场景模式不一致：期望 {expectedSceneMode}，实际为 {actualSceneMode}。",
      noDialogues: "未找到对话条目",
      title: "游戏构建器",
      dashboard: "仪表盘",
      workspaceTitle: "构建器工作区",
      workspaceJumpBack: "回到你的世界继续创作，或借助 AI 助手开始新的创作。",
      scenes: "场景",
      npcs: "NPC",
      dialogue: "对话",
      assets: "资源",
      mechanics: "机制",
      automation: "自动化",
      ai: "AI 工具",
      animations: "动画",
      addScene: "添加场景",
      editScene: "编辑场景",
      addNpc: "添加 NPC",
      editNpc: "编辑 NPC",
      addDialogue: "添加对话",
      generateDialogue: "AI 生成",
      uploadAsset: "上传资源",
      addAssetPath: "添加资源（路径）",
      addAssetFile: "上传文件",
      critiqueAsset: "AI 评审",
      testDialogue: "测试对话",
      designAssist: "设计助手",
      activeSessions: "活跃会话",
      totalScenes: "场景总数",
      totalNpcs: "NPC 总数",
      aiStatus: "AI 状态",
      noScenes: "尚未定义场景。",
      noNpcs: "尚未定义 NPC。",
      noAssets: "尚未创建资源。",
      noAnimationClips: "尚未创建动画片段。",
      noGenerationJobs: "尚未加入生成任务。",
      noQuests: "尚未创建任务。",
      noTriggers: "尚未创建触发器。",
      noDialogueGraphs: "尚未创建对话图。",
      noFlags: "尚未编写标记。",
      noCollisions: "尚未定义碰撞区域。",
      noSceneNodes: "尚未编写场景节点。",
      noAutomationRuns: "尚未加入自动化运行。",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      preview: "预览",
      sceneId: "场景 ID",
      sceneIdPlaceholder: "scene.teaHouse.annex",
      sceneTitle: "场景标题",
      sceneBackgroundLabel: "背景资源",
      scenePreviewTitle: "场景预览",
      runtimePreviewTitle: "运行时预览",
      spawnPoint: "出生点",
      geometry: "几何尺寸",
      sceneModeLabel: "场景模式",
      sceneMode2d: "2D",
      sceneMode3d: "3D",
      sceneNodes: "场景节点",
      collisions: "碰撞区域",
      npcName: "NPC 名称",
      labelField: "标签",
      npcLabel: "NPC 标签",
      npcPosition: "位置",
      interactRadius: "交互半径",
      wanderRadius: "游走半径",
      wanderSpeed: "游走速度",
      idlePauseMinMs: "最短停顿（毫秒）",
      idlePauseMaxMs: "最长停顿（毫秒）",
      greetLineKey: "问候语键",
      greetOnApproach: "接近时问候",
      dialogueKey: "对话键",
      dialogueLine: "对话内容",
      providerStatus: "提供商状态",
      availableModels: "可用模型",
      knowledgeWorkspaceTitle: "知识工作区",
      knowledgeWorkspaceDescription:
        "索引项目专属的实现笔记、设定文本与资源参考，用于有依据的检索与代理式规划。",
      knowledgeTitleLabel: "文档标题",
      knowledgeSourceLabel: "文档来源",
      knowledgeTextLabel: "文档正文",
      ingestKnowledgeDocument: "索引知识文档",
      deleteKnowledgeDocument: "删除文档",
      deleteKnowledgeDocumentConfirm: "确定要删除这份已索引的知识文档吗？",
      knowledgeChunksLabel: "片段",
      noKnowledgeDocuments: "尚未索引知识文档。",
      retrievalWorkspaceTitle: "检索测试",
      retrievalWorkspaceDescription: "在应用 AI 生成修改前，先用项目知识库为实现建议提供依据。",
      retrievalPromptPlaceholder: "要如何为新任务开场接入一段有依据的引导对话？",
      runRetrievalAssist: "运行检索辅助",
      retrievalResultTitle: "有依据的检索结果",
      noKnowledgeMatches: "没有已索引的知识片段匹配当前提示词。",
      toolPlanWorkspaceTitle: "工具方案预览",
      toolPlanWorkspaceDescription:
        "在执行自动化或应用项目修改前，先生成结构化的代理 / 工具步骤方案。",
      toolPlanGoalPlaceholder:
        "准备一个安全的构建器方案：添加向导 NPC、连接其对话图，并生成可审查的发布草稿。",
      previewToolPlan: "预览工具方案",
      toolPlanPreviewTitle: "结构化工具方案",
      toolPlanPreviewDescription: "先审查生成的步骤序列，再将其转化为自动化或手动构建工作。",
      closeSidebar: "关闭侧边栏",
      currentProject: "当前项目",
      projectIdLabel: "项目 ID",
      projectIdPlaceholder: "adventure-quest",
      projectDraftVersion: "草稿版本",
      projectPublishedVersion: "发布版本",
      projectStatus: "状态",
      projectLastUpdated: "最近更新",
      projectStatusDraft: "仅草稿",
      projectStatusPublished: "已发布",
      versionPrefix: "v",
      projectStatusUnpublished: "未发布",
      createProject: "创建项目",
      switchProject: "切换项目",
      exitBuilder: "退出构建器",
      publishProject: "发布版本",
      unpublishProject: "取消发布",
      playPublishedBuild: "游玩已发布版本",
      createProjectHelp: "按 ID 创建新项目，或切换到现有项目。",
      projectPlayHint: "只有已发布版本才能在玩家视图中启动。",
      capabilityHeader: "能力",
      statusHeader: "状态",
      visionLabel: "视觉",
      sentimentLabel: "情感分析",
      embeddingsLabel: "嵌入向量",
      speechToTextLabel: "语音转文本",
      speechSynthesisLabel: "文本转语音",
      voicePreviewTitle: "语音预览",
      voicePreviewDescription: "使用已配置的 AI 提供程序测试语音合成和转录功能。",
      synthesizeTextPlaceholder: "输入要合成的文本...",
      synthesizeSubmit: "合成",
      transcribeSubmit: "转录",
      transcribeFileLabel: "音频文件",
      localInferenceLabel: "本地推理",
      idLabel: "ID",
      titleLabel: "标题",
      descriptionLabel: "说明",
      npcIdLabel: "NPC ID",
      messageLabel: "消息",
      promptLabel: "提示词",
      widthLabel: "宽度",
      heightLabel: "高度",
      xLabel: "X",
      yLabel: "Y",
      zLabel: "Z",
      yesLabel: "是",
      noLabel: "否",
      filterAction: "筛选结果",
      openDetails: "打开详情",
      selectNode: "选择节点",
      selectedNodeLabel: "当前选中节点",
      noNodeSelected: "尚未选择节点",
      transformModeTranslate: "平移",
      transformModeRotate: "旋转",
      transformModeScale: "缩放",
      createSceneNode: "创建场景节点",
      continueAuthoring: "继续创作",
      quickActionScene: "新建场景",
      quickActionSceneDesc: "为你的游戏世界创建新的环境。",
      quickActionNpc: "添加角色",
      quickActionNpcDesc: "用 AI 驱动的对话赋予新 NPC 生命。",
      quickActionDialogue: "编写对话",
      quickActionDialogueDesc: "书写对话和故事分支。",
      quickActionAi: "AI 生成",
      quickActionAiDesc: "用 AI 创建场景、对话或素材。",
      statusBarProject: "项目",
      statusBarAi: "AI 引擎",
      statusBarJobs: "任务",
      aiAssistFab: "AI 助手",
      nodeIdLabel: "节点 ID",
      nodeTypeLabel: "节点类型",
      layerLabel: "图层",
      assetIdFieldLabel: "资源 ID",
      animationClipIdFieldLabel: "动画片段 ID",
      generationTargetLabel: "目标 ID",
      operationsJsonLabel: "补丁操作 JSON",
      rotationLabel: "旋转",
      scaleLabel: "缩放",
      sceneNodeTypeSprite: "精灵",
      sceneNodeTypeTile: "地块",
      sceneNodeTypeSpawn: "出生点",
      sceneNodeTypeTrigger: "触发区域",
      sceneNodeTypeCamera: "镜头",
      sceneNodeTypeModel: "模型",
      sceneNodeTypeLight: "灯光",
      assetKindPortrait: "立绘",
      assetKindSpriteSheet: "精灵表",
      assetKindBackground: "背景",
      assetKindModel: "3D 模型",
      assetKindAudio: "音频",
      assetKindDocument: "文档",
      generationKindPortrait: "立绘",
      generationKindSpriteSheet: "精灵表",
      generationKindTiles: "地块",
      generationKindVoiceLine: "语音台词",
      generationKindAnimationPlan: "动画方案",
      generationKindCombatEncounter: "战斗遭遇战",
      generationKindItemSet: "物品集",
      generationKindCutsceneScript: "过场动画脚本",
      triggerEventLabel: "触发事件",
      triggerEventSceneEnter: "进入场景",
      triggerEventNpcInteract: "与 NPC 互动",
      triggerEventChat: "聊天",
      triggerEventDialogueConfirmed: "确认对话",
      triggerEventCombatVictory: "战斗胜利",
      triggerEventItemAcquired: "获得物品",
      rotationXLabel: "旋转 X",
      rotationYLabel: "旋转 Y",
      rotationZLabel: "旋转 Z",
      scaleXLabel: "缩放 X",
      scaleYLabel: "缩放 Y",
      scaleZLabel: "缩放 Z",
      sceneWidthDesc: "场景宽度（像素）",
      sceneHeightDesc: "场景高度（像素）",
      assetPlaceholder: "场景与角色的资源清单。",
      testNpcPlaceholder: "forestGuide",
      testMessagePlaceholder: "请告诉我关于古代遗迹的事情...",
      assistPromptPlaceholder: "如何平衡任务向导 NPC 的对话...",
      flowTitle: "创作步骤",
      flowDescription: "按照以下步骤，将你的游戏创意变为现实。",
      flowSteps: ["选择游戏引擎", "添加 AI 角色", "构建世界和故事", "预览和打磨", "发布你的游戏"],
      engineOptionsTitle: "创作路径",
      engineOptionsDescription: "选择适合当前创作目标的工作区。",
      runtimeLaneTitle: "场景工坊",
      runtimeLaneDescription: "设计和预览游戏场景，测试角色交互，实时调整你的世界。",
      pluginLaneTitle: "角色工坊",
      pluginLaneDescription: "创建令人难忘的 NPC，编写分支对话，塑造角色个性。",
      aiLaneTitle: "AI 锻造炉",
      aiLaneDescription: "AI 驱动的工具，用于生成对话、精灵、语音和游戏素材。",
      apiSurfaceTitle: "功能面板",
      apiSurfaceDescription: "检查哪些 AI 功能可用，查看集成详情。",
      localRuntimeTitle: "AI 引擎",
      localRuntimeDescription: "本地 AI 引擎为角色赋能，生成素材，并协助游戏设计。",
      runtimeLabel: "引擎",
      modelLabel: "AI 模型",
      taskLabel: "任务",
      configKeyLabel: "配置",
      aiConfigOverrideHelp: "可通过对应的配置键环境变量覆盖模型，修改后请重启服务器。",
      docsLabel: "文档",
      runtimeStackValue: "Game Forge 引擎",
      sceneLibraryTitle: "场景库",
      sceneCreateDescription: "先创建或选择场景，再细化布局与预览。",
      sceneCreateTitlePlaceholder: "enchantedForest",
      sceneBackgroundPlaceholder: "/assets/images/backgrounds/enchanted-forest.png",
      npcRosterTitle: "NPC 阵列",
      npcCreateDescription: "先把 NPC 放进场景，再调节移动、对话与接近问候行为。",
      npcCreateSceneLabel: "所属场景",
      npcCreateKeyPlaceholder: "forestGuide",
      npcCreateLabelPlaceholder: "npc.forestGuide.label",
      assetsWorkspaceTitle: "资源工作区",
      assetKindLabel: "资源类型",
      assetSourceLabel: "资源来源",
      animationClipsTitle: "动画片段",
      createAnimationClip: "创建动画片段",
      clipAssetLabel: "所属资源",
      clipStateTagLabel: "状态标签",
      clipFrameCountLabel: "帧数",
      clipPlaybackLabel: "播放 FPS",
      clipTimelineDuration: "时长",
      clipTimelineLoop: "循环",
      clipTimelineNoLoop: "单次播放",
      clipIdLabel: "片段 ID",
      generationJobsTitle: "生成任务",
      generationJobKindLabel: "任务类型",
      generationPromptLabel: "提示词",
      createGenerationJob: "加入生成队列",
      dialogueSearchLabel: "筛选对话",
      dialogueSearchPlaceholder: "按 NPC 或对话键搜索",
      dialogueWorkspaceTitle: "对话工作区",
      dialogueCreateDescription: "按 NPC 管理对话，并先用 AI 起草再保存。",
      dialogueKeyPlaceholder: "npc.forestGuide.greet",
      addLinePlaceholder: "旅人，欢迎你。茶叶早已预见你的到来。",
      mechanicsWorkspaceTitle: "机制工作区",
      questsTitle: "任务",
      triggersTitle: "触发器",
      dialogueGraphsTitle: "对话图",
      flagsTitle: "标记",
      mechanicsDetailHint: "选择一个任务、触发器或对话图进行编辑。",
      createQuest: "创建任务",
      editQuest: "编辑任务",
      questIdLabel: "任务 ID",
      questTitlePlaceholder: "遇见向导",
      questDescriptionPlaceholder: "引导玩家完成已创作的介绍流程。",
      createTrigger: "创建触发器",
      editTrigger: "编辑触发器",
      triggerIdLabel: "触发器 ID",
      triggerLabelPlaceholder: "与向导交谈",
      createDialogueGraph: "创建对话图",
      editDialogueGraph: "编辑对话图",
      graphIdLabel: "对话图 ID",
      graphTitlePlaceholder: "向导介绍对话图",
      assetLabelPlaceholder: "英雄肖像",
      assetIdPlaceholder: "asset.custom.hero",
      clipIdPlaceholder: "clip.hero.idle",
      questIdPlaceholder: "quest.new",
      triggerIdPlaceholder: "trigger.new",
      graphIdPlaceholder: "graph.npc.guide",
      nodeIdPlaceholder: "node.hero.spawn",
      layerPlaceholder: "foreground",
      stateTagPlaceholder: "idle-down",
      sourcePathPlaceholder: "/assets/images/custom.png",
      dialogueNpcIdPlaceholder: "forestGuide",
      operationsJsonPlaceholder:
        '[{"op":"replace","path":"/dialogues/zh-CN/npc.guide.greet","value":"..."}]',
      assetStatusApproved: "已批准",
      assetStatusDraft: "草稿",
      generationPromptPlaceholder: "生成一幅秋日河畔商人的暖色调肖像。",
      generationTargetPlaceholder: "场景或资源目标（可选）",
      triggerSceneGlobal: "全局",
      nodesCountLabel: "节点",
      automationWorkspaceTitle: "自动化工作区",
      automationGoalLabel: "自动化目标",
      automationGoalPlaceholder: "收集当前场景的审查证据，排队附件，并准备草稿应用计划。",
      automationStepsJsonLabel: "可执行步骤 JSON",
      automationStepsJsonPlaceholder:
        '[{"kind":"goto","path":"/builder?projectId=demo"},{"kind":"screenshot","fileStem":"demo-review","fullPage":true},{"kind":"attach-generated-artifact","sourceStepId":"step.capture-workspace"}]',
      automationStepsJsonHelp:
        "可选填写可执行的 JSON 步骤数组，支持浏览器、HTTP、构建器与附加文件步骤；留空则使用默认工作区审查流程。",
      createAutomationRun: "加入自动化队列",
      approveAction: "批准",
      cancelAction: "取消",
      jobStatusQueued: "已排队",
      jobStatusRunning: "运行中",
      jobStatusBlockedForApproval: "等待批准",
      jobStatusSucceeded: "已成功",
      jobStatusFailed: "失败",
      jobStatusCanceled: "已取消",
      longRunningStatusProcessing: "处理中",
      generationStatusDraftReadyForReview: "草稿已准备好供审查",
      generatedLabelPrefix: "已生成",
      reviewLabelPrefix: "审查",
      generatedArtifactSummaryFromPrompt: "已根据构建器提示生成草稿",
      generatedArtifactSummaryTargetPrefix: "已为以下目标生成草稿：",
      automationEvidenceLabel: "自动化证据",
      automationContextLabel: "项目上下文",
      automationPlanArtifactLabel: "自动化方案",
      automationBundleArtifactLabel: "执行包",
      automationArtifactsLabel: "自动化产物",
      openAutomationEvidence: "打开产物",
      automationStepBrowser: "浏览器",
      automationStepHttp: "HTTP",
      automationStepBuilder: "构建器",
      automationStepAttachFile: "附加文件",
      automationSummaryCaptureReviewContext: "采集构建器审查上下文",
      automationSummaryPrepareDraftPlan: "生成结构化执行方案",
      automationSummaryAttachReviewEvidence: "附加可审查执行包",
      automationSummaryBrowserGoto: "导航至链接",
      automationSummaryBrowserClick: "点击元素",
      automationSummaryBrowserFill: "填写表单字段",
      automationSummaryBrowserAssertText: "断言页面文本",
      automationSummaryBrowserScreenshot: "截图",
      automationSummaryHttpRequest: "发送HTTP请求",
      automationSummaryBuilderCreateScene: "创建场景",
      automationSummaryBuilderCreateTrigger: "创建触发器",
      automationSummaryBuilderCreateQuest: "创建任务",
      automationSummaryBuilderCreateDialogueGraph: "创建对话图",
      automationSummaryBuilderCreateAsset: "创建资源",
      automationSummaryBuilderCreateAnimationClip: "创建动画片段",
      automationSummaryBuilderQueueGenerationJob: "加入生成队列",
      automationSummaryAttachGeneratedArtifact: "附加生成产物",
      automationArtifactSummaryCapturedReviewEvidence: "已采集构建器审查证据",
      automationArtifactSummaryCapturedProjectContext: "已采集项目审查上下文",
      automationArtifactSummaryGeneratedToolPlan: "已生成结构化工具方案",
      automationArtifactSummaryAttachedExecutionBundle: "已附加执行包",
      automationStatusQueuedForProcessing: "已加入处理队列",
      automationStatusApprovedForApply: "已批准应用",
      automationStatusCanceledByReview: "已在审查中取消",
      automationStatusPlanReadyForReview: "自动化方案已准备好供审查",
      automationStatusCapturingFallbackEvidence: "正在采集回退审查证据",
      automationStatusOriginUnavailable: "本地构建器自动化目标不可用。请先启动构建运行时后重试。",
      assistantReviewTitle: "审查 AI 修改",
      assistantReviewDescription: "先生成结构化操作，再对当前项目预览，仅在有效时应用。",
      previewChanges: "预览修改",
      applyChanges: "应用修改",
      previewReady: "预览已生成",
      applyComplete: "修改已应用",
      noPublishedRelease: "尚无已发布版本",
      patchOperations: "补丁操作",
      activeProjectMissing: "当前选择的项目无法加载。请创建项目或切换到已有项目。",
      platformReadinessTitle: "平台完成度",
      platformReadinessDescription:
        "这里展示的是当前真实产品面：发布与回放链路已可用，但超出当前基线运行时的创作系统仍多为部分实现或缺失。",
      platformReadinessWarning:
        "构建器已经可以编辑并发布当前基线项目，但精灵生成、动画工具、复杂机制与自动化流程尚未真正接通。",
      readinessImplemented: "已实现",
      readinessPartial: "部分实现",
      readinessMissing: "缺失",
      implementedCountLabel: "已实现",
      partialCountLabel: "部分实现",
      missingCountLabel: "缺失",
      sceneBaselineCountLabel: "基线场景数",
      spriteManifestCountLabel: "精灵清单数",
      draftVersionLabel: "草稿版本",
      latestReleaseLabel: "最新版本",
      publishedReleaseLabel: "已发布版本",
      sceneNodeCountLabel: "场景节点",
      collisionMaskCountLabel: "碰撞遮罩",
      modelAssetCountLabel: "模型资源",
      openUsdAssetCountLabel: "OpenUSD 资源",
      animationTimelineCountLabel: "时间轴",
      dialogueGraphCountLabel: "对话图",
      questCountLabel: "任务",
      triggerCountLabel: "触发器",
      flagCountLabel: "标记",
      generationJobCountLabel: "生成任务",
      automationRunCountLabel: "自动化运行",
      automationStepCountLabel: "自动化步骤",
      artifactCountLabel: "产物",
      providerCountLabel: "提供器",
      capabilityReleaseFlowTitle: "发布链路",
      capabilityReleaseFlowDescription:
        "项目已经可以创作、发布为不可变版本，并在玩家视图中按项目进入已发布构建。",
      capability2dRuntimeTitle: "2D 运行时",
      capability2dRuntimeDescription:
        "当前只有一套较窄的浏览器运行时可验证基线内容模型，还没有通用的 2D 世界编辑器或复用型游戏创作流水线。",
      capability3dRuntimeTitle: "3D 运行时",
      capability3dRuntimeDescription:
        "Three.js 目前只承担精灵场景下方的氛围与光照效果。仍然没有真正的 3D 场景图、资源管线或构建器创作工作流，因此 3D 应视为缺失而非部分实现。",
      capabilitySpritePipelineTitle: "精灵资源管线",
      capabilitySpritePipelineDescription:
        "构建器现在已经支持上传、手动登记以及可审查的生成产物，但精灵表解析、打包与可复用资源管理仍未完整实现。",
      capabilityAnimationPipelineTitle: "动画管线",
      capabilityAnimationPipelineDescription:
        "运行时已经支持动画清单，但没有动画时间轴、状态编辑器、重定向流程或新动作生成能力。",
      capabilityMechanicsTitle: "机制系统",
      capabilityMechanicsDescription:
        "移动、碰撞、任务、对话图与触发器求值已经接通，但战斗、背包、过场与更丰富的事件编排仍只是部分实现。",
      capabilityAiAuthoringTitle: "AI 创作",
      capabilityAiAuthoringDescription:
        "对话、场景描述、资源评审与补丁审查已经接通，但 AI 驱动的资源生成与机制创作目前仍只是部分实现。",
      capabilityAutomationTitle: "自动化 / RPA",
      capabilityAutomationDescription:
        "系统现在已有生命周期托管的后台 worker，会执行真实的审查上下文采集、结构化规划与执行包附加步骤，但更广泛的浏览器与工具编排仍只是部分实现。",
      capabilityWebgpuRendererTitle: "WebGPU 渲染器",
      capabilityWebgpuRendererDescription:
        "PixiJS 可在支持 WebGPU 时自动检测并优先使用 WebGPU 进行 2D 渲染，否则无缝回退至 WebGL。",
      capabilityAiOnnxGpuTitle: "ONNX GPU 加速",
      capabilityAiOnnxGpuDescription:
        "Transformers.js 管线可在支持时将 ONNX 推理定向至 WebGPU 设备进行 GPU 加速。",
    },
  },
};
