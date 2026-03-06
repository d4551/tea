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
    readonly invalidCommand: string;
    readonly invalidDirection: string;
    readonly chatMissingFields: string;
    readonly unknownCommandType: string;
  };
  readonly builder: {
    readonly projectNotFound: string;
    readonly sceneNotFound: string;
    readonly npcNotFound: string;
    readonly dialogueNotFound: string;
    readonly noDialogues: string;
    readonly title: string;
    readonly dashboard: string;
    readonly scenes: string;
    readonly npcs: string;
    readonly dialogue: string;
    readonly assets: string;
    readonly ai: string;
    readonly addScene: string;
    readonly editScene: string;
    readonly addNpc: string;
    readonly editNpc: string;
    readonly addDialogue: string;
    readonly generateDialogue: string;
    readonly uploadAsset: string;
    readonly critiqueAsset: string;
    readonly testDialogue: string;
    readonly designAssist: string;
    readonly activeSessions: string;
    readonly totalScenes: string;
    readonly totalNpcs: string;
    readonly aiStatus: string;
    readonly noScenes: string;
    readonly noNpcs: string;
    readonly save: string;
    readonly cancel: string;
    readonly delete: string;
    readonly preview: string;
    readonly sceneId: string;
    readonly sceneTitle: string;
    readonly spawnPoint: string;
    readonly geometry: string;
    readonly collisions: string;
    readonly npcName: string;
    readonly npcPosition: string;
    readonly wanderRadius: string;
    readonly wanderSpeed: string;
    readonly dialogueKey: string;
    readonly dialogueLine: string;
    readonly providerStatus: string;
    readonly availableModels: string;
    readonly closeSidebar: string;
    readonly capabilityHeader: string;
    readonly statusHeader: string;
    readonly visionLabel: string;
    readonly sentimentLabel: string;
    readonly embeddingsLabel: string;
    readonly speechToTextLabel: string;
    readonly speechSynthesisLabel: string;
    readonly localInferenceLabel: string;
    readonly npcIdLabel: string;
    readonly messageLabel: string;
    readonly promptLabel: string;
    readonly widthLabel: string;
    readonly heightLabel: string;
    readonly xLabel: string;
    readonly yLabel: string;
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
      home: "Architecture",
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
        title: "System Architecture",
        heroTitle: "Local-first AI game engine builder with SSR operator surfaces",
        heroDescription:
          "The platform runs on Bun + Elysia, renders on the server by default, and now exposes a configurable local AI stack for dialogue, speech, embeddings, and builder operations.",
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
      invalidCommand: "Invalid command payload",
      invalidDirection: "Invalid move direction",
      chatMissingFields: "Chat commands require npcId and message",
      unknownCommandType: "Unknown command type",
    },
    builder: {
      projectNotFound: "Project not found",
      sceneNotFound: "Scene not found",
      npcNotFound: "NPC not found",
      dialogueNotFound: "Dialogue key not found",
      noDialogues: "No dialogue entries found",
      title: "Game Builder",
      dashboard: "Dashboard",
      scenes: "Scenes",
      npcs: "NPCs",
      dialogue: "Dialogue",
      assets: "Assets",
      ai: "AI Tools",
      addScene: "Add Scene",
      editScene: "Edit Scene",
      addNpc: "Add NPC",
      editNpc: "Edit NPC",
      addDialogue: "Add Line",
      generateDialogue: "Generate with AI",
      uploadAsset: "Upload Asset",
      critiqueAsset: "AI Critique",
      testDialogue: "Test Dialogue",
      designAssist: "Design Assistant",
      activeSessions: "Active Sessions",
      totalScenes: "Total Scenes",
      totalNpcs: "Total NPCs",
      aiStatus: "AI Status",
      noScenes: "No scenes defined yet.",
      noNpcs: "No NPCs defined yet.",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      preview: "Preview",
      sceneId: "Scene ID",
      sceneTitle: "Scene Title",
      spawnPoint: "Spawn Point",
      geometry: "Geometry",
      collisions: "Collisions",
      npcName: "NPC Name",
      npcPosition: "Position",
      wanderRadius: "Wander Radius",
      wanderSpeed: "Wander Speed",
      dialogueKey: "Dialogue Key",
      dialogueLine: "Dialogue Line",
      providerStatus: "Provider Status",
      availableModels: "Available Models",
      closeSidebar: "Close sidebar",
      capabilityHeader: "Capability",
      statusHeader: "Status",
      visionLabel: "Vision",
      sentimentLabel: "Sentiment",
      embeddingsLabel: "Embeddings",
      speechToTextLabel: "Speech to Text",
      speechSynthesisLabel: "Text to Speech",
      localInferenceLabel: "Local Inference",
      npcIdLabel: "NPC ID",
      messageLabel: "Message",
      promptLabel: "Prompt",
      widthLabel: "Width",
      heightLabel: "Height",
      xLabel: "X",
      yLabel: "Y",
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
    },
  },
  "zh-CN": {
    metadata: {
      appName: "落叶王朝",
      appSubtitle: "以茶为核心的策略世界观工具集",
    },
    navigation: {
      home: "架构",
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
        title: "系统架构",
        heroTitle: "以本地 AI 为核心的 SSR 游戏引擎构建平台",
        heroDescription:
          "平台基于 Bun + Elysia，默认服务端渲染，并提供可配置的本地 AI 栈，用于对话、语音、嵌入与构建流程。",
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
      invalidCommand: "无效命令",
      invalidDirection: "无效移动方向",
      chatMissingFields: "缺少聊天对象或消息内容",
      unknownCommandType: "未识别的命令类型",
    },
    builder: {
      projectNotFound: "项目未找到",
      sceneNotFound: "场景未找到",
      npcNotFound: "NPC 未找到",
      dialogueNotFound: "对话键未找到",
      noDialogues: "未找到对话条目",
      title: "游戏构建器",
      dashboard: "仪表盘",
      scenes: "场景",
      npcs: "NPC",
      dialogue: "对话",
      assets: "资源",
      ai: "AI 工具",
      addScene: "添加场景",
      editScene: "编辑场景",
      addNpc: "添加 NPC",
      editNpc: "编辑 NPC",
      addDialogue: "添加对话",
      generateDialogue: "AI 生成",
      uploadAsset: "上传资源",
      critiqueAsset: "AI 评审",
      testDialogue: "测试对话",
      designAssist: "设计助手",
      activeSessions: "活跃会话",
      totalScenes: "场景总数",
      totalNpcs: "NPC 总数",
      aiStatus: "AI 状态",
      noScenes: "尚未定义场景。",
      noNpcs: "尚未定义 NPC。",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      preview: "预览",
      sceneId: "场景 ID",
      sceneTitle: "场景标题",
      spawnPoint: "出生点",
      geometry: "几何尺寸",
      collisions: "碰撞区域",
      npcName: "NPC 名称",
      npcPosition: "位置",
      wanderRadius: "游走半径",
      wanderSpeed: "游走速度",
      dialogueKey: "对话键",
      dialogueLine: "对话内容",
      providerStatus: "提供商状态",
      availableModels: "可用模型",
      closeSidebar: "关闭侧边栏",
      capabilityHeader: "能力",
      statusHeader: "状态",
      visionLabel: "视觉",
      sentimentLabel: "情感分析",
      embeddingsLabel: "嵌入向量",
      speechToTextLabel: "语音转文本",
      speechSynthesisLabel: "文本转语音",
      localInferenceLabel: "本地推理",
      npcIdLabel: "NPC ID",
      messageLabel: "消息",
      promptLabel: "提示词",
      widthLabel: "宽度",
      heightLabel: "高度",
      xLabel: "X",
      yLabel: "Y",
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
    },
  },
};
