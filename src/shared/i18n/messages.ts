import type { LocaleCode } from "../../config/environment.ts";
import { isRecord } from "../utils/safe-json.ts";

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
    readonly controlPlane: string;
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
    readonly foundationLabel: string;
    readonly skipToContent: string;
    readonly loading: string;
    readonly retry: string;
    readonly backToTop: string;
    readonly themeLabel: string;
    readonly themeTeaDark: string;
    readonly themeTeaLight: string;
    readonly breadcrumbLabel: string;
    readonly resourcesNavLabel: string;
    readonly socialNavLabel: string;
    readonly githubLabel: string;
    readonly discordLabel: string;
    readonly twitterLabel: string;
    readonly projectConfigured: string;
    readonly noProjectBound: string;
    readonly contextLabel: string;
    readonly notApplicable: string;
    readonly dismiss: string;
    readonly statsEmptyValue: string;
    readonly noActiveJobs: string;
    readonly requestFailed: string;
  };
  readonly pages: {
    readonly home: {
      readonly title: string;
      readonly heroTitle: string;
      readonly heroDescription: string;
      readonly welcomeBack: string;
      readonly quickStartHint: string;
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
      readonly sceneLauncherTitle: string;
      readonly sceneLauncherDescription: string;
      readonly launch2dScene: string;
      readonly launch3dScene: string;
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
    readonly controlPlane: {
      readonly title: string;
      readonly workspaceLabel: string;
      readonly workspaceDescription: string;
      readonly gamesTitle: string;
      readonly gamesDescription: string;
      readonly librariesTitle: string;
      readonly librariesDescription: string;
      readonly templatesTitle: string;
      readonly templatesDescription: string;
      readonly capabilitiesTitle: string;
      readonly capabilitiesDescription: string;
      readonly releasesTitle: string;
      readonly releasesDescription: string;
      readonly reviewTitle: string;
      readonly reviewDescription: string;
      readonly gamesMetric: string;
      readonly librariesMetric: string;
      readonly templatesMetric: string;
      readonly reviewMetric: string;
      readonly globalKnowledgeLabel: string;
      readonly focusedProjectLabel: string;
      readonly allProjectsLabel: string;
      readonly scopeContractLabel: string;
      readonly ownershipModelTitle: string;
      readonly ownershipModelDescription: string;
      readonly focusedProjectTitle: string;
      readonly focusedProjectDescription: string;
      readonly createProject: string;
      readonly openBuilder: string;
      readonly openBrandControl: string;
      readonly openReviewQueue: string;
      readonly focusProject: string;
      readonly sharedAssetsTitle: string;
      readonly createFromTemplate: string;
      readonly recommendedLabel: string;
      readonly publishedLabel: string;
      readonly draftLabel: string;
      readonly releaseLabel: string;
      readonly releaseVersionPrefix: string;
      readonly activeReleaseLabel: string;
      readonly archivedReleaseLabel: string;
      readonly lastUpdatedLabel: string;
      readonly sceneCountLabel: string;
      readonly assetCountLabel: string;
      readonly reviewCountLabel: string;
      readonly libraryAssetsLabel: string;
      readonly libraryProjectsLabel: string;
      readonly capabilitySettingsLabel: string;
      readonly capabilityReadyLabel: string;
      readonly capabilityIssuesLabel: string;
      readonly approvedLabel: string;
      readonly pendingReviewLabel: string;
      readonly scopeGlobal: string;
      readonly scopeOrganization: string;
      readonly scopeProject: string;
      readonly scopeRelease: string;
      readonly scopeSession: string;
      readonly emptyGamesTitle: string;
      readonly emptyGamesDescription: string;
      readonly emptyLibrariesTitle: string;
      readonly emptyLibrariesDescription: string;
      readonly emptyCapabilitiesTitle: string;
      readonly emptyCapabilitiesDescription: string;
      readonly emptyReleasesTitle: string;
      readonly emptyReleasesDescription: string;
      readonly emptyReviewTitle: string;
      readonly emptyReviewDescription: string;
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
    readonly sessionInfoLabel: string;
    readonly questLogTitle: string;
    readonly questStepActive: string;
    readonly questStepCompleted: string;
    readonly questStepPending: string;
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
    readonly dialogueConfirm: string;
    readonly inventoryAction: string;
    readonly inventoryClose: string;
    readonly inventoryTitle: string;
    readonly inventoryCapacity: string;
    readonly inventoryStorage: string;
    readonly inventoryItems: string;
    readonly inventoryEmpty: string;
    readonly inventoryWeight: string;
    readonly inventoryGold: string;
    readonly inventoryWeightPlaceholder: string;
    readonly inventoryGoldPlaceholder: string;
    readonly inventoryManageHint: string;
    readonly inventorySessionIdLabel: string;
    readonly inventoryUse: string;
    readonly inventoryEquip: string;
    readonly inventoryUnequip: string;
    readonly inventoryEquipment: string;
    readonly inventoryWeapon: string;
    readonly inventoryArmor: string;
    readonly inventoryAccessory: string;
    readonly cutsceneSkip: string;
    readonly cutsceneAdvance: string;
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
    readonly combatAttack: string;
    readonly combatDefend: string;
    readonly combatSkill: string;
    readonly combatFlee: string;
    readonly combatPhaseIntro: string;
    readonly combatPhasePlayerTurn: string;
    readonly combatPhaseEnemyTurn: string;
    readonly combatPhaseVictory: string;
    readonly combatPhaseDefeat: string;
    readonly hitPointsShortLabel: string;
    readonly saveAction: string;
    readonly loadAction: string;
    readonly saveSlotTitle: string;
    readonly saveSlotNamePlaceholder: string;
    readonly saveSlotNameLabel: string;
    readonly saveSlotSuccess: string;
    readonly loadSlotTitle: string;
    readonly loadSlotEmpty: string;
    readonly loadSlotRestore: string;
    readonly loadSlotCreatedAt: string;
    readonly keyBindingsTitle: string;
    readonly keyBindingsDescription: string;
    readonly keyBindingsSetButton: string;
    readonly keyBindingsListeningHint: string;
    readonly keyBindingsResetDefaults: string;
    readonly keyBindingsUpdatedHint: string;
    readonly keyBindingsActionMoveUp: string;
    readonly keyBindingsActionMoveDown: string;
    readonly keyBindingsActionMoveLeft: string;
    readonly keyBindingsActionMoveRight: string;
    readonly keyBindingsActionInteract: string;
    readonly keyBindingsActionMenu: string;
    readonly keyBindingsActionClose: string;
  };
  readonly builder: {
    readonly projectNotFound: string;
    readonly sceneNotFound: string;
    readonly npcNotFound: string;
    readonly dialogueNotFound: string;
    readonly missingPrompt: string;
    readonly hfTrainingInvalidRequest: string;
    readonly sceneIdRequired: string;
    readonly sceneTitleRequired: string;
    readonly npcNameRequired: string;
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
    readonly playtest: string;
    readonly settings: string;
    readonly advancedTools: string;
    readonly navGroupOverview: string;
    readonly navGroupAuthoring: string;
    readonly navGroupContent: string;
    readonly navGroupSystems: string;
    readonly navGroupRuntime: string;
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
    readonly stableIdLabel: string;
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
    readonly fineTuneWorkspaceTitle: string;
    readonly fineTuneWorkspaceDescription: string;
    readonly hfTrainingDatasetLabel: string;
    readonly hfTrainingDatasetPlaceholder: string;
    readonly hfTrainingSplitLabel: string;
    readonly hfTrainingBaseModelLabel: string;
    readonly hfTrainingOutputModelLabel: string;
    readonly hfTrainingOutputModelPlaceholder: string;
    readonly hfTrainingMethodLabel: string;
    readonly hfTrainingMethodSft: string;
    readonly hfTrainingMethodDpo: string;
    readonly hfTrainingMethodGrpo: string;
    readonly hfTrainingMethodReward: string;
    readonly hfTrainingEpochsLabel: string;
    readonly hfTrainingLearningRateLabel: string;
    readonly hfTrainingSubmit: string;
    readonly hfTrainingQueuedTitle: string;
    readonly hfTrainingQueuedDescription: string;
    readonly aiModelCatalogWorkspaceTitle: string;
    readonly aiModelCatalogWorkspaceDescription: string;
    readonly aiModelCatalogSearchTitle: string;
    readonly aiModelCatalogSearchDescription: string;
    readonly aiModelCatalogSearchPlaceholder: string;
    readonly aiModelCatalogAuthorPlaceholder: string;
    readonly aiModelCatalogSearchSubmit: string;
    readonly aiModelCatalogResetSubmit: string;
    readonly aiModelCatalogNoResults: string;
    readonly aiModelCatalogNoLaneSettings: string;
    readonly aiModelCatalogPullPlaceholder: string;
    readonly aiModelCatalogPullSubmit: string;
    readonly aiModelCatalogSourceOverride: string;
    readonly aiModelCatalogSourceEnv: string;
    readonly aiModelCatalogSourceDefault: string;
    readonly aiModelCatalogLaneTransformersLocal: string;
    readonly aiModelCatalogLaneOllama: string;
    readonly aiModelCatalogLaneApiCompatibleLocal: string;
    readonly aiModelCatalogLaneApiCompatibleCloud: string;
    readonly aiModelCatalogLaneHfInference: string;
    readonly aiModelCatalogLaneHfEndpoints: string;
    readonly aiModelCatalogLaneImageGeneration: string;
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
    readonly starterProjectTitle: string;
    readonly starterProjectDescription: string;
    readonly starterProjectTemplateLegend: string;
    readonly starterProjectRecommendedLabel: string;
    readonly starterProjectTemplateBlankLabel: string;
    readonly starterProjectTemplateBlankDescription: string;
    readonly starterProjectTemplateStoryLabel: string;
    readonly starterProjectTemplateStoryDescription: string;
    readonly starterProjectTemplate2dLabel: string;
    readonly starterProjectTemplate2dDescription: string;
    readonly starterProjectTemplate3dLabel: string;
    readonly starterProjectTemplate3dDescription: string;
    readonly projectSettings: string;
    readonly brandControlPlaneTitle: string;
    readonly brandControlPlaneDescription: string;
    readonly brandIdentityTitle: string;
    readonly brandIdentityDescription: string;
    readonly brandVisualSystemTitle: string;
    readonly brandVisualSystemDescription: string;
    readonly brandExperienceCopyTitle: string;
    readonly brandExperienceCopyDescription: string;
    readonly brandPreviewTitle: string;
    readonly brandPreviewDescription: string;
    readonly brandAppNameLabel: string;
    readonly brandAppSubtitleLabel: string;
    readonly brandLogoMarkLabel: string;
    readonly brandLogoImagePathLabel: string;
    readonly brandBuilderShellNameLabel: string;
    readonly brandBuilderShellDescriptionLabel: string;
    readonly brandPlayerShellNameLabel: string;
    readonly brandSurfaceThemeLabel: string;
    readonly brandHeadingFontLabel: string;
    readonly brandBodyFontLabel: string;
    readonly brandMonoFontLabel: string;
    readonly brandPrimaryColorLabel: string;
    readonly brandSecondaryColorLabel: string;
    readonly brandAccentColorLabel: string;
    readonly brandNeutralColorLabel: string;
    readonly brandBaseColorLabel: string;
    readonly brandBaseContentColorLabel: string;
    readonly saveBrandControlPlane: string;
    readonly operations: string;
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
    readonly tilemapTabLabel: string;
    readonly tilemapTileSetLabel: string;
    readonly tilemapBrushLabel: string;
    readonly tilemapFillLabel: string;
    readonly tilemapToolsLabel: string;
    readonly tilePaletteLabel: string;
    readonly tileCellLabel: string;
    readonly tilemapSelectedTileLabel: string;
    readonly tilemapEmptyTileLabel: string;
    readonly tilemapEraserLabel: string;
    readonly tilemapInstructions: string;
    readonly modelPathLabel: string;
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
    readonly workflowGuideTitle: string;
    readonly workflowGuideDescription: string;
    readonly workflowStartWithWorldTitle: string;
    readonly workflowStartWithWorldDescription: string;
    readonly workflowPopulateWorldTitle: string;
    readonly workflowPopulateWorldDescription: string;
    readonly workflowWireProgressTitle: string;
    readonly workflowWireProgressDescription: string;
    readonly workflowPlaytestTitle: string;
    readonly workflowPlaytestDescription: string;
    readonly modePrimerTitle: string;
    readonly modePrimerDescription: string;
    readonly modePrimer2dTitle: string;
    readonly modePrimer2dDescription: string;
    readonly modePrimer3dTitle: string;
    readonly modePrimer3dDescription: string;
    readonly modePrimerUsdTitle: string;
    readonly modePrimerUsdDescription: string;
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
    readonly sceneCreationHelp: string;
    readonly scene2dHelp: string;
    readonly scene3dHelp: string;
    readonly sceneCreateTitlePlaceholder: string;
    readonly sceneBackgroundPlaceholder: string;
    readonly npcRosterTitle: string;
    readonly npcCreateDescription: string;
    readonly npcCreateSceneLabel: string;
    readonly npcCreateKeyPlaceholder: string;
    readonly npcCreateLabelPlaceholder: string;
    readonly assetsWorkspaceTitle: string;
    readonly assetsWorkspaceDescription: string;
    readonly assets2dGuide: string;
    readonly assets3dGuide: string;
    readonly assetsUsdGuide: string;
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
    readonly clipDurationEmpty: string;
    readonly clipFrameStart: string;
    readonly fpsUnit: string;
    readonly clipIdLabel: string;
    readonly generationJobsTitle: string;
    readonly generationJobKindLabel: string;
    readonly generationPromptLabel: string;
    readonly createGenerationJob: string;
    readonly creatorWorkflowTitle: string;
    readonly creatorWorkflowDescription: string;
    readonly creatorStageStartPrimary: string;
    readonly creatorStageStartSecondary: string;
    readonly creatorStageWorldPrimary: string;
    readonly creatorStageWorldSecondary: string;
    readonly creatorStageAssetsPrimary: string;
    readonly creatorStageAssetsSecondary: string;
    readonly creatorStageCharactersPrimary: string;
    readonly creatorStageCharactersSecondary: string;
    readonly creatorStageStoryPrimary: string;
    readonly creatorStageStorySecondary: string;
    readonly creatorStageSystemsPrimary: string;
    readonly creatorStageSystemsSecondary: string;
    readonly creatorStagePlaytestPrimary: string;
    readonly creatorStagePlaytestSecondary: string;
    readonly creatorStageStartCompletion: string;
    readonly creatorStageWorldCompletion: string;
    readonly creatorStageAssetsCompletion: string;
    readonly creatorStageCharactersCompletion: string;
    readonly creatorStageStoryCompletion: string;
    readonly creatorStageSystemsCompletion: string;
    readonly creatorStagePlaytestCompletion: string;
    readonly creatorCapabilityImageGeneration: string;
    readonly creatorCapabilityDialogueGeneration: string;
    readonly creatorCapabilitySpeech: string;
    readonly creatorCapabilityAutomationReview: string;
    readonly creatorCapability3dImport: string;
    readonly creatorCapabilityAnimationAssist: string;
    readonly creatorSupportTitle: string;
    readonly creatorSupportDescription: string;
    readonly creatorAssistTitle: string;
    readonly creatorAssistDescription: string;
    readonly workflowStatusReady: string;
    readonly workflowStatusInProgress: string;
    readonly workflowStatusStart: string;
    readonly resultsLabel: string;
    readonly previousPage: string;
    readonly nextPage: string;
    readonly pageLabel: string;
    readonly generateBackground: string;
    readonly generateBackgroundDescription: string;
    readonly generateTileset: string;
    readonly generateTilesetDescription: string;
    readonly generatePortrait: string;
    readonly generatePortraitDescription: string;
    readonly generateVoiceLine: string;
    readonly generateVoiceLineDescription: string;
    readonly generateIdleAnimation: string;
    readonly generateIdleAnimationDescription: string;
    readonly generateInteractionDescription: string;
    readonly animationAuthoringTitle: string;
    readonly animationAuthoringDescription: string;
    readonly animationActionIdleLoop: string;
    readonly animationActionWalkCycle: string;
    readonly animationActionBindCharacter: string;
    readonly animationActionPreviewScene: string;
    readonly creatorSafeAiDescription: string;
    readonly advancedSettingsDescription: string;
    readonly advancedAutomationDescription: string;
    readonly dialogueSearchLabel: string;
    readonly dialogueSearchPlaceholder: string;
    readonly sceneSearchLabel: string;
    readonly sceneSearchPlaceholder: string;
    readonly assetSearchLabel: string;
    readonly assetSearchPlaceholder: string;
    readonly dialogueWorkspaceTitle: string;
    readonly dialogueCreateDescription: string;
    readonly dialogueSpeakerLabel: string;
    readonly dialogueSpeakerPlaceholder: string;
    readonly dialogueMomentLabel: string;
    readonly dialogueMomentPlaceholder: string;
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
    readonly generatedBadge: string;
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
    readonly readinessSummaryExpand: string;
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

export const readMessageValue = (messages: Messages, key: string): unknown => {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (!isRecord(current) || !(part in current)) {
      return null;
    }

    current = current[part];
  }

  return current;
};

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
  const value = readMessageValue(messages, keyPath);
  if (typeof value !== "string") {
    return options.missingValueFallback ?? keyPath;
  }

  return value;
};

/**
 * Translation table keyed by locale.
 */
export const messagesByLocale: Record<LocaleCode, Messages> = {
  "en-US": {
    metadata: {
      appName: "TEA 🍵",
      appSubtitle: "Editorial game-operations platform for playable worlds",
    },
    navigation: {
      home: "Studio",
      controlPlane: "Control Plane",
      game: "Play",
      builder: "Craft",
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
      foundationLabel: "Foundation",
      skipToContent: "Skip to main content",
      loading: "Loading",
      retry: "Retry",
      backToTop: "Back to top",
      themeLabel: "Theme",
      themeTeaDark: "Tea Dark",
      themeTeaLight: "Tea Light",
      breadcrumbLabel: "Breadcrumb",
      resourcesNavLabel: "Resources",
      socialNavLabel: "Social links",
      githubLabel: "GitHub",
      discordLabel: "Discord",
      twitterLabel: "Twitter / X",
      projectConfigured: "Project configured",
      noProjectBound: "No project bound",
      contextLabel: "Context",
      notApplicable: "—",
      dismiss: "Dismiss",
      statsEmptyValue: "0",
      noActiveJobs: "0",
      requestFailed: "Request failed",
    },
    pages: {
      home: {
        title: "TEA Creator OS",
        heroTitle: "Ship playable worlds from one SSR workspace",
        heroDescription:
          "TEA unifies scene design, NPC authoring, local-first AI operations, and runtime playtest into a single release-grade workspace.",
        welcomeBack:
          "Initial release control room for worldbuilding, automation, and runtime verification.",
        quickStartHint:
          "Start in Builder to shape the first scene, then pressure-test the runtime before you publish.",
        builderCardTitle: "Worldbuilding Workspace",
        builderCardDescription:
          "Design environments, place interactables, and define the authored surface your players will actually inhabit.",
        builderCardCta: "Start worldbuilding",
        openUnifiedBuilder: "Open Builder Workspace",
        talkToAiOracle: "Open Story Oracle",
        playerCardTitle: "Runtime Playtest",
        playerCardDescription:
          "Launch the runtime surface, validate controls, and tighten mechanics before the first public release.",
        playerCardCta: "Launch runtime",
        playtestBuild: "Runtime Playtest",
        playtestBuildDescription:
          "Move from authored scene to live runtime without leaving the product surface.",
        sceneLauncherTitle: "Launch baseline scenes",
        sceneLauncherDescription:
          "Use the starter scenes to validate composition, pacing, and renderer fit.",
        launch2dScene: "Launch Tea House",
        launch3dScene: "Launch Crystal Cavern",
        statusUnpublishedDraft: "Status: Initial release",
        launchPlayerSurface: "Launch Runtime Surface",
        projectActivity: "Release Standard",
        activityEmptyTitle: "Launch-ready operating model",
        activityEmptyDescription:
          "Every project starts with the same loop: author the world, generate support assets, and verify runtime quality before publication.",
        projectCreatedInWorkspace: "World architecture defined",
        waitingForInitialSceneDraft: "Runtime validation scheduled",
        awaitingPublication: "Publication gate pending",
        statsScenes: "Worldbuilding",
        statsNpcs: "Runtime QA",
        statsGenerations: "Local AI",
        loopTitle: "Release loop",
        loopDescription:
          "From first brief to playable runtime, the system stays inside one disciplined creation and verification loop.",
        loopSteps: ["Frame the world", "Author with AI", "Verify the runtime"],
        architectureTitle: "Scene system",
        architectureDescription:
          "Scenes, interactables, and authored beats stay structured so the runtime can launch cleanly.",
        reliabilityTitle: "Character systems",
        reliabilityDescription:
          "NPCs, dialogue graphs, and encounter logic stay editable without collapsing into throwaway early-stage content.",
        progressiveEnhancementTitle: "Local-first AI",
        progressiveEnhancementDescription:
          "Use local models for generation, critique, and automation while keeping the product surface deterministic.",
        docsCta: "Read platform docs",
      },
      controlPlane: {
        title: "Control Plane",
        workspaceLabel: "Control-plane workspaces",
        workspaceDescription:
          "Separate portfolio, library, capability, release, and review concerns from in-project authoring.",
        gamesTitle: "Games",
        gamesDescription:
          "Portfolio-wide visibility into every game, its authored scope, brand state, and current release posture.",
        librariesTitle: "Libraries",
        librariesDescription:
          "Browse approved runtime assets and review-stage media as reusable packs instead of burying everything inside one project.",
        templatesTitle: "Templates",
        templatesDescription:
          "Promote starter kits and reusable scene foundations into a top-level template catalog.",
        capabilitiesTitle: "Capabilities",
        capabilitiesDescription:
          "Manage provider policy, model routing, and runtime settings as platform capabilities rather than project-only toggles.",
        releasesTitle: "Releases",
        releasesDescription:
          "Track immutable published versions separately from mutable draft projects.",
        reviewTitle: "Review Queue",
        reviewDescription:
          "Unify generation jobs, automation approvals, and pending artifacts into one cross-project review lane.",
        gamesMetric: "Games",
        librariesMetric: "Libraries",
        templatesMetric: "Templates",
        reviewMetric: "Review items",
        globalKnowledgeLabel: "Global knowledge",
        focusedProjectLabel: "Focused project",
        allProjectsLabel: "All projects",
        scopeContractLabel: "Ownership scope",
        ownershipModelTitle: "Ownership Model",
        ownershipModelDescription:
          "Every surface now maps to an explicit scope so platform concerns do not collapse into project ids.",
        focusedProjectTitle: "Project Context",
        focusedProjectDescription:
          "Pick a project from the portfolio to jump straight into builder, branding, review, or playtest work.",
        createProject: "Create project",
        openBuilder: "Open builder",
        openBrandControl: "Open brand control",
        openReviewQueue: "Open review queue",
        focusProject: "Focus project",
        sharedAssetsTitle: "Shared Assets",
        createFromTemplate: "Create from template",
        recommendedLabel: "Recommended",
        publishedLabel: "Published",
        draftLabel: "Draft",
        releaseLabel: "Release",
        releaseVersionPrefix: "Release version",
        activeReleaseLabel: "Active release",
        archivedReleaseLabel: "Archived release",
        lastUpdatedLabel: "Last updated",
        sceneCountLabel: "Scenes",
        assetCountLabel: "Assets",
        reviewCountLabel: "Review",
        libraryAssetsLabel: "Assets",
        libraryProjectsLabel: "Projects",
        capabilitySettingsLabel: "Settings",
        capabilityReadyLabel: "Ready",
        capabilityIssuesLabel: "Issues",
        approvedLabel: "Approved",
        pendingReviewLabel: "Pending review",
        scopeGlobal: "Global: provider catalog, shared knowledge, starter templates",
        scopeOrganization: "Organization: shared libraries, team policy, reusable packs",
        scopeProject: "Project: scenes, NPCs, dialogue, assets, branding",
        scopeRelease: "Release: immutable publish snapshots and channel state",
        scopeSession: "Session: runtime player state and live playtest context",
        emptyGamesTitle: "No games yet",
        emptyGamesDescription: "Create the first project to populate the portfolio workspace.",
        emptyLibrariesTitle: "No reusable assets yet",
        emptyLibrariesDescription:
          "Approved assets and review-stage media will appear here once projects start producing them.",
        emptyCapabilitiesTitle: "No capability profiles available",
        emptyCapabilitiesDescription:
          "Provider settings and runtime lanes will appear here once the AI runtime is initialized.",
        emptyReleasesTitle: "No releases published yet",
        emptyReleasesDescription: "Publish a project to create the first immutable release record.",
        emptyReviewTitle: "Review queue clear",
        emptyReviewDescription:
          "Queued generation, pending artifacts, and automation approvals will appear here.",
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
      title: "TEA 🍵",
      copy: "Brew ideas into systems, then ship playable worlds.",
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
      sessionInfoLabel: "Session info",
      questLogTitle: "Quest log",
      questStepActive: "Active",
      questStepCompleted: "Done",
      questStepPending: "Pending",
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
      dialogueConfirm: "Continue",
      inventoryAction: "Item action",
      inventoryClose: "Close inventory",
      inventoryTitle: "Inventory",
      inventoryCapacity: "Capacity",
      inventoryStorage: "Storage",
      inventoryItems: "Items",
      inventoryEmpty: "Empty",
      inventoryWeight: "Weight",
      inventoryGold: "Gold",
      inventoryWeightPlaceholder: "0.0kg",
      inventoryGoldPlaceholder: "0",
      inventoryManageHint: "Use inventory commands to manage items.",
      inventorySessionIdLabel: "ID",
      inventoryUse: "Use",
      inventoryEquip: "Equip",
      inventoryUnequip: "Unequip",
      inventoryEquipment: "Equipment",
      inventoryWeapon: "Weapon",
      inventoryArmor: "Armor",
      inventoryAccessory: "Accessory",
      cutsceneAdvanceHint: "Use advance cutscene (Space/Enter) to continue.",
      cutsceneAdvance: "Continue",
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
      combatAttack: "Attack",
      combatDefend: "Defend",
      combatSkill: "Skill",
      combatFlee: "Flee",
      combatPhaseIntro: "Intro",
      combatPhasePlayerTurn: "Player turn",
      combatPhaseEnemyTurn: "Enemy turn",
      combatPhaseVictory: "Victory",
      combatPhaseDefeat: "Defeat",
      hitPointsShortLabel: "HP",
      saveAction: "Save",
      loadAction: "Load",
      saveSlotTitle: "Save game",
      saveSlotNamePlaceholder: "Slot name (optional)",
      saveSlotNameLabel: "Slot name",
      saveSlotSuccess: "Game saved.",
      loadSlotTitle: "Load game",
      loadSlotEmpty: "No saved games.",
      loadSlotRestore: "Load",
      loadSlotCreatedAt: "Saved",
      keyBindingsTitle: "Key Bindings",
      keyBindingsDescription: "Customize your controls. Click Set and press a key to rebind.",
      keyBindingsSetButton: "Set",
      keyBindingsListeningHint: "Press any key...",
      keyBindingsResetDefaults: "Reset to defaults",
      keyBindingsUpdatedHint: "Changes apply when you refocus the game or refresh.",
      keyBindingsActionMoveUp: "Move up",
      keyBindingsActionMoveDown: "Move down",
      keyBindingsActionMoveLeft: "Move left",
      keyBindingsActionMoveRight: "Move right",
      keyBindingsActionInteract: "Interact",
      keyBindingsActionMenu: "Menu / Inventory",
      keyBindingsActionClose: "Close / Back",
    },
    builder: {
      projectNotFound: "Project not found",
      sceneNotFound: "Scene not found",
      npcNotFound: "NPC not found",
      dialogueNotFound: "Dialogue key not found",
      missingPrompt: "Prompt is required",
      hfTrainingInvalidRequest: "HF training request is incomplete or invalid.",
      sceneIdRequired: "Scene id is required",
      sceneTitleRequired: "Scene title is required",
      npcNameRequired: "Character name is required",
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
      dashboard: "Start Here",
      workspaceTitle: "Builder Workspace",
      workspaceJumpBack:
        "Jump back into your world or start crafting something new with the help of your AI co-pilot.",
      scenes: "World",
      npcs: "Characters",
      dialogue: "Story",
      assets: "Art & Audio",
      mechanics: "Rules & Progress",
      automation: "Review Queue",
      ai: "AI Settings",
      playtest: "Playtest",
      settings: "Settings",
      advancedTools: "Advanced",
      navGroupOverview: "Overview",
      navGroupAuthoring: "Authoring",
      navGroupContent: "Content",
      navGroupSystems: "Systems",
      navGroupRuntime: "Runtime",
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
      noGenerationJobs: "No AI drafts queued yet.",
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
      stableIdLabel: "Stable ID",
      sceneIdPlaceholder: "yangtzeTeaHouse",
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
      providerStatus: "Provider inventory",
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
      fineTuneWorkspaceTitle: "Fine-tune model (HF Jobs)",
      fineTuneWorkspaceDescription:
        "Queue a Hugging Face Jobs fine-tuning request with dataset and method selection for review before submission.",
      hfTrainingDatasetLabel: "Dataset repository",
      hfTrainingDatasetPlaceholder: "organization/dataset-name",
      hfTrainingSplitLabel: "Dataset split",
      hfTrainingBaseModelLabel: "Base model",
      hfTrainingOutputModelLabel: "Output model repository",
      hfTrainingOutputModelPlaceholder: "username/tea-builder-ft",
      hfTrainingMethodLabel: "Training method",
      hfTrainingMethodSft: "SFT",
      hfTrainingMethodDpo: "DPO",
      hfTrainingMethodGrpo: "GRPO",
      hfTrainingMethodReward: "Reward",
      hfTrainingEpochsLabel: "Epochs",
      hfTrainingLearningRateLabel: "Learning rate",
      hfTrainingSubmit: "Queue fine-tuning request",
      hfTrainingQueuedTitle: "Fine-tuning request queued for review.",
      hfTrainingQueuedDescription:
        "Open Operations to review and approve this HF Jobs run request before execution.",
      aiModelCatalogWorkspaceTitle: "Model Catalog & Overrides",
      aiModelCatalogWorkspaceDescription:
        "Search provider catalogs, assign model slots, and override effective runtime defaults without editing dotenv files.",
      aiModelCatalogSearchTitle: "Model Search",
      aiModelCatalogSearchDescription:
        "Search a provider catalog to populate one of the configurable model slots.",
      aiModelCatalogSearchPlaceholder: "Search models",
      aiModelCatalogAuthorPlaceholder: "Author",
      aiModelCatalogSearchSubmit: "Search",
      aiModelCatalogResetSubmit: "Reset",
      aiModelCatalogNoResults: "No matching models found.",
      aiModelCatalogNoLaneSettings: "No editable settings in this lane.",
      aiModelCatalogPullPlaceholder: "Pull Ollama model",
      aiModelCatalogPullSubmit: "Pull",
      aiModelCatalogSourceOverride: "Override",
      aiModelCatalogSourceEnv: "Env",
      aiModelCatalogSourceDefault: "Default",
      aiModelCatalogLaneTransformersLocal: "Transformers Local",
      aiModelCatalogLaneOllama: "Ollama",
      aiModelCatalogLaneApiCompatibleLocal: "API-Compatible Local",
      aiModelCatalogLaneApiCompatibleCloud: "API-Compatible Cloud",
      aiModelCatalogLaneHfInference: "HF Inference",
      aiModelCatalogLaneHfEndpoints: "HF Endpoints",
      aiModelCatalogLaneImageGeneration: "Image Generation",
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
        "Create a new project from a starter template or switch to an existing project by ID.",
      starterProjectTitle: "Choose a starter",
      starterProjectDescription:
        "Start with a blank project or a guided starter you can immediately inspect and reshape.",
      starterProjectTemplateLegend: "Starter template",
      starterProjectRecommendedLabel: "Recommended",
      starterProjectTemplateBlankLabel: "Blank workspace",
      starterProjectTemplateBlankDescription:
        "Begin with an empty project and build your first scene, assets, and story from scratch.",
      starterProjectTemplateStoryLabel: "Tea house story starter",
      starterProjectTemplateStoryDescription:
        "Load a curated 2D/3D starter project with scenes, characters, dialogue, assets, and starter progression.",
      starterProjectTemplate2dLabel: "Pixel Garden (2D)",
      starterProjectTemplate2dDescription:
        "A 2D sprite-based garden scene with characters and dialogue. Ideal for learning 2D authoring.",
      starterProjectTemplate3dLabel: "Orbital Station (3D)",
      starterProjectTemplate3dDescription:
        "A 3D environment with models and lighting. Explore 3D scene setup and runtime.",
      projectSettings: "Project Settings",
      brandControlPlaneTitle: "Brand Control Plane",
      brandControlPlaneDescription:
        "Own the name, logo, palette, and typography of this project from one project-scoped brand kit.",
      brandIdentityTitle: "Identity",
      brandIdentityDescription:
        "Set the public name, subtitle, and logo system used across builder and play surfaces.",
      brandVisualSystemTitle: "Visual System",
      brandVisualSystemDescription:
        "Tune the underlying theme, fonts, and accent colors that power every branded shell.",
      brandExperienceCopyTitle: "Shell Copy",
      brandExperienceCopyDescription:
        "Rename the builder and player surfaces so the control plane matches the world you are shipping.",
      brandPreviewTitle: "Live Brand Preview",
      brandPreviewDescription:
        "Preview the branded shell before opening builder or playtest surfaces.",
      brandAppNameLabel: "Brand name",
      brandAppSubtitleLabel: "Brand subtitle",
      brandLogoMarkLabel: "Logo mark",
      brandLogoImagePathLabel: "Logo image path",
      brandBuilderShellNameLabel: "Builder shell name",
      brandBuilderShellDescriptionLabel: "Builder shell description",
      brandPlayerShellNameLabel: "Player shell name",
      brandSurfaceThemeLabel: "Surface theme",
      brandHeadingFontLabel: "Heading font",
      brandBodyFontLabel: "Body font",
      brandMonoFontLabel: "Mono font",
      brandPrimaryColorLabel: "Primary color",
      brandSecondaryColorLabel: "Secondary color",
      brandAccentColorLabel: "Accent color",
      brandNeutralColorLabel: "Neutral color",
      brandBaseColorLabel: "Base surface color",
      brandBaseContentColorLabel: "Base content color",
      saveBrandControlPlane: "Save brand control plane",
      operations: "Operations",
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
      tilemapTabLabel: "Tilemap",
      tilemapTileSetLabel: "Tile set",
      tilemapBrushLabel: "Brush",
      tilemapFillLabel: "Fill",
      tilemapToolsLabel: "Tilemap tools",
      tilePaletteLabel: "Tile palette",
      tileCellLabel: "Tile cell",
      tilemapSelectedTileLabel: "Selected tile",
      tilemapEmptyTileLabel: "Empty tile",
      tilemapEraserLabel: "Eraser",
      tilemapInstructions:
        "Choose a tile set, paint with Brush, use Fill on one connected area, or switch to the eraser. Arrow keys move across the grid, and Enter or Space paints the focused cell.",
      modelPathLabel: "Model path (glb/usdz)",
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
      flowDescription:
        "Use one simple path: build a world, add characters, wire progress, then playtest.",
      flowSteps: [
        "Create a world",
        "Add art and characters",
        "Write story beats",
        "Wire rules and quests",
        "Playtest the result",
      ],
      workflowGuideTitle: "Recommended path",
      workflowGuideDescription:
        "If the builder feels fragmented, ignore the internal categories and follow this path. It is the shortest route to a playable build.",
      workflowStartWithWorldTitle: "1. Start with a world",
      workflowStartWithWorldDescription:
        "Create one scene first. Pick 2D for sprite or tile-based rooms. Pick 3D only when the scene needs model placement, lights, or Z-space.",
      workflowPopulateWorldTitle: "2. Populate the world",
      workflowPopulateWorldDescription:
        "Add backgrounds, sprites, portraits, audio, and then place characters into the scene that will actually use them.",
      workflowWireProgressTitle: "3. Wire progress",
      workflowWireProgressDescription:
        "Use Story and Rules & Progress to connect dialogue, quests, triggers, and flags after the scene and characters exist.",
      workflowPlaytestTitle: "4. Playtest early",
      workflowPlaytestDescription:
        "Playtest as soon as one scene, one character, and one interaction work. Save the review queue and AI tools for acceleration, not for first setup.",
      modePrimerTitle: "2D, 3D, and USD",
      modePrimerDescription:
        "These are creation lanes, not separate products. Choose the lane that matches the scene you are trying to ship.",
      modePrimer2dTitle: "2D is the default lane",
      modePrimer2dDescription:
        "Use 2D for backgrounds, sprite sheets, portraits, tilemaps, and top-down or side-view scenes. If you are unsure, start here.",
      modePrimer3dTitle: "3D is for model-based scenes",
      modePrimer3dDescription:
        "Use 3D when the scene depends on models, lights, camera movement, or depth placement. It adds complexity, so do not start here unless you need it.",
      modePrimerUsdTitle: "USD is a model file family",
      modePrimerUsdDescription:
        "USD, USDA, USDC, and USDZ are 3D asset formats. In this builder they belong to 3D scenes only, alongside GLB and GLTF.",
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
      localRuntimeTitle: "Local runtime",
      localRuntimeDescription:
        "Your local AI engine powers characters, generates assets, and assists with game design.",
      runtimeLabel: "Engine",
      modelLabel: "AI Model",
      taskLabel: "Task",
      configKeyLabel: "Config",
      aiConfigOverrideHelp:
        "Override any model through its config-key environment variable, then restart the server.",
      docsLabel: "Docs",
      runtimeStackValue: "TEA Engine",
      sceneLibraryTitle: "Scene library",
      sceneCreateDescription: "Create or select a scene, then refine its layout and preview.",
      sceneCreationHelp:
        "Start by creating one scene. Choose 2D for sprites and tilemaps. Choose 3D only if you need model placement, lights, or USD/GLB assets.",
      scene2dHelp:
        "2D scenes use backgrounds, sprite sheets, portraits, and optional tilemaps. This is the fastest path to a working build.",
      scene3dHelp:
        "3D scenes use model assets such as GLB, GLTF, USD, USDA, USDC, and USDZ. Use them when depth and camera movement matter.",
      sceneCreateTitlePlaceholder: "Moonlit Harbor",
      sceneBackgroundPlaceholder: "/assets/images/backgrounds/enchanted-forest.png",
      npcRosterTitle: "NPC roster",
      npcCreateDescription:
        "Add NPCs into a scene, then tune movement, dialogue, and greeting behavior.",
      npcCreateSceneLabel: "Owning scene",
      npcCreateKeyPlaceholder: "harborGuide",
      npcCreateLabelPlaceholder: "Harbor Guide",
      assetsWorkspaceTitle: "Asset library",
      assetsWorkspaceDescription:
        "Add the assets that support the scene you are building now. Keep 2D and 3D assets separate so scene setup stays predictable.",
      assets2dGuide:
        "2D assets: backgrounds, sprite sheets, portraits, tiles, and tile sets. Use these for 2D scenes and dialogue surfaces.",
      assets3dGuide:
        "3D assets: models and supporting audio used inside 3D scenes. Keep them tied to scenes that actually require model placement.",
      assetsUsdGuide:
        "USD formats are 3D model assets. Use USD, USDA, USDC, or USDZ only for 3D scenes; use PNG or sprite sheets for 2D scenes.",
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
      clipDurationEmpty: "—",
      clipFrameStart: "0",
      fpsUnit: "FPS",
      clipIdLabel: "Clip ID",
      generationJobsTitle: "AI drafts",
      generationJobKindLabel: "Draft type",
      generationPromptLabel: "Draft brief",
      createGenerationJob: "Create AI draft",
      creatorWorkflowTitle: "Create playable slice",
      creatorWorkflowDescription:
        "Move through one authoring loop: shape the world, attach visuals, add characters, wire story and rules, then playtest.",
      creatorStageStartPrimary: "Open world setup",
      creatorStageStartSecondary: "Open asset library",
      creatorStageWorldPrimary: "Edit world",
      creatorStageWorldSecondary: "Prepare visuals",
      creatorStageAssetsPrimary: "Add art and audio",
      creatorStageAssetsSecondary: "Place visuals in world",
      creatorStageCharactersPrimary: "Add characters",
      creatorStageCharactersSecondary: "Draft story beats",
      creatorStageStoryPrimary: "Write story",
      creatorStageStorySecondary: "Tune characters",
      creatorStageSystemsPrimary: "Wire rules",
      creatorStageSystemsSecondary: "Review story hooks",
      creatorStagePlaytestPrimary: "Playtest slice",
      creatorStagePlaytestSecondary: "Review rules",
      creatorStageStartCompletion:
        "A playable slice has a clear next step and one chosen creation lane.",
      creatorStageWorldCompletion: "At least one scene exists with a clear 2D or 3D direction.",
      creatorStageAssetsCompletion:
        "The current slice has the visuals and audio it needs to read on screen.",
      creatorStageCharactersCompletion: "At least one character is present in the active slice.",
      creatorStageStoryCompletion: "The slice has dialogue or authored story beats to test.",
      creatorStageSystemsCompletion:
        "Rules, quests, triggers, or flags are connected to the slice.",
      creatorStagePlaytestCompletion: "The slice can be entered and reviewed in the runtime.",
      creatorCapabilityImageGeneration: "Image generation",
      creatorCapabilityDialogueGeneration: "Dialogue generation",
      creatorCapabilitySpeech: "Speech tools",
      creatorCapabilityAutomationReview: "Review automation",
      creatorCapability3dImport: "3D import",
      creatorCapabilityAnimationAssist: "Animation assist",
      creatorSupportTitle: "Creator support",
      creatorSupportDescription:
        "Stay in the main authoring flow while these guides show what assistance is ready for the selected scene, character, or asset.",
      creatorAssistTitle: "AI actions for the selected item",
      creatorAssistDescription:
        "Use AI only in context. These actions are attached to the scene, character, or asset you are editing now.",
      workflowStatusReady: "Ready",
      workflowStatusInProgress: "In progress",
      workflowStatusStart: "Start here",
      resultsLabel: "Results",
      previousPage: "Previous",
      nextPage: "Next",
      pageLabel: "Page",
      generateBackground: "Generate background",
      generateBackgroundDescription: "Create a background draft for the active scene.",
      generateTileset: "Generate tileset",
      generateTilesetDescription: "Create a tile-ready environment sheet for the active scene.",
      generatePortrait: "Generate portrait",
      generatePortraitDescription: "Create a portrait draft for the selected character.",
      generateVoiceLine: "Generate voice line",
      generateVoiceLineDescription:
        "Create a spoken line draft for the selected character or scene.",
      generateIdleAnimation: "Generate idle animation",
      generateIdleAnimationDescription: "Draft an idle loop plan for the selected asset.",
      generateInteractionDescription: "Draft a contextual interaction pass for the selected item.",
      animationAuthoringTitle: "Animation authoring",
      animationAuthoringDescription:
        "Treat animation as part of the selected asset or character, not as a separate hidden pipeline.",
      animationActionIdleLoop: "Create idle loop",
      animationActionWalkCycle: "Create walk cycle",
      animationActionBindCharacter: "Bind animation to character",
      animationActionPreviewScene: "Preview in scene",
      creatorSafeAiDescription:
        "Creator pages only show capability-level AI guidance. Provider names, model IDs, and runtime internals live in Settings.",
      advancedSettingsDescription:
        "Settings is the advanced surface for runtime diagnostics, project knowledge, and capability troubleshooting.",
      advancedAutomationDescription:
        "Review Queue is the advanced surface for evidence capture, review bundles, and gated automation apply flows.",
      dialogueSearchLabel: "Filter dialogue",
      dialogueSearchPlaceholder: "Search by speaker or line",
      sceneSearchLabel: "Filter scenes",
      sceneSearchPlaceholder: "Search by title or scene reference",
      assetSearchLabel: "Filter assets",
      assetSearchPlaceholder: "Search by label, type, or scene mode",
      dialogueWorkspaceTitle: "Dialogue workspace",
      dialogueCreateDescription:
        "Keep dialogue grouped by NPC and use AI to draft new lines before saving.",
      dialogueSpeakerLabel: "Speaker",
      dialogueSpeakerPlaceholder: "Harbor Guide",
      dialogueMomentLabel: "Moment",
      dialogueMomentPlaceholder: "Greeting",
      dialogueKeyPlaceholder: "npc.harborGuide.lines.greeting",
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
      assetLabelPlaceholder: "Harbor Backdrop",
      assetIdPlaceholder: "Optional stable asset reference",
      clipIdPlaceholder: "Optional stable animation reference",
      questIdPlaceholder: "Optional stable quest reference",
      triggerIdPlaceholder: "Optional stable trigger reference",
      graphIdPlaceholder: "Optional stable graph reference",
      nodeIdPlaceholder: "hero-spawn-point",
      layerPlaceholder: "foreground",
      stateTagPlaceholder: "idle-down",
      sourcePathPlaceholder: "/assets/images/custom.png",
      dialogueNpcIdPlaceholder: "Harbor Guide",
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
        '[{"kind":"goto","path":"/projects/:projectId/start"},{"kind":"screenshot","fileStem":"demo-review","fullPage":true},{"kind":"attach-generated-artifact","sourceStepId":"step.capture-workspace"}]',
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
      generatedBadge: "Generated",
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
      platformReadinessDescription: "Track what's ready to use and what's still in progress.",
      platformReadinessWarning:
        "The builder can author and publish the current baseline, but sprite generation, animation tooling, advanced mechanics, and automation are not fully wired yet.",
      readinessImplemented: "Implemented",
      readinessPartial: "Partial",
      readinessMissing: "Missing",
      implementedCountLabel: "Implemented",
      partialCountLabel: "Partial",
      missingCountLabel: "Missing",
      readinessSummaryExpand: "View capability details",
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
      generationJobCountLabel: "AI drafts",
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
      capabilityAiAuthoringTitle: "Creator assistance",
      capabilityAiAuthoringDescription:
        "Contextual drafting, grounded guidance, and review tooling are available, but creator-facing generation still needs deeper scene, asset, and mechanics integration.",
      capabilityAutomationTitle: "Review automation",
      capabilityAutomationDescription:
        "Evidence capture, review bundles, and gated apply flows are available, but broader orchestration still belongs in advanced review rather than the core creation path.",
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
      appName: "TEA 🍵",
      appSubtitle: "茶道般的游戏世界工坊",
    },
    navigation: {
      home: "工作室",
      controlPlane: "控制平面",
      game: "游玩",
      builder: "创作室",
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
      foundationLabel: "基础",
      skipToContent: "跳转到主要内容",
      loading: "加载中",
      retry: "重试",
      backToTop: "返回顶部",
      themeLabel: "主题",
      themeTeaDark: "Tea 深",
      themeTeaLight: "Tea 浅",
      breadcrumbLabel: "面包屑导航",
      resourcesNavLabel: "资源",
      socialNavLabel: "社交链接",
      githubLabel: "GitHub",
      discordLabel: "Discord",
      twitterLabel: "Twitter / X",
      projectConfigured: "已配置项目",
      noProjectBound: "未绑定项目",
      contextLabel: "上下文",
      notApplicable: "—",
      dismiss: "关闭",
      statsEmptyValue: "0",
      noActiveJobs: "0",
      requestFailed: "请求失败",
    },
    pages: {
      home: {
        title: "TEA 创作系统",
        heroTitle: "在一个 SSR 工作区内交付可玩的世界",
        heroDescription:
          "TEA 将场景设计、NPC 创作、本地优先 AI 能力与运行时试玩整合为一个可发布级别的工作区。",
        welcomeBack: "这是面向首个版本发布的控制台，用于世界构建、自动化与运行时验证。",
        quickStartHint: "先进入构建器完成首个场景，再对运行时进行压力验证后发布。",
        builderCardTitle: "世界构建工作区",
        builderCardDescription: "设计环境、布置交互对象，并定义玩家真正会进入的叙事与空间表面。",
        builderCardCta: "开始构建世界",
        openUnifiedBuilder: "打开构建器工作区",
        talkToAiOracle: "打开故事 Oracle",
        playerCardTitle: "运行时试玩",
        playerCardDescription: "直接启动运行时界面，验证操作反馈、节奏与机制，再进入首个公开版本。",
        playerCardCta: "启动运行时",
        playtestBuild: "运行时试玩",
        playtestBuildDescription: "从创作场景直接进入运行时，不离开当前产品表面。",
        sceneLauncherTitle: "启动基线场景",
        sceneLauncherDescription: "用起始场景验证构图、节奏与渲染器适配。",
        launch2dScene: "启动茶屋场景",
        launch3dScene: "启动水晶洞窟",
        statusUnpublishedDraft: "状态：初始发布版",
        launchPlayerSurface: "启动运行时界面",
        projectActivity: "发布标准",
        activityEmptyTitle: "面向发布的操作模型",
        activityEmptyDescription:
          "每个项目都遵循同一条路径：先构建世界，再生成配套资产，并在发布前完成运行时质量验证。",
        projectCreatedInWorkspace: "世界结构已定义",
        waitingForInitialSceneDraft: "运行时验证已排程",
        awaitingPublication: "发布门禁待完成",
        statsScenes: "世界构建",
        statsNpcs: "运行时质检",
        statsGenerations: "本地 AI",
        loopTitle: "发布循环",
        loopDescription:
          "从第一份创意简报到可玩的运行时，整个系统始终保持在同一套创作与验证闭环内。",
        loopSteps: ["定义世界", "借助 AI 创作", "验证运行时"],
        architectureTitle: "场景系统",
        architectureDescription: "场景、交互对象与叙事节点保持结构化，确保运行时能够稳定启动。",
        reliabilityTitle: "角色系统",
        reliabilityDescription:
          "NPC、对话图与遭遇机制可以持续编辑，而不会退化成只适合早期演示的内容。",
        progressiveEnhancementTitle: "本地优先 AI",
        progressiveEnhancementDescription:
          "使用本地模型完成生成、审阅与自动化，同时保持产品界面与行为可预测。",
        docsCta: "阅读平台文档",
      },
      controlPlane: {
        title: "控制平面",
        workspaceLabel: "控制平面工作区",
        workspaceDescription: "把作品集、素材库、能力、发布与审查从项目内创作中拆分出来。",
        gamesTitle: "游戏",
        gamesDescription: "在组合视图中查看每个游戏的品牌、创作范围与发布状态。",
        librariesTitle: "素材库",
        librariesDescription:
          "把已批准素材与待审素材作为可复用资产包来浏览，而不是深埋在单个项目里。",
        templatesTitle: "模板",
        templatesDescription: "把起始模板与可复用的场景基础提升为顶层模板目录。",
        capabilitiesTitle: "能力",
        capabilitiesDescription:
          "把提供商策略、模型路由与运行时设置作为平台能力来管理，而不是项目私有开关。",
        releasesTitle: "发布",
        releasesDescription: "把不可变发布版本与可变草稿项目清晰分离。",
        reviewTitle: "审查队列",
        reviewDescription: "把生成任务、自动化审批与待审产物整合为跨项目审查通道。",
        gamesMetric: "游戏",
        librariesMetric: "素材库",
        templatesMetric: "模板",
        reviewMetric: "审查项",
        globalKnowledgeLabel: "全局知识",
        focusedProjectLabel: "当前聚焦项目",
        allProjectsLabel: "全部项目",
        scopeContractLabel: "归属范围",
        ownershipModelTitle: "归属模型",
        ownershipModelDescription: "每个界面都映射到明确范围，不再把平台问题全部折叠进 projectId。",
        focusedProjectTitle: "项目上下文",
        focusedProjectDescription: "从作品集中聚焦一个项目，直接跳转到构建、品牌、审查或试玩界面。",
        createProject: "创建项目",
        openBuilder: "打开构建器",
        openBrandControl: "打开品牌控制",
        openReviewQueue: "打开审查队列",
        focusProject: "聚焦项目",
        sharedAssetsTitle: "共享资产",
        createFromTemplate: "从模板创建",
        recommendedLabel: "推荐",
        publishedLabel: "已发布",
        draftLabel: "草稿",
        releaseLabel: "发布",
        releaseVersionPrefix: "发布版本",
        activeReleaseLabel: "当前发布",
        archivedReleaseLabel: "历史发布",
        lastUpdatedLabel: "最近更新",
        sceneCountLabel: "场景",
        assetCountLabel: "资产",
        reviewCountLabel: "审查",
        libraryAssetsLabel: "资产",
        libraryProjectsLabel: "项目",
        capabilitySettingsLabel: "设置",
        capabilityReadyLabel: "就绪",
        capabilityIssuesLabel: "问题",
        approvedLabel: "已批准",
        pendingReviewLabel: "待审查",
        scopeGlobal: "全局：提供商目录、共享知识、起始模板",
        scopeOrganization: "组织：共享素材库、团队策略、可复用资源包",
        scopeProject: "项目：场景、NPC、对话、资产、品牌",
        scopeRelease: "发布：不可变快照与渠道状态",
        scopeSession: "会话：运行时玩家状态与即时试玩上下文",
        emptyGamesTitle: "还没有游戏",
        emptyGamesDescription: "先创建首个项目，作品集工作区就会出现内容。",
        emptyLibrariesTitle: "还没有可复用资产",
        emptyLibrariesDescription: "当项目开始产出并批准资产后，这里会显示共享与待审素材。",
        emptyCapabilitiesTitle: "暂无能力配置",
        emptyCapabilitiesDescription: "AI 运行时初始化后，这里会显示提供商设置与运行时能力通道。",
        emptyReleasesTitle: "还没有发布版本",
        emptyReleasesDescription: "发布任意项目后，就会出现第一条不可变发布记录。",
        emptyReviewTitle: "审查队列为空",
        emptyReviewDescription: "排队中的生成任务、待审产物与自动化审批都会显示在这里。",
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
      title: "TEA 🍵",
      copy: "在静心中酿造世界，再把它们端上舞台供玩家体验。",
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
      sessionInfoLabel: "会话信息",
      questLogTitle: "任务日志",
      questStepActive: "进行中",
      questStepCompleted: "已完成",
      questStepPending: "待完成",
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
      dialogueConfirm: "继续",
      inventoryAction: "物品操作",
      inventoryClose: "关闭背包",
      inventoryTitle: "背包",
      inventoryCapacity: "容量",
      inventoryStorage: "仓储",
      inventoryItems: "物品",
      inventoryEmpty: "空",
      inventoryWeight: "重量",
      inventoryGold: "金币",
      inventoryWeightPlaceholder: "0.0kg",
      inventoryGoldPlaceholder: "0",
      inventoryManageHint: "使用背包指令来管理物品。",
      inventorySessionIdLabel: "ID",
      inventoryUse: "使用",
      inventoryEquip: "装备",
      inventoryUnequip: "卸下",
      inventoryEquipment: "装备栏",
      inventoryWeapon: "武器",
      inventoryArmor: "护甲",
      inventoryAccessory: "饰品",
      cutsceneAdvance: "继续",
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
      combatAttack: "攻击",
      combatDefend: "防御",
      combatSkill: "技能",
      combatFlee: "逃跑",
      combatPhaseIntro: "开场",
      combatPhasePlayerTurn: "玩家回合",
      combatPhaseEnemyTurn: "敌方回合",
      combatPhaseVictory: "胜利",
      combatPhaseDefeat: "失败",
      hitPointsShortLabel: "生命值",
      saveAction: "保存",
      loadAction: "读取",
      saveSlotTitle: "保存游戏",
      saveSlotNamePlaceholder: "存档名称（可选）",
      saveSlotNameLabel: "存档名称",
      saveSlotSuccess: "游戏已保存。",
      loadSlotTitle: "读取游戏",
      loadSlotEmpty: "暂无存档。",
      loadSlotRestore: "读取",
      loadSlotCreatedAt: "保存于",
      keyBindingsTitle: "按键绑定",
      keyBindingsDescription: "自定义操作按键。点击“设置”后按下要绑定的键。",
      keyBindingsSetButton: "设置",
      keyBindingsListeningHint: "请按下任意键...",
      keyBindingsResetDefaults: "恢复默认",
      keyBindingsUpdatedHint: "更改在重新聚焦游戏或刷新页面后生效。",
      keyBindingsActionMoveUp: "向上移动",
      keyBindingsActionMoveDown: "向下移动",
      keyBindingsActionMoveLeft: "向左移动",
      keyBindingsActionMoveRight: "向右移动",
      keyBindingsActionInteract: "交互",
      keyBindingsActionMenu: "菜单 / 背包",
      keyBindingsActionClose: "关闭 / 返回",
    },
    builder: {
      projectNotFound: "项目未找到",
      sceneNotFound: "场景未找到",
      npcNotFound: "NPC 未找到",
      dialogueNotFound: "对话键未找到",
      missingPrompt: "必须提供提示词",
      hfTrainingInvalidRequest: "HF 微调请求不完整或无效。",
      sceneIdRequired: "必须提供场景 ID",
      sceneTitleRequired: "必须提供场景标题",
      npcNameRequired: "必须提供角色名称",
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
      dashboard: "从这里开始",
      workspaceTitle: "构建器工作区",
      workspaceJumpBack: "回到你的世界继续创作，或借助 AI 助手开始新的创作。",
      scenes: "世界",
      npcs: "角色",
      dialogue: "剧情",
      assets: "美术与音频",
      mechanics: "规则与进度",
      automation: "审核队列",
      ai: "AI 设置",
      playtest: "试玩",
      settings: "设置",
      advancedTools: "高级",
      navGroupOverview: "概览",
      navGroupAuthoring: "创作",
      navGroupContent: "内容",
      navGroupSystems: "系统",
      navGroupRuntime: "运行时",
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
      noGenerationJobs: "尚未创建 AI 草稿。",
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
      stableIdLabel: "稳定 ID",
      sceneIdPlaceholder: "yangtzeTeaHouse",
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
      providerStatus: "提供器清单",
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
      fineTuneWorkspaceTitle: "模型微调（HF Jobs）",
      fineTuneWorkspaceDescription:
        "选择数据集与训练方法，先创建可审查的 Hugging Face Jobs 微调请求，再决定是否执行。",
      hfTrainingDatasetLabel: "数据集仓库",
      hfTrainingDatasetPlaceholder: "organization/dataset-name",
      hfTrainingSplitLabel: "数据集划分",
      hfTrainingBaseModelLabel: "基础模型",
      hfTrainingOutputModelLabel: "输出模型仓库",
      hfTrainingOutputModelPlaceholder: "username/tea-builder-ft",
      hfTrainingMethodLabel: "训练方法",
      hfTrainingMethodSft: "SFT",
      hfTrainingMethodDpo: "DPO",
      hfTrainingMethodGrpo: "GRPO",
      hfTrainingMethodReward: "Reward",
      hfTrainingEpochsLabel: "训练轮次",
      hfTrainingLearningRateLabel: "学习率",
      hfTrainingSubmit: "加入微调请求队列",
      hfTrainingQueuedTitle: "微调请求已加入待审查队列。",
      hfTrainingQueuedDescription: "前往操作中心审查并批准该 HF Jobs 运行请求。",
      aiModelCatalogWorkspaceTitle: "模型目录与运行时覆盖",
      aiModelCatalogWorkspaceDescription:
        "搜索各个提供方的模型目录，为固定槽位分配模型，并在不修改 dotenv 文件的情况下覆盖当前运行时默认值。",
      aiModelCatalogSearchTitle: "模型搜索",
      aiModelCatalogSearchDescription: "搜索提供方目录，为可配置模型槽位填充候选模型。",
      aiModelCatalogSearchPlaceholder: "搜索模型",
      aiModelCatalogAuthorPlaceholder: "作者",
      aiModelCatalogSearchSubmit: "搜索",
      aiModelCatalogResetSubmit: "重置",
      aiModelCatalogNoResults: "没有找到匹配的模型。",
      aiModelCatalogNoLaneSettings: "此通道中没有可编辑的设置。",
      aiModelCatalogPullPlaceholder: "拉取 Ollama 模型",
      aiModelCatalogPullSubmit: "拉取",
      aiModelCatalogSourceOverride: "覆盖",
      aiModelCatalogSourceEnv: "环境变量",
      aiModelCatalogSourceDefault: "默认值",
      aiModelCatalogLaneTransformersLocal: "本地 Transformers",
      aiModelCatalogLaneOllama: "Ollama",
      aiModelCatalogLaneApiCompatibleLocal: "本地 API 兼容提供方",
      aiModelCatalogLaneApiCompatibleCloud: "云端 API 兼容提供方",
      aiModelCatalogLaneHfInference: "HF 推理",
      aiModelCatalogLaneHfEndpoints: "HF 端点",
      aiModelCatalogLaneImageGeneration: "图像生成",
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
      createProjectHelp: "从启动模板创建新项目，或按 ID 切换到现有项目。",
      starterProjectTitle: "选择起步模板",
      starterProjectDescription: "从空白工作区开始，或载入一个可以立即查看与改造的引导起始项目。",
      starterProjectTemplateLegend: "起步模板",
      starterProjectRecommendedLabel: "推荐",
      starterProjectTemplateBlankLabel: "空白工作区",
      starterProjectTemplateBlankDescription: "从空项目开始，自行创建第一个场景、素材与故事流程。",
      starterProjectTemplateStoryLabel: "茶馆故事起始项目",
      starterProjectTemplateStoryDescription:
        "载入一个包含场景、角色、对话、素材与初始流程的 2D/3D 起始项目。",
      starterProjectTemplate2dLabel: "像素花园 (2D)",
      starterProjectTemplate2dDescription: "一个带角色与对话的 2D 精灵花园场景，适合学习 2D 创作。",
      starterProjectTemplate3dLabel: "轨道站 (3D)",
      starterProjectTemplate3dDescription: "带模型与光照的 3D 环境，探索 3D 场景设置与运行。",
      projectSettings: "项目设置",
      brandControlPlaneTitle: "品牌控制平面",
      brandControlPlaneDescription:
        "在单一项目级品牌套件中掌控名称、Logo、色彩与排版，统一 Builder 与玩家界面。",
      brandIdentityTitle: "品牌身份",
      brandIdentityDescription: "设置将在构建器与玩家界面中使用的对外名称、副标题与 Logo 体系。",
      brandVisualSystemTitle: "视觉系统",
      brandVisualSystemDescription: "调整支撑所有品牌化界面的主题、字体与强调色。",
      brandExperienceCopyTitle: "界面命名",
      brandExperienceCopyDescription:
        "重命名 Builder 与玩家界面，让控制平面语言与你的世界设定保持一致。",
      brandPreviewTitle: "实时品牌预览",
      brandPreviewDescription: "在打开 Builder 或试玩界面前，先预览品牌化后的外观。",
      brandAppNameLabel: "品牌名称",
      brandAppSubtitleLabel: "品牌副标题",
      brandLogoMarkLabel: "Logo 标记",
      brandLogoImagePathLabel: "Logo 图片路径",
      brandBuilderShellNameLabel: "Builder 界面名称",
      brandBuilderShellDescriptionLabel: "Builder 界面说明",
      brandPlayerShellNameLabel: "玩家界面名称",
      brandSurfaceThemeLabel: "表面主题",
      brandHeadingFontLabel: "标题字体",
      brandBodyFontLabel: "正文字体",
      brandMonoFontLabel: "等宽字体",
      brandPrimaryColorLabel: "主色",
      brandSecondaryColorLabel: "辅助色",
      brandAccentColorLabel: "强调色",
      brandNeutralColorLabel: "中性色",
      brandBaseColorLabel: "基础表面色",
      brandBaseContentColorLabel: "基础文字色",
      saveBrandControlPlane: "保存品牌控制平面",
      operations: "操作中心",
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
      tilemapTabLabel: "瓦片地图",
      tilemapTileSetLabel: "瓦片集",
      tilemapBrushLabel: "画笔",
      tilemapFillLabel: "填充",
      tilemapToolsLabel: "瓦片工具",
      tilePaletteLabel: "瓦片调色板",
      tileCellLabel: "瓦片格",
      tilemapSelectedTileLabel: "当前瓦片",
      tilemapEmptyTileLabel: "空白瓦片",
      tilemapEraserLabel: "橡皮擦",
      tilemapInstructions:
        "选择瓦片集后可用画笔绘制，对连通区域使用填充，或切换到橡皮擦。方向键可在网格中移动，按 Enter 或空格会在当前格子绘制。",
      modelPathLabel: "模型路径 (glb/usdz)",
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
      flowDescription: "遵循一条简单路径：先做世界，再加角色，接着串联进度，最后尽早试玩。",
      flowSteps: ["创建世界", "加入美术和角色", "编写剧情节点", "连接规则与任务", "试玩结果"],
      workflowGuideTitle: "推荐路径",
      workflowGuideDescription:
        "如果你觉得构建器太分散，就先忽略内部分类，直接按这条路径做。这是最快得到可玩构建的方式。",
      workflowStartWithWorldTitle: "1. 先做世界",
      workflowStartWithWorldDescription:
        "先创建一个场景。做精灵或瓦片地图就选 2D。只有在确实需要模型、灯光或 Z 轴空间时才选 3D。",
      workflowPopulateWorldTitle: "2. 填充世界",
      workflowPopulateWorldDescription:
        "先补背景、精灵、头像和音频，再把角色放进真正会使用这些资源的场景里。",
      workflowWireProgressTitle: "3. 串联进度",
      workflowWireProgressDescription:
        "等场景和角色存在后，再去剧情与规则页面连接对话、任务、触发器和标记。",
      workflowPlaytestTitle: "4. 尽早试玩",
      workflowPlaytestDescription:
        "只要一个场景、一个角色和一次交互能跑通，就立刻试玩。审核队列和 AI 工具应该用来提速，而不是替代起步流程。",
      modePrimerTitle: "2D、3D 与 USD",
      modePrimerDescription: "这些是创作通道，不是三套不同产品。选择与你当前目标场景匹配的那一条。",
      modePrimer2dTitle: "2D 是默认通道",
      modePrimer2dDescription:
        "背景、精灵表、头像、瓦片地图，以及多数俯视或横版场景都应该用 2D。拿不准时先从这里开始。",
      modePrimer3dTitle: "3D 用于模型场景",
      modePrimer3dDescription:
        "只有当场景依赖模型、灯光、相机运动或深度摆放时才用 3D。它更复杂，所以不是默认起点。",
      modePrimerUsdTitle: "USD 是一组模型格式",
      modePrimerUsdDescription:
        "USD、USDA、USDC 和 USDZ 都属于 3D 资产格式。在这个构建器里，它们只应该用于 3D 场景，也可以与 GLB、GLTF 一起使用。",
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
      localRuntimeTitle: "本地运行时",
      localRuntimeDescription: "本地 AI 引擎为角色赋能，生成素材，并协助游戏设计。",
      runtimeLabel: "引擎",
      modelLabel: "AI 模型",
      taskLabel: "任务",
      configKeyLabel: "配置",
      aiConfigOverrideHelp: "可通过对应的配置键环境变量覆盖模型，修改后请重启服务器。",
      docsLabel: "文档",
      runtimeStackValue: "TEA 引擎",
      sceneLibraryTitle: "场景库",
      sceneCreateDescription: "先创建或选择场景，再细化布局与预览。",
      sceneCreationHelp:
        "先创建一个场景。精灵和瓦片地图选 2D。只有在需要模型摆放、灯光或 USD/GLB 资源时才选 3D。",
      scene2dHelp: "2D 场景使用背景、精灵表、头像和可选瓦片地图。这是最快得到可玩构建的路径。",
      scene3dHelp:
        "3D 场景使用 GLB、GLTF、USD、USDA、USDC、USDZ 等模型资源。只有在深度和镜头运动重要时才使用。",
      sceneCreateTitlePlaceholder: "月色港湾",
      sceneBackgroundPlaceholder: "/assets/images/backgrounds/enchanted-forest.png",
      npcRosterTitle: "NPC 阵列",
      npcCreateDescription: "先把 NPC 放进场景，再调节移动、对话与接近问候行为。",
      npcCreateSceneLabel: "所属场景",
      npcCreateKeyPlaceholder: "harborGuide",
      npcCreateLabelPlaceholder: "港湾向导",
      assetsWorkspaceTitle: "资源库",
      assetsWorkspaceDescription:
        "只添加当前正在构建的场景真正需要的资源。把 2D 和 3D 资源分开，场景配置才会更稳定。",
      assets2dGuide: "2D 资源：背景、精灵表、头像、瓦片和瓦片集。它们服务于 2D 场景和对话界面。",
      assets3dGuide:
        "3D 资源：模型，以及 3D 场景中要用到的配套音频。只在确实需要模型摆放的场景里使用它们。",
      assetsUsdGuide:
        "USD 系列格式属于 3D 模型资源。USD、USDA、USDC、USDZ 只应进入 3D 场景；2D 场景请使用 PNG 或精灵表。",
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
      clipDurationEmpty: "—",
      clipFrameStart: "0",
      fpsUnit: "FPS",
      clipIdLabel: "片段 ID",
      generationJobsTitle: "AI 草稿",
      generationJobKindLabel: "草稿类型",
      generationPromptLabel: "草稿说明",
      createGenerationJob: "创建 AI 草稿",
      creatorWorkflowTitle: "创建可试玩切片",
      creatorWorkflowDescription:
        "按一条清晰路径创作：搭建世界、补齐视觉、添加角色、连通剧情与规则，然后立即试玩。",
      creatorStageStartPrimary: "开始世界搭建",
      creatorStageStartSecondary: "打开素材库",
      creatorStageWorldPrimary: "编辑世界",
      creatorStageWorldSecondary: "准备视觉资源",
      creatorStageAssetsPrimary: "添加美术与音频",
      creatorStageAssetsSecondary: "把资源放入世界",
      creatorStageCharactersPrimary: "添加角色",
      creatorStageCharactersSecondary: "起草剧情节拍",
      creatorStageStoryPrimary: "编写剧情",
      creatorStageStorySecondary: "调整角色",
      creatorStageSystemsPrimary: "连接规则",
      creatorStageSystemsSecondary: "检查剧情钩子",
      creatorStagePlaytestPrimary: "试玩切片",
      creatorStagePlaytestSecondary: "复查规则",
      creatorStageStartCompletion: "可试玩切片需要一个明确的下一步与一个确定的创作路线。",
      creatorStageWorldCompletion: "至少存在一个场景，并且已经明确选择 2D 或 3D 方向。",
      creatorStageAssetsCompletion: "当前切片已经具备阅读画面所需的视觉与音频资源。",
      creatorStageCharactersCompletion: "当前切片中至少存在一个角色。",
      creatorStageStoryCompletion: "当前切片已经有可测试的对白或剧情节拍。",
      creatorStageSystemsCompletion: "任务、触发器、标记或规则已经连到当前切片。",
      creatorStagePlaytestCompletion: "当前切片已经可以在运行时进入并审查。",
      creatorCapabilityImageGeneration: "图像生成",
      creatorCapabilityDialogueGeneration: "对白生成",
      creatorCapabilitySpeech: "语音工具",
      creatorCapabilityAutomationReview: "自动化审核",
      creatorCapability3dImport: "3D 导入",
      creatorCapabilityAnimationAssist: "动画辅助",
      creatorSupportTitle: "创作支持",
      creatorSupportDescription:
        "保持在主要创作流程中，同时通过这些提示了解当前场景、角色或资源可用的辅助能力。",
      creatorAssistTitle: "当前对象的 AI 动作",
      creatorAssistDescription:
        "只在上下文中使用 AI。这些动作绑定到你此刻正在编辑的场景、角色或资源。",
      workflowStatusReady: "已就绪",
      workflowStatusInProgress: "进行中",
      workflowStatusStart: "从这里开始",
      resultsLabel: "结果",
      previousPage: "上一页",
      nextPage: "下一页",
      pageLabel: "第",
      generateBackground: "生成背景",
      generateBackgroundDescription: "为当前场景创建背景草稿。",
      generateTileset: "生成瓦片集",
      generateTilesetDescription: "为当前场景创建可直接铺设的环境瓦片草稿。",
      generatePortrait: "生成立绘",
      generatePortraitDescription: "为当前角色创建立绘草稿。",
      generateVoiceLine: "生成语音台词",
      generateVoiceLineDescription: "为当前角色或场景创建语音草稿。",
      generateIdleAnimation: "生成待机动画",
      generateIdleAnimationDescription: "为当前资源生成待机循环方案。",
      generateInteractionDescription: "为当前对象生成上下文交互草稿。",
      animationAuthoringTitle: "动画创作",
      animationAuthoringDescription: "把动画视为角色或资源的一部分，而不是隐藏在后台的独立管线。",
      animationActionIdleLoop: "创建待机循环",
      animationActionWalkCycle: "创建行走循环",
      animationActionBindCharacter: "将动画绑定到角色",
      animationActionPreviewScene: "在场景中预览",
      creatorSafeAiDescription:
        "创作者页面只展示能力级别的 AI 引导。提供商名称、模型 ID 与运行时细节统一移到设置页。",
      advancedSettingsDescription: "设置页用于运行时诊断、项目知识库与能力排障，属于高级工作区。",
      advancedAutomationDescription:
        "审核队列用于证据采集、审查包与受控自动化应用，属于高级工作区。",
      dialogueSearchLabel: "筛选对话",
      dialogueSearchPlaceholder: "按说话角色或台词搜索",
      sceneSearchLabel: "筛选场景",
      sceneSearchPlaceholder: "按标题或场景引用搜索",
      assetSearchLabel: "筛选资源",
      assetSearchPlaceholder: "按名称、类型或场景模式搜索",
      dialogueWorkspaceTitle: "对话工作区",
      dialogueCreateDescription: "按 NPC 管理对话，并先用 AI 起草再保存。",
      dialogueSpeakerLabel: "说话角色",
      dialogueSpeakerPlaceholder: "港湾向导",
      dialogueMomentLabel: "情境",
      dialogueMomentPlaceholder: "问候",
      dialogueKeyPlaceholder: "npc.harborGuide.lines.greeting",
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
      assetLabelPlaceholder: "港湾背景",
      assetIdPlaceholder: "可选的稳定资源引用",
      clipIdPlaceholder: "可选的稳定动画引用",
      questIdPlaceholder: "可选的稳定任务引用",
      triggerIdPlaceholder: "可选的稳定触发器引用",
      graphIdPlaceholder: "可选的稳定图引用",
      nodeIdPlaceholder: "hero-spawn-point",
      layerPlaceholder: "foreground",
      stateTagPlaceholder: "idle-down",
      sourcePathPlaceholder: "/assets/images/custom.png",
      dialogueNpcIdPlaceholder: "港湾向导",
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
        '[{"kind":"goto","path":"/projects/:projectId/start"},{"kind":"screenshot","fileStem":"demo-review","fullPage":true},{"kind":"attach-generated-artifact","sourceStepId":"step.capture-workspace"}]',
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
      generatedBadge: "已生成",
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
      platformReadinessDescription: "追踪已实现功能与尚在开发中的进度。",
      platformReadinessWarning:
        "构建器已经可以编辑并发布当前基线项目，但精灵生成、动画工具、复杂机制与自动化流程尚未真正接通。",
      readinessImplemented: "已实现",
      readinessPartial: "部分实现",
      readinessMissing: "缺失",
      implementedCountLabel: "已实现",
      partialCountLabel: "部分实现",
      missingCountLabel: "缺失",
      readinessSummaryExpand: "查看能力详情",
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
      generationJobCountLabel: "AI 草稿",
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
      capabilityAiAuthoringTitle: "创作辅助",
      capabilityAiAuthoringDescription:
        "上下文草稿、知识辅助和审查工具已经可用，但面向创作者的生成能力仍需要更深的场景、资源与机制整合。",
      capabilityAutomationTitle: "审查自动化",
      capabilityAutomationDescription:
        "证据捕获、审查包和受控应用流程已经可用，但更广泛的编排仍应停留在高级审查流程中。",
      capabilityWebgpuRendererTitle: "WebGPU 渲染器",
      capabilityWebgpuRendererDescription:
        "PixiJS 可在支持 WebGPU 时自动检测并优先使用 WebGPU 进行 2D 渲染，否则无缝回退至 WebGL。",
      capabilityAiOnnxGpuTitle: "ONNX GPU 加速",
      capabilityAiOnnxGpuDescription:
        "Transformers.js 管线可在支持时将 ONNX 推理定向至 WebGPU 设备进行 GPU 加速。",
    },
  },
};
