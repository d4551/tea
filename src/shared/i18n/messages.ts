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
    readonly pitchDeck: string;
    readonly narrativeBible: string;
    readonly developmentPlan: string;
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
    readonly mobileNavigation: string;
    readonly primaryNavigation: string;
    readonly skipToContent: string;
    readonly loading: string;
    readonly retry: string;
    readonly backToTop: string;
  };
  readonly pages: {
    readonly home: {
      readonly title: string;
      readonly heroTitle: string;
      readonly heroDescription: string;
      readonly builderCardTitle: string;
      readonly builderCardDescription: string;
      readonly builderCardCta: string;
      readonly playerCardTitle: string;
      readonly playerCardDescription: string;
      readonly playerCardCta: string;
      readonly loopTitle: string;
      readonly loopDescription: string;
      readonly loopSteps: readonly string[];
      readonly statusTitle: string;
      readonly architectureTitle: string;
      readonly architectureDescription: string;
      readonly reliabilityTitle: string;
      readonly reliabilityDescription: string;
      readonly progressiveEnhancementTitle: string;
      readonly progressiveEnhancementDescription: string;
      readonly builderOptionsTitle: string;
      readonly builderOptionsDescription: string;
      readonly userFlowTitle: string;
      readonly userFlowSteps: readonly string[];
      readonly apiSurfaceTitle: string;
      readonly apiSurfaceDescription: string;
      readonly supportingDocsTitle: string;
      readonly supportingDocsDescription: string;
      readonly docsCta: string;
    };
    readonly pitchDeck: {
      readonly title: string;
      readonly subtitle: string;
      readonly sections: readonly string[];
    };
    readonly narrativeBible: {
      readonly title: string;
      readonly subtitle: string;
      readonly sections: readonly string[];
    };
    readonly developmentPlan: {
      readonly title: string;
      readonly subtitle: string;
      readonly sections: readonly string[];
    };
  };
  readonly oracle: {
    readonly cardTitle: string;
    readonly cardDescription: string;
    readonly questionLabel: string;
    readonly questionPlaceholder: string;
    readonly stateModeLabel: string;
    readonly submit: string;
    readonly loadingTitle: string;
    readonly loadingDescription: string;
    readonly modeAuto: string;
    readonly modeForceEmpty: string;
    readonly modeForceRetryableError: string;
    readonly modeForceFatalError: string;
    readonly modeForceUnauthorized: string;
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
    readonly fortunePrefixes: readonly string[];
    readonly fortuneBodies: readonly string[];
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
  };
  readonly builder: {
    readonly projectNotFound: string;
    readonly sceneNotFound: string;
    readonly npcNotFound: string;
    readonly dialogueNotFound: string;
    readonly missingPrompt: string;
    readonly sceneIdRequired: string;
    readonly invalidPatchPlan: string;
    readonly noDialogues: string;
    readonly title: string;
    readonly dashboard: string;
    readonly scenes: string;
    readonly npcs: string;
    readonly dialogue: string;
    readonly assets: string;
    readonly mechanics: string;
    readonly automation: string;
    readonly ai: string;
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
    readonly projectStatusUnpublished: string;
    readonly createProject: string;
    readonly switchProject: string;
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
    readonly generationKindPortrait: string;
    readonly generationKindSpriteSheet: string;
    readonly generationKindTiles: string;
    readonly generationKindVoiceLine: string;
    readonly generationKindAnimationPlan: string;
    readonly triggerEventLabel: string;
    readonly triggerEventSceneEnter: string;
    readonly triggerEventNpcInteract: string;
    readonly triggerEventChat: string;
    readonly triggerEventDialogueConfirmed: string;
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
    readonly configKeyLabel: string;
    readonly docsLabel: string;
    readonly runtimeStackValue: string;
    readonly aiConfigPatternValue: string;
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
    readonly automationStepBrowser: string;
    readonly automationStepHttp: string;
    readonly automationStepBuilder: string;
    readonly automationStepAttachFile: string;
    readonly automationSummaryCaptureReviewContext: string;
    readonly automationSummaryPrepareDraftPlan: string;
    readonly automationSummaryAttachReviewEvidence: string;
    readonly automationArtifactSummaryCapturedReviewEvidence: string;
    readonly automationStatusQueuedForProcessing: string;
    readonly automationStatusApprovedForApply: string;
    readonly automationStatusCanceledByReview: string;
    readonly automationStatusPlanReadyForReview: string;
    readonly automationStatusCapturingFallbackEvidence: string;
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

/**
 * Translation table keyed by locale.
 */
export const messagesByLocale: Record<LocaleCode, Messages> = {
  "en-US": {
    metadata: {
      appName: "Leaves of the Fallen Kingdom",
      appSubtitle: "Tea-first strategy worldbuilding toolkit",
    },
    navigation: {
      home: "Start",
      pitchDeck: "Pitch Deck",
      narrativeBible: "Narrative Bible",
      developmentPlan: "Dev Plan",
      game: "Game Demo",
      builder: "Builder",
      localeLabel: "Language",
      localeNameEnglish: "English",
      localeNameChinese: "中文",
      switchToEnglish: "Switch language to English",
      switchToChinese: "Switch language to Chinese",
    },
    common: {
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      mobileNavigation: "Mobile navigation",
      primaryNavigation: "Primary navigation",
      skipToContent: "Skip to main content",
      loading: "Loading",
      retry: "Retry",
      backToTop: "Back to top",
    },
    pages: {
      home: {
        title: "Builder / Player Workspace",
        heroTitle: "Author, publish, and play from one server-rendered workspace",
        heroDescription:
          "The primary loop is now builder-first: shape the world, publish an immutable release, then validate the live player experience against that release.",
        builderCardTitle: "Author the world",
        builderCardDescription:
          "Edit scenes, NPCs, dialogue, and AI-assisted changes from one project-aware builder shell.",
        builderCardCta: "Open builder",
        playerCardTitle: "Play the release",
        playerCardDescription:
          "Launch the published build, validate onboarding, and verify that runtime behavior matches the authored release.",
        playerCardCta: "Open player",
        loopTitle: "Primary loop",
        loopDescription:
          "Everything in the product now points at the same release cycle instead of separate pitch and operator surfaces.",
        loopSteps: [
          "Author in builder",
          "Review AI changes",
          "Publish release",
          "Play published build",
        ],
        statusTitle: "Current workspace status",
        architectureTitle: "Single-owner architecture",
        architectureDescription:
          "Config, logging, routing, UI rendering, and domain behavior are now isolated by concern with clear contracts at each boundary.",
        reliabilityTitle: "Reliability controls",
        reliabilityDescription:
          "Typed config, centralized error envelopes, request correlation IDs, and contract tests remove guesswork and improve incident traceability.",
        progressiveEnhancementTitle: "Progressive enhancement",
        progressiveEnhancementDescription:
          "Forms and navigation work without JavaScript, while HTMX upgrades responses for faster interaction loops when available.",
        builderOptionsTitle: "Builder lanes",
        builderOptionsDescription:
          "Author scenes, ship plugin packs, validate the browser runtime, and exercise local AI features from one contract-driven workflow.",
        userFlowTitle: "Builder flow",
        userFlowSteps: [
          "Choose the lane",
          "Compose with AI",
          "Author assets",
          "Validate contracts",
          "Publish the project",
        ],
        apiSurfaceTitle: "Platform surface",
        apiSurfaceDescription:
          "Operational endpoints, builder mutations, and local AI runtime details are exposed through documented APIs instead of hidden implementation paths.",
        supportingDocsTitle: "Supporting documents",
        supportingDocsDescription:
          "Pitch, narrative, and delivery documents remain available as supporting material, but they are no longer the main product entrypoint.",
        docsCta: "Open API docs",
      },
      pitchDeck: {
        title: "Pitch Deck",
        subtitle: "Investor-facing summary for market, product, and moat.",
        sections: [
          "Market thesis: tea strategy RPG with long-session retention mechanics.",
          "Product loop: territory pressure, trade routes, faction trust, and elemental stance combat.",
          "Moat: world bible + scenario tooling + modular plugin architecture.",
          "Execution: incremental milestones, contract tests, and release gates.",
        ],
      },
      narrativeBible: {
        title: "Narrative Bible",
        subtitle: "Story, factions, and timeline constraints for deterministic content production.",
        sections: [
          "Canon contract: every chapter maps to a route-state and faction-state transition.",
          "Character voice matrix: each role owns intent, conflict posture, and dialogue constraints.",
          "Continuity policy: no event can invalidate trade-route geography without migration notes.",
          "Localization parity: all user-facing narrative text is locale-backed before release.",
        ],
      },
      developmentPlan: {
        title: "Development Plan",
        subtitle: "Operational roadmap for performance, quality, and release confidence.",
        sections: [
          "Phase 1: baseline SSR routes, plugin registration, and static asset pipeline.",
          "Phase 2: API contracts, typed error envelope, and end-to-end tests.",
          "Phase 3: observability hardening, performance budgets, and preflight automation.",
          "Phase 4: content cadence, localization rollout, and release governance.",
        ],
      },
    },
    oracle: {
      cardTitle: "Tea Oracle",
      cardDescription:
        "Ask the oracle and receive a deterministic response generated from your question context.",
      questionLabel: "Question",
      questionPlaceholder: "Ask about alliances, routes, corruption, or harvest outcomes",
      stateModeLabel: "State mode",
      submit: "Consult",
      loadingTitle: "Oracle in progress",
      loadingDescription: "The leaves are being read. Your response is loading.",
      modeAuto: "Auto",
      modeForceEmpty: "Force empty",
      modeForceRetryableError: "Force retryable error",
      modeForceFatalError: "Force non-retryable error",
      modeForceUnauthorized: "Force unauthorized",
      idleHint: "Submit a question to start the oracle flow.",
      emptyTitle: "No question provided",
      emptyDescription: "Enter a specific question so the oracle can resolve an outcome.",
      successTitle: "Oracle reading",
      retryableErrorTitle: "Temporary oracle disruption",
      retryableErrorDescription: "The oracle can be retried safely.",
      nonRetryableErrorTitle: "Oracle request rejected",
      nonRetryableErrorDescription: "The request does not meet policy constraints.",
      unauthorizedTitle: "Session required",
      unauthorizedDescription: "Sign in before requesting protected oracle responses.",
      networkErrorDescription: "The oracle could not be reached. Retry when the network recovers.",
      validationTooLong: "Question exceeds maximum allowed length.",
      fortunePrefixes: ["Steam reports", "Leaf pattern indicates", "Trade ledger predicts"],
      fortuneBodies: [
        "a stable alliance if you reinforce river checkpoints.",
        "a profitable route once mountain caravans are escorted.",
        "a corruption spike unless your faction trust is repaired.",
        "a strategic opening if tea reserves are redistributed quickly.",
      ],
    },
    footer: {
      title: "Built for deterministic delivery",
      copy: "SSR-first, typed contracts, and progressive enhancement by default.",
      ctaLabel: "Review architecture details",
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
    },
    builder: {
      projectNotFound: "Project not found",
      sceneNotFound: "Scene not found",
      npcNotFound: "NPC not found",
      dialogueNotFound: "Dialogue key not found",
      missingPrompt: "Prompt is required",
      sceneIdRequired: "Scene id is required",
      invalidPatchPlan: "Patch plan contains invalid operations",
      noDialogues: "No dialogue entries found",
      title: "Game Builder",
      dashboard: "Dashboard",
      scenes: "Scenes",
      npcs: "NPCs",
      dialogue: "Dialogue",
      assets: "Assets",
      mechanics: "Mechanics",
      automation: "Automation",
      ai: "AI Tools",
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
      projectIdPlaceholder: "tea-house-release",
      projectDraftVersion: "Draft version",
      projectPublishedVersion: "Published release",
      projectStatus: "Status",
      projectLastUpdated: "Last updated",
      projectStatusDraft: "Draft only",
      projectStatusPublished: "Published",
      projectStatusUnpublished: "Unpublished",
      createProject: "Create project",
      switchProject: "Switch project",
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
      generationKindPortrait: "Portrait",
      generationKindSpriteSheet: "Sprite sheet",
      generationKindTiles: "Tiles",
      generationKindVoiceLine: "Voice line",
      generationKindAnimationPlan: "Animation plan",
      triggerEventLabel: "Trigger event",
      triggerEventSceneEnter: "Scene enter",
      triggerEventNpcInteract: "NPC interact",
      triggerEventChat: "Chat",
      triggerEventDialogueConfirmed: "Dialogue confirmed",
      rotationXLabel: "Rotation X",
      rotationYLabel: "Rotation Y",
      rotationZLabel: "Rotation Z",
      scaleXLabel: "Scale X",
      scaleYLabel: "Scale Y",
      scaleZLabel: "Scale Z",
      sceneWidthDesc: "Scene width in pixels",
      sceneHeightDesc: "Scene height in pixels",
      assetPlaceholder: "Runtime-mounted asset inventory for scenes and sprites.",
      testNpcPlaceholder: "teaMonk",
      testMessagePlaceholder: "Tell me about the five elements...",
      assistPromptPlaceholder: "How should I balance the tea trader NPC dialogue...",
      flowTitle: "Guided flow",
      flowDescription:
        "Move from platform choice to publishable output with one SSR-first builder sequence.",
      flowSteps: [
        "Choose the runtime lane",
        "Compose or test AI behavior",
        "Author scenes, NPCs, and dialogue",
        "Validate contracts and runtime health",
        "Publish the project",
      ],
      engineOptionsTitle: "Engine options",
      engineOptionsDescription:
        "Choose the delivery path that matches the current milestone without splitting the content model.",
      runtimeLaneTitle: "Browser runtime",
      runtimeLaneDescription:
        "Server-authoritative web runtime for live scene validation, HUD testing, and session contract checks.",
      pluginLaneTitle: "RMMZ plugin pack",
      pluginLaneDescription:
        "Structured plugin output for RPG Maker authoring with the same scene and dialogue source of truth.",
      aiLaneTitle: "Local AI stack",
      aiLaneDescription:
        "Configurable Hugging Face + ONNX targets for dialogue fallback, embeddings, speech recognition, and speech synthesis.",
      apiSurfaceTitle: "API surface",
      apiSurfaceDescription:
        "Use the builder CRUD endpoints, AI catalog, and Swagger docs as the operating surface for tools and automations.",
      localRuntimeTitle: "Local runtime",
      localRuntimeDescription:
        "The builder reads from the same Transformers.js, Hugging Face, and ONNX settings used by the API routes.",
      runtimeLabel: "Runtime",
      modelLabel: "Model",
      configKeyLabel: "Config Key",
      docsLabel: "Docs",
      runtimeStackValue: "Bun + Elysia + HTMX",
      aiConfigPatternValue: "AI_LOCAL_* / OLLAMA_*",
      sceneLibraryTitle: "Scene library",
      sceneCreateDescription:
        "Create or select a scene, then refine its layout and runtime preview.",
      sceneCreateTitlePlaceholder: "teaHouseAnnex",
      sceneBackgroundPlaceholder: "/assets/images/backgrounds/tea-house-annex.png",
      npcRosterTitle: "NPC roster",
      npcCreateDescription:
        "Add NPCs into a scene, then tune movement, dialogue, and greet behavior.",
      npcCreateSceneLabel: "Owning scene",
      npcCreateKeyPlaceholder: "teaMonk",
      npcCreateLabelPlaceholder: "npc.teaMonk.label",
      assetsWorkspaceTitle: "Asset workspace",
      assetKindLabel: "Asset kind",
      assetSourceLabel: "Asset source",
      animationClipsTitle: "Animation clips",
      createAnimationClip: "Create animation clip",
      clipAssetLabel: "Asset",
      clipStateTagLabel: "State tag",
      clipFrameCountLabel: "Frame count",
      clipPlaybackLabel: "Playback FPS",
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
      dialogueKeyPlaceholder: "npc.teaMonk.greet",
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
      dialogueNpcIdPlaceholder: "teaMonk",
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
      automationStepBrowser: "Browser",
      automationStepHttp: "HTTP",
      automationStepBuilder: "Builder",
      automationStepAttachFile: "Attach file",
      automationSummaryCaptureReviewContext: "Capture builder review context",
      automationSummaryPrepareDraftPlan: "Prepare draft mutation plan",
      automationSummaryAttachReviewEvidence: "Attach evidence to the draft review",
      automationArtifactSummaryCapturedReviewEvidence: "Captured builder review evidence",
      automationStatusQueuedForProcessing: "Queued for processing",
      automationStatusApprovedForApply: "Approved for apply",
      automationStatusCanceledByReview: "Canceled by review",
      automationStatusPlanReadyForReview: "Automation plan ready for review",
      automationStatusCapturingFallbackEvidence: "Capturing fallback review evidence",
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
      capabilityReleaseFlowTitle: "Release flow",
      capabilityReleaseFlowDescription:
        "Projects can be authored, published into immutable releases, and opened in the player against a project-bound build.",
      capability2dRuntimeTitle: "2D runtime",
      capability2dRuntimeDescription:
        "A narrow browser runtime exists for one baseline content model, but there is no broad 2D world editor or reusable game-authoring pipeline yet.",
      capability3dRuntimeTitle: "3D runtime",
      capability3dRuntimeDescription:
        "Three.js is only used for atmosphere and lighting under the sprite scene. There is no 3D scene graph, asset pipeline, or builder workflow.",
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
        "A lifecycle-managed worker now drains queued automation runs and can capture Playwright review evidence, but multi-step tool orchestration and production-grade RPA are still partial.",
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
      appName: "落叶王朝",
      appSubtitle: "以茶为核心的策略世界观工具集",
    },
    navigation: {
      home: "入口",
      pitchDeck: "路演材料",
      narrativeBible: "叙事圣经",
      developmentPlan: "开发计划",
      game: "游戏演示",
      builder: "构建器",
      localeLabel: "语言",
      localeNameEnglish: "English",
      localeNameChinese: "中文",
      switchToEnglish: "切换到英文",
      switchToChinese: "切换到中文",
    },
    common: {
      openMenu: "打开导航菜单",
      closeMenu: "关闭导航菜单",
      mobileNavigation: "移动端导航",
      primaryNavigation: "主导航",
      skipToContent: "跳转到主要内容",
      loading: "加载中",
      retry: "重试",
      backToTop: "返回顶部",
    },
    pages: {
      home: {
        title: "构建 / 游玩工作区",
        heroTitle: "在同一个服务端渲染工作区中完成创作、发布与游玩",
        heroDescription:
          "主循环现在以构建器为中心：先创作世界，发布不可变版本，再回到玩家视角验证真实运行效果。",
        builderCardTitle: "创作世界",
        builderCardDescription: "在具备项目上下文的构建器中编辑场景、NPC、对话与 AI 建议。",
        builderCardCta: "打开构建器",
        playerCardTitle: "游玩发布版本",
        playerCardDescription: "启动已发布版本，从玩家视角验证引导、节奏与运行时表现。",
        playerCardCta: "打开玩家视图",
        loopTitle: "主循环",
        loopDescription: "产品入口聚焦于同一条发布路径，而不再分散到路演与文档页面。",
        loopSteps: ["在构建器中创作", "审查 AI 修改", "发布版本", "游玩已发布内容"],
        statusTitle: "当前工作区状态",
        architectureTitle: "单一职责架构",
        architectureDescription:
          "配置、日志、路由、视图渲染与领域逻辑各自独立，边界通过类型契约约束。",
        reliabilityTitle: "可靠性控制",
        reliabilityDescription:
          "类型化配置、统一错误信封、请求关联 ID 与契约测试共同减少不确定性。",
        progressiveEnhancementTitle: "渐进增强",
        progressiveEnhancementDescription:
          "在无 JavaScript 场景下功能可用；有 HTMX 时自动升级为更快的交互回路。",
        builderOptionsTitle: "构建通道",
        builderOptionsDescription:
          "在同一套契约驱动流程中完成场景创作、插件输出、浏览器运行时验证与本地 AI 能力测试。",
        userFlowTitle: "构建流程",
        userFlowSteps: ["选择通道", "使用 AI 编排", "创作资源", "校验契约", "发布项目"],
        apiSurfaceTitle: "平台接口面",
        apiSurfaceDescription:
          "运维端点、构建器写接口与本地 AI 运行时细节都通过文档化 API 暴露，而不是隐藏在实现内部。",
        supportingDocsTitle: "补充文档入口",
        supportingDocsDescription:
          "路演材料、叙事文档与开发计划仍可查看，但它们只作为补充材料，不再作为产品主入口。",
        docsCta: "打开 API 文档",
      },
      pitchDeck: {
        title: "路演材料",
        subtitle: "面向投资人的市场、产品与护城河摘要。",
        sections: [
          "市场假设：以茶文化策略 RPG 切入长时留存用户。",
          "产品循环：领地压力、商路博弈、势力信任与五行战斗。",
          "护城河：世界观圣经 + 场景化工具 + 模块化插件体系。",
          "执行方式：里程碑递进、契约测试、发布门禁。",
        ],
      },
      narrativeBible: {
        title: "叙事圣经",
        subtitle: "用于内容生产的角色、势力与时间线约束。",
        sections: [
          "正典契约：每个章节必须映射到路由状态与势力状态变迁。",
          "角色语气矩阵：每个角色定义明确意图、冲突姿态与台词约束。",
          "连续性策略：若修改商路地理必须提供迁移说明。",
          "本地化一致性：所有用户文案发布前必须具备多语言映射。",
        ],
      },
      developmentPlan: {
        title: "开发计划",
        subtitle: "面向性能、质量与发布稳定性的执行路线。",
        sections: [
          "阶段一：SSR 路由、插件注册、静态资源管线。",
          "阶段二：API 契约、错误信封、端到端测试。",
          "阶段三：可观测性加固、性能预算、预检自动化。",
          "阶段四：内容迭代节奏、本地化扩展、发布治理。",
        ],
      },
    },
    oracle: {
      cardTitle: "茶占师",
      cardDescription: "输入问题后，系统会根据上下文返回确定性的占卜结果。",
      questionLabel: "问题",
      questionPlaceholder: "可询问结盟、商路、腐化或收成趋势",
      stateModeLabel: "状态模式",
      submit: "占卜",
      loadingTitle: "占卜进行中",
      loadingDescription: "茶叶纹路正在解析，请稍候。",
      modeAuto: "自动",
      modeForceEmpty: "强制空状态",
      modeForceRetryableError: "强制可重试错误",
      modeForceFatalError: "强制不可重试错误",
      modeForceUnauthorized: "强制未授权",
      idleHint: "提交问题后开始占卜流程。",
      emptyTitle: "未提供问题",
      emptyDescription: "请输入明确的问题以便生成结果。",
      successTitle: "占卜结果",
      retryableErrorTitle: "占卜服务暂时不可用",
      retryableErrorDescription: "该错误可安全重试。",
      nonRetryableErrorTitle: "占卜请求被拒绝",
      nonRetryableErrorDescription: "当前请求不符合策略约束。",
      unauthorizedTitle: "需要会话权限",
      unauthorizedDescription: "请先登录后再请求受保护的占卜结果。",
      networkErrorDescription: "当前无法连接茶谕服务，请在网络恢复后重试。",
      validationTooLong: "问题超过允许的最大长度。",
      fortunePrefixes: ["茶雾显示", "叶纹提示", "账簿推演"],
      fortuneBodies: [
        "若加强河道关隘，联盟将趋于稳定。",
        "护送山道商队后，贸易线路将明显增益。",
        "若不修复势力信任，腐化将持续攀升。",
        "若及时再分配茶储备，将出现战术窗口。",
      ],
    },
    footer: {
      title: "为确定性交付而构建",
      copy: "默认 SSR、类型契约、渐进增强。",
      ctaLabel: "查看架构细节",
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
    },
    builder: {
      projectNotFound: "项目未找到",
      sceneNotFound: "场景未找到",
      npcNotFound: "NPC 未找到",
      dialogueNotFound: "对话键未找到",
      missingPrompt: "必须提供提示词",
      sceneIdRequired: "必须提供场景 ID",
      invalidPatchPlan: "补丁方案包含无效操作",
      noDialogues: "未找到对话条目",
      title: "游戏构建器",
      dashboard: "仪表盘",
      scenes: "场景",
      npcs: "NPC",
      dialogue: "对话",
      assets: "资源",
      mechanics: "机制",
      automation: "自动化",
      ai: "AI 工具",
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
      projectIdPlaceholder: "tea-house-release",
      projectDraftVersion: "草稿版本",
      projectPublishedVersion: "发布版本",
      projectStatus: "状态",
      projectLastUpdated: "最近更新",
      projectStatusDraft: "仅草稿",
      projectStatusPublished: "已发布",
      projectStatusUnpublished: "未发布",
      createProject: "创建项目",
      switchProject: "切换项目",
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
      generationKindPortrait: "立绘",
      generationKindSpriteSheet: "精灵表",
      generationKindTiles: "地块",
      generationKindVoiceLine: "语音台词",
      generationKindAnimationPlan: "动画方案",
      triggerEventLabel: "触发事件",
      triggerEventSceneEnter: "进入场景",
      triggerEventNpcInteract: "与 NPC 互动",
      triggerEventChat: "聊天",
      triggerEventDialogueConfirmed: "确认对话",
      rotationXLabel: "旋转 X",
      rotationYLabel: "旋转 Y",
      rotationZLabel: "旋转 Z",
      scaleXLabel: "缩放 X",
      scaleYLabel: "缩放 Y",
      scaleZLabel: "缩放 Z",
      sceneWidthDesc: "场景宽度（像素）",
      sceneHeightDesc: "场景高度（像素）",
      assetPlaceholder: "场景与精灵的运行时资源清单。",
      testNpcPlaceholder: "teaMonk",
      testMessagePlaceholder: "请告诉我关于五行的事情...",
      assistPromptPlaceholder: "如何平衡茶商 NPC 的对话...",
      flowTitle: "引导流程",
      flowDescription: "从平台选择到可发布输出，统一走同一条 SSR 优先的构建路径。",
      flowSteps: [
        "选择运行时通道",
        "编排或测试 AI 行为",
        "创作场景、NPC 与对话",
        "校验契约与运行时健康状态",
        "发布项目",
      ],
      engineOptionsTitle: "引擎选项",
      engineOptionsDescription: "在不拆分内容模型的前提下，根据当前里程碑选择最合适的交付路径。",
      runtimeLaneTitle: "浏览器运行时",
      runtimeLaneDescription: "用于实时场景验证、HUD 测试与会话契约检查的服务端权威 Web 运行时。",
      pluginLaneTitle: "RMMZ 插件包",
      pluginLaneDescription: "面向 RPG Maker 的结构化插件输出，复用同一套场景与对话源数据。",
      aiLaneTitle: "本地 AI 栈",
      aiLaneDescription:
        "通过可配置的 Hugging Face + ONNX 目标提供对话兜底、嵌入、语音识别与语音合成能力。",
      apiSurfaceTitle: "API 接口面",
      apiSurfaceDescription: "把构建器 CRUD、AI 目录与 Swagger 文档作为工具和自动化的正式操作面。",
      localRuntimeTitle: "本地运行时",
      localRuntimeDescription:
        "构建器直接读取与 API 路由相同的 Transformers.js、Hugging Face 与 ONNX 配置。",
      runtimeLabel: "运行时",
      modelLabel: "模型",
      configKeyLabel: "配置键",
      docsLabel: "文档",
      runtimeStackValue: "Bun + Elysia + HTMX",
      aiConfigPatternValue: "AI_LOCAL_* / OLLAMA_*",
      sceneLibraryTitle: "场景库",
      sceneCreateDescription: "先创建或选择场景，再细化布局与运行时预览。",
      sceneCreateTitlePlaceholder: "teaHouseAnnex",
      sceneBackgroundPlaceholder: "/assets/images/backgrounds/tea-house-annex.png",
      npcRosterTitle: "NPC 阵列",
      npcCreateDescription: "先把 NPC 放进场景，再调节移动、对话与接近问候行为。",
      npcCreateSceneLabel: "所属场景",
      npcCreateKeyPlaceholder: "teaMonk",
      npcCreateLabelPlaceholder: "npc.teaMonk.label",
      assetsWorkspaceTitle: "资源工作区",
      assetKindLabel: "资源类型",
      assetSourceLabel: "资源来源",
      animationClipsTitle: "动画片段",
      createAnimationClip: "创建动画片段",
      clipAssetLabel: "所属资源",
      clipStateTagLabel: "状态标签",
      clipFrameCountLabel: "帧数",
      clipPlaybackLabel: "播放 FPS",
      clipIdLabel: "片段 ID",
      generationJobsTitle: "生成任务",
      generationJobKindLabel: "任务类型",
      generationPromptLabel: "提示词",
      createGenerationJob: "加入生成队列",
      dialogueSearchLabel: "筛选对话",
      dialogueSearchPlaceholder: "按 NPC 或对话键搜索",
      dialogueWorkspaceTitle: "对话工作区",
      dialogueCreateDescription: "按 NPC 管理对话，并先用 AI 起草再保存。",
      dialogueKeyPlaceholder: "npc.teaMonk.greet",
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
      dialogueNpcIdPlaceholder: "teaMonk",
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
      automationStepBrowser: "浏览器",
      automationStepHttp: "HTTP",
      automationStepBuilder: "构建器",
      automationStepAttachFile: "附加文件",
      automationSummaryCaptureReviewContext: "采集构建器审查上下文",
      automationSummaryPrepareDraftPlan: "准备草稿变更方案",
      automationSummaryAttachReviewEvidence: "将证据附加到草稿审查",
      automationArtifactSummaryCapturedReviewEvidence: "已采集构建器审查证据",
      automationStatusQueuedForProcessing: "已加入处理队列",
      automationStatusApprovedForApply: "已批准应用",
      automationStatusCanceledByReview: "已在审查中取消",
      automationStatusPlanReadyForReview: "自动化方案已准备好供审查",
      automationStatusCapturingFallbackEvidence: "正在采集回退审查证据",
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
      capabilityReleaseFlowTitle: "发布链路",
      capabilityReleaseFlowDescription:
        "项目已经可以创作、发布为不可变版本，并在玩家视图中按项目进入已发布构建。",
      capability2dRuntimeTitle: "2D 运行时",
      capability2dRuntimeDescription:
        "当前只有一套较窄的浏览器运行时可验证基线内容模型，还没有通用的 2D 世界编辑器或复用型游戏创作流水线。",
      capability3dRuntimeTitle: "3D 运行时",
      capability3dRuntimeDescription:
        "Three.js 目前只承担精灵场景下方的氛围与光照效果，并没有 3D 场景图、资源管线或对应的构建流程。",
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
        "系统现在已有生命周期托管的后台 worker，并可抓取 Playwright 审查证据，但多步骤工具编排与生产级 RPA 仍只是部分实现。",
      capabilityWebgpuRendererTitle: "WebGPU 渲染器",
      capabilityWebgpuRendererDescription:
        "PixiJS 可在支持 WebGPU 时自动检测并优先使用 WebGPU 进行 2D 渲染，否则无缝回退至 WebGL。",
      capabilityAiOnnxGpuTitle: "ONNX GPU 加速",
      capabilityAiOnnxGpuDescription:
        "Transformers.js 管线可在支持时将 ONNX 推理定向至 WebGPU 设备进行 GPU 加速。",
    },
  },
};
