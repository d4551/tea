# 平台差距审计（作用域模型、Web 原生对标与缺失工作区）

本文审计 TEA 当前的所有权模型与 Builder 信息架构，并以 Web 原生创建平台作为对标对象。

主要对标集：

- PlayCanvas 官方文档与编辑器模型
- Phaser 引擎文档
- Phaser Editor 文档

不纳入评分范围：

- 主机与移动端导出流水线
- 仅桌面 IDE 行为
- 商店变现与广告 SDK
- 完整桌面引擎对等能力

## 1) 当前状态地图

### 1.1) 所有权作用域表

| 作用域 | TEA 当前状态 | 仓库证据 | 审计结论 |
| --- | --- | --- | --- |
| `global` | AI 运行时与 provider 能在无项目上下文下使用，AI 知识接口允许省略 `projectId`。 | `src/routes/ai-routes.ts`、`src/domain/ai/*`、`src/views/builder/ai-panel.ts` | 存在，但很窄。全局作用域主要只覆盖 AI 运行时，不覆盖作者资源或工作区 IA。 |
| `organization` | 组织、角色、成员关系与 principal session 已存在，用于鉴权和审计。 | `prisma/schema.prisma` 中的 `Organization`、`OrganizationRole`、`AppUserOrganizationMembership`、`AppPrincipalSession` | 只在鉴权层存在，未进入 Builder 内容所有权。没有组织级资源或能力配置模型。 |
| `project` | Builder 路由、作者内容、上传、生成任务、自动化运行以及大部分 AI UI 状态都绑定在单个 `projectId` 下。 | `src/routes/builder-routes.ts`、`prisma/schema.prisma` 中的 `BuilderProject*`、`src/domain/builder/asset-storage.ts` | 主导性作用域。TEA 目前把多数平台关注点都压进了项目作用域。 |
| `release` | 不可变发布版本已存在，运行时会从已发布 release 启动。 | `prisma/schema.prisma` 中的 `BuilderProjectRelease`、`builder-project-state-store`、`game-loop.ts` | 模型清晰，但仍更像发布快照，而不是一等的 Release 工作区。 |
| `session` | 玩家运行态、场景状态、库存、战斗、过场和恢复信息都按 session 隔离。 | `prisma/schema.prisma` 中的 `GameSession*`、`src/domain/game/services/GameStateStore.ts` | 已存在且边界清晰。运行时隔离比 Builder / 平台隔离更成熟。 |

### 1.2) 仓库中能证明“项目优先 IA”的证据

- Builder 页面路由全部采用 `/:projectId/...`，包括 `start`、`world`、`characters`、`story`、`assets`、`systems`、`operations`、`settings`，见 `src/routes/builder-routes.ts`。
- Builder 侧边栏在一个项目壳内组合作者页与运行时页，见 `src/views/builder/builder-layout.ts`。
- 作者内容通过 `BuilderProject`、`BuilderProjectScene`、`BuilderProjectAsset`、`BuilderProjectDialogueGraph`、`BuilderProjectGenerationJob`、`BuilderProjectAutomationRun` 等表持久化，见 `prisma/schema.prisma`。
- 文件写入路径固定为 `builderUploadsDirectory/<projectId>/<scope>/...`，见 `src/domain/builder/asset-storage.ts`。
- Starter 流程只负责创建或打开一个项目，而不是展示多游戏组合视图，见 `src/views/builder/builder-starter.ts`。
- AI 设置放在项目路由内，但其中不少能力本质上是全局或跨项目关注点，如 provider 清单、模型设置、检索、工具规划、语音预览，见 `src/views/builder/ai-panel.ts`。

### 1.3) TEA 把平台关注点压进 `projectId` 的位置

TEA 当前把三类不同性质的问题放进了同一个项目壳：

1. 应继续留在项目内的作者数据。
2. 应归属于全局或组织层的平台能力。
3. 应归属于 release 或队列层的复核与发布流程。

具体冲突点：

- AI provider 清单与运行时设置显示在 `/:projectId/settings` 下，但 provider 通道、模型目录与运行时健康并不天然属于某个项目。
- 生成工件与自动化复核被视为项目操作，却没有跨项目或跨 release 的统一队列。
- 资源上传与生成文件在物理路径上按项目隔离，这会阻止共享资源库，除非重复拷贝资源。
- Starter template 已存在，但目前只是“一次性项目引导数据”，而不是具有自身生命周期的模板或资源包实体。

### 1.4) 当前工作区表面

TEA 目前暴露的 Builder 表面：

- `start`：项目仪表盘
- `world`：场景与节点
- `characters`：NPC 编辑
- `story`：对白编辑
- `assets`：资源与动画片段
- `systems`：任务、触发器、对白图、标志
- `operations`：自动化运行与生成工件
- `settings`：AI 运行时、检索、模型设置、语音工具、补丁预览
- `playtest`：运行时启动

缺失的顶层表面：

- 游戏组合页
- 共享资源库
- 模板目录
- 能力与策略中心
- 发布历史与渠道
- 跨项目复核队列

## 2) 外部对标

### 2.1) 对标平台明确建模了什么

| 能力 | PlayCanvas | Phaser / Phaser Editor | 对 TEA 的含义 |
| --- | --- | --- | --- |
| 项目工作区 | PlayCanvas 把项目、资源、层级和 Inspector 作为分离的编辑器表面。 | Phaser Editor 使用 Workbench，包含 Files、Outline、Inspector、Blocks。 | TEA 需要更清晰地区分组合入口、编辑器壳与设置表面。 |
| 资源系统 | PlayCanvas 有 asset registry 与编辑器资源工作流，而不是只做场景附属资源。 | Phaser 使用 loader 与 pack 文件；Phaser Editor 有 Asset Pack Editor。 | TEA 需要共享资源库与 pack 挂载，不应只靠项目内上传。 |
| 场景结构 | PlayCanvas 使用 entity hierarchy 与 component composition。 | Phaser 有明确 scene lifecycle 与多 scene 模型；Phaser Editor 有 Scene Editor 与 Outline。 | TEA 应把场景层级编辑从纯列表表单中拆出来。 |
| Inspector 模型 | PlayCanvas 与 Phaser Editor 都把属性编辑做成独立 Inspector。 | Phaser Editor 直接把 Inspector 作为对象编辑主入口。 | TEA 目前主要依赖表单与折叠面板，缺少真正的 Inspector 工作流。 |
| 复用模型 | PlayCanvas 支持 entity clone 与模板式复用。 | Phaser Editor 支持 prefab-like custom objects 与可复用场景对象。 | TEA 需要一等的模板与挂载模型，而不是项目内复制。 |
| Tilemap 与资源包 | PlayCanvas 更偏 entity 与 asset；Phaser 在浏览器端对 tilemap 与 pack 工作流更强。 | Phaser 与 Phaser Editor 把 tilemap、asset pack 做成明确编辑概念。 | TEA 应把 tilemap、pack、scene kit 提升为 IA 中的概念，而不是藏在 JSON 中。 |

### 2.2) 对标评分说明

- PlayCanvas 最适合作为浏览器原生编辑器布局、资源管理、Hierarchy + Inspector 的参考。
- Phaser 引擎最适合作为 scene lifecycle、asset loading、pack 文件与浏览器运行时组织方式的参考。
- Phaser Editor 最适合作为 Workbench 布局、Outline / Inspector 分离、prefab-like 复用与 tilemap 编辑的参考。

### 2.3) 对标结论

这些平台并不采用 TEA 的 SSR-first 与 AI-first 选择，但它们都稳定地区分了：

- 组合入口与项目选择
- 文件 / 资源管理与场景编辑
- 层级结构与属性编辑
- 可复用模板与一次性项目内容

TEA 当前在运行时与发布隔离上较强，在作者工作区分层上较弱。

## 3) 差距矩阵

### 3.1) 平台 IA 差距

| 差距 | TEA 当前状态 | 对标模式 | 为什么重要 | 优先级 |
| --- | --- | --- | --- | --- |
| 游戏组合页 | Starter 流程只创建或打开一个项目 ID，没有组合入口。 | Web 原生工具通常把项目列表作为首页。 | 多游戏创作、发现与归属审查都被隐藏在手工 ID 后面。 | Foundational |
| 共享资源库 | 资源是项目拥有的，存储路径也按项目隔离。 | PlayCanvas 资源工作流与 Phaser 资源包都把资源当作可复用单元。 | 现在想复用内容只能复制，无法保证品牌与共享内容一致。 | Foundational |
| 模板与资源包所有权 | Starter template 已有，但不是可版本化、可复用的目录实体。 | Web 原生编辑器普遍把 prefab / pack 做成显式概念。 | TEA 不能把场景 kit、NPC kit、系统模板当成可复用产品。 | Foundational |
| 组织级能力策略 | 组织模型只在 auth / audit 层存在。 | 团队工具会把策略与项目编辑分层。 | provider 策略、共享模型、复核权限无法按团队统一治理。 | High leverage |
| Release 工作区 | Release 在存储中存在，但没有独立工作区展示历史、渠道或 rollout 状态。 | 编辑器平台通常会区分“编辑中”与“发布物”。 | 发布仍然只是一个按钮，不是完整发布管理面。 | High leverage |
| 跨项目复核队列 | Operations 是项目内局部页面。 | 现代创作工作流会集中展示待审状态。 | 生成工件与自动化证据在多游戏环境下难以监管。 | High leverage |

### 3.2) 引擎与编辑器差距

| 差距 | TEA 当前状态 | 对标模式 | 为什么重要 | 优先级 |
| --- | --- | --- | --- | --- |
| Hierarchy + Inspector 布局 | Scene、Asset、AI 编辑仍是列表加详情表单。 | PlayCanvas Hierarchy 与 Phaser Editor Outline + Inspector。 | 没有持续选中态与属性面板时，复杂场景扩展性很差。 | Foundational |
| Prefab / 可复用对象模型 | 有 Starter template，但没有可复用场景对象或组件模板。 | Phaser Editor prefab-like object 与 PlayCanvas entity reuse。 | 现在复用 NPC、道具、遭遇战或 UI 只能复制粘贴。 | Foundational |
| 资源依赖图 | 资源、片段、时间线、图集与节点有关联，但未形成依赖视图。 | 资源包与编辑器资源视图通常会显式展示依赖。 | 创作者无法回答“改动某个资源会影响什么”。 | High leverage |
| Import pipeline 工作区 | 已有上传，但缺少导入复核、校验、变体生成工作区。 | Web 原生编辑器会分离文件导入与对象使用。 | 格式归一化、派生变体与校验逻辑仍是隐式行为。 | High leverage |
| 场景组合工作区 | TEA 能编辑场景，但没有完整的 viewport + hierarchy + inspector 组合流。 | PlayCanvas 与 Phaser Editor 的 Scene Editor 模式。 | 场景编辑仍偏表单化，不够组合化。 | High leverage |
| 发布渠道 | 已有 release，但无 `draft`、`internal`、`live`、`archived` 等渠道模型。 | 发布工具通常把 active build 与 revision history 分开。 | 发布意图与 rollout 语义目前不可见。 | Later |
| 协作表面 | 有 auth 与 audit，但没有活动流、锁、分配或复核归属表面。 | 浏览器原生团队工具通常会暴露团队协作信号。 | 一旦项目数量增长，多人协作会迅速混乱。 | Later |

### 3.3) AI 差距

| 差距 | TEA 当前状态 | 仓库证据 | 为什么重要 | 优先级 |
| --- | --- | --- | --- | --- |
| 全局与项目能力边界 | 全局 AI 运行时已存在，但 AI UX 仍嵌在项目设置页内。 | `src/routes/ai-routes.ts`、`src/views/builder/ai-panel.ts` | 用户难以区分什么是平台能力，什么是项目能力。 | Foundational |
| 可复用 capability profile | Provider registry 与运行时设置已存在，但没有命名能力配置。 | `src/domain/ai/*`、`src/views/builder/ai-panel.ts` | 多游戏重复配置会产生漂移。 | Foundational |
| 跨项目检索 | 省略 `projectId` 时可以全局检索知识，但没有显式的全局知识工作区。 | `src/routes/ai-routes.ts` 中的 knowledge endpoints | 共享世界观与设计规范没有被建模成显式知识库。 | High leverage |
| 世界级规划 | 已有 tool planning，但未绑定到组合页、release 计划或跨项目路线图。 | `aiPlanTools` in `src/routes/ai-routes.ts` | AI 只能建议步骤，不能围绕真实平台对象工作。 | High leverage |
| AI 输出复核队列 | 生成工件是项目局部复核。 | `src/domain/builder/creator-worker.ts`、`src/views/builder/automation-panel.ts` | AI 面扩大后，没有统一复核入口会积累隐性风险。 | High leverage |
| Provenance 与策略 UX | API 与审计层已有 provenance，但缺少治理 UI。 | `audit-service.ts`、tool plan / assist 流程 | AI 使用范围变大后，信任与策略会更难管理。 | Later |
| 资源批评与迭代闭环 | TEA 已有图像与语音能力，但缺少放在资源编辑中的批评-迭代闭环。 | `game-ai-service.ts`、`ai-panel.ts` | AI 与真实的美术 / 设计工作流仍是分离的。 | Later |

## 4) 建议的信息架构

### 4.1) 目标所有权模型

| 作用域 | 建议承载内容 |
| --- | --- |
| `global` | provider catalog、运行时默认值、共享知识、starter template registry、平台级 feature flag |
| `organization` | 资源库、能力策略、团队角色、共享 pack、复核队列、项目组合元信息 |
| `project` | scenes、NPCs、dialogue、quests、flags、项目挂载资源、本地知识、自动化状态 |
| `release` | 不可变快照、release note、校验报告、渠道、rollout 状态、签核信息 |
| `session` | 玩家进度、实时运行态、传输状态、resume token |

### 4.2) 建议增加的工作区与布局表面

在继续加深项目壳之前，先补齐这些顶层表面：

- `Games`：项目组合页、归属、健康、最新 release、活跃 session
- `Libraries`：共享资源、packs、templates、文档、导入文件
- `Templates`：starter template、prefab、scene kit、NPC kit、mechanic kit
- `Capabilities`：AI provider、模型策略、运行时设置、治理、审计姿态
- `Releases`：发布历史、校验状态、渠道、回滚目标、rollout 元数据
- `Review Queue`：生成工件、自动化证据、待审项、provenance 轨迹

保留在项目壳中的表面：

- `World`
- `Characters`
- `Story`
- `Systems`
- `Project Assets`
- `Playtest`

### 4.3) 建议新增的一等接口

为平台层引入明确契约：

- 作用域枚举：`global | organization | project | release | session`
- `AssetLibrary`
- `SharedAsset`
- `ProjectTemplate`
- `CapabilityProfile`
- 项目挂载模型：把共享资源和模板“链接”进项目，而不是复制其源所有权

建议的路由拆分：

- 组合页路由：`/games`、`/libraries`、`/templates`、`/capabilities`、`/releases`、`/review`
- 项目路由：`/projects/:projectId/...`

### 4.4) 建议推进顺序

1. 先引入作用域契约与路由分层。
2. 增加 Games、Libraries、Capabilities 表面。
3. 把全局和组织级 AI 关注点从项目设置页中移出。
4. 增加模板与挂载模型，用于复用资源和内容包。
5. 把 releases 与 review queue 升级为一等工作区。
6. 再把项目编辑器重构为 hierarchy + inspector 布局。

## 5) 验收清单

只要未来实现仍然满足以下结论，本审计就仍然成立：

- TEA 当前最强的是 `release` 与 `session` 隔离。
- TEA 当前最弱的是 `global`、`organization`、`project` 三层作者关注点的分离。
- AI 已经隐约存在全局作用域，但 Builder 其余部分尚未跟上。
- Web 原生编辑器对标结果稳定表明：工作台布局、资源管理、场景结构与模板复用需要分层。
- 下一步不是“继续添加项目标签页”，而是“先补平台作用域和工作区分层”。

## 6) 来源说明

本审计使用的主要外部参考：

- PlayCanvas 官方引擎与编辑器模型
- Phaser 官方 scene 与 loader 文档
- Phaser Editor 官方 workbench、Scene Editor、Asset Pack Editor、prefab、editable tilemap 文档

这些参考仅作为模式对标，不是直接实现目标。
