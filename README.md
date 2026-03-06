<![CDATA[<div align="center">

```
              ;,'
         _o_  ;:;'
     ,-.'---`.__ ;
    ((j`=====',-'
     `-\     /
       `-=-'
```

# 🍵 TEA Game Engine

**T**emplated · **E**vent-driven · **A**gentic

SSR-first game engine and worldbuilding platform powered by Bun, Elysia, HTMX, and PixiJS.

服务端渲染优先的游戏引擎与世界构建平台，基于 Bun、Elysia、HTMX 和 PixiJS 驱动。

---

[English](#overview) · [中文](#概述)

</div>

---

## Overview

TEA Game Engine is a server-driven game development platform that fuses SSR page delivery, real-time AI narrative generation, and a browser-native playable game client into a single cohesive runtime. It is purpose-built for **Leaves of the Fallen Kingdom (LOTFK)** — a strategy worldbuilding experience.

## 概述

TEA 游戏引擎是一个服务端驱动的游戏开发平台，将 SSR 页面渲染、实时 AI 叙事生成和浏览器原生可玩游戏客户端融合为一体化运行时。专为**落叶王国 (LOTFK)**——一款策略世界构建体验而打造。

---

## Technology Stack / 技术栈

| Layer / 层级 | Technology / 技术 | Version / 版本 |
|---|---|---|
| Runtime / 运行时 | Bun | `1.3.x` |
| Language / 语言 | TypeScript (strict) | `5.9` |
| Server Framework / 服务端框架 | Elysia | `1.4` |
| Type-safe Client / 类型安全客户端 | Eden Treaty | `1.4` |
| SSR Enhancement / SSR 增强 | HTMX | `2.0` |
| CSS Framework / CSS 框架 | Tailwind CSS | `4.x` |
| UI Components / UI 组件 | DaisyUI | `5.x` |
| ORM | Prisma + libSQL adapter | `7.x` |
| 2D Game Renderer / 2D 游戏渲染 | PixiJS | `8.x` |
| 3D Renderer / 3D 渲染 | Three.js | `0.183` |
| AI / Inference | 🤗 Transformers (ONNX) | `3.8` |
| Image Processing / 图像处理 | Sharp | `0.34` |

---

## Architecture / 系统架构

### High-Level System Diagram / 高层系统图

```mermaid
graph TB
  subgraph Client["🖥️ Browser Client / 浏览器客户端"]
    HTMX["HTMX<br/>Progressive Enhancement<br/>渐进增强"]
    PIXI["PixiJS 8<br/>2D Game Canvas<br/>2D 游戏画布"]
    THREE["Three.js<br/>3D Rendering<br/>3D 渲染"]
    EXT["Custom HTMX Extensions<br/>自定义 HTMX 扩展"]
  end

  subgraph Server["⚙️ Elysia Server / Elysia 服务器"]
    APP["app.ts<br/>Plugin Composition<br/>插件编排"]

    subgraph Plugins["Plugins / 插件层"]
      RC["Request Context<br/>请求上下文"]
      I18N["i18n Context<br/>国际化上下文"]
      AI_CTX["AI Context<br/>AI 上下文"]
      SSE["SSE Plugin<br/>SSE 插件"]
      ERR["Error Handler<br/>错误处理"]
      GAME_P["Game Plugin<br/>游戏插件"]
      SESS["Session Purge<br/>会话清理"]
    end

    subgraph Routes["Routes / 路由层"]
      PAGE["SSR Pages<br/>SSR 页面"]
      API["JSON API<br/>JSON 接口"]
      AI_R["AI Routes<br/>AI 路由"]
      BUILDER["Builder API<br/>构建器 API"]
      GAME_R["Game Routes<br/>游戏路由"]
    end

    subgraph Domain["Domain / 领域层"]
      ORACLE["Oracle<br/>神谕系统"]
      GAME_D["Game Logic<br/>游戏逻辑"]
      BUILD_D["Builder<br/>构建器"]
      AI_D["AI Service<br/>AI 服务"]
    end
  end

  subgraph Data["💾 Data / 数据层"]
    PRISMA["Prisma ORM"]
    LIBSQL["libSQL / Turso"]
  end

  Client -->|"HTTP + HTMX Swaps<br/>HTTP + HTMX 交换"| Server
  APP --> Plugins
  Plugins --> Routes
  Routes --> Domain
  Domain --> Data
  PIXI -.->|"WebSocket / SSE"| SSE
```

### Request Lifecycle / 请求生命周期

```mermaid
sequenceDiagram
  participant B as Browser / 浏览器
  participant E as Elysia Server / 服务器
  participant RC as Request Context / 请求上下文
  participant I18N as i18n Plugin / 国际化插件
  participant R as Route Handler / 路由处理
  participant D as Domain Service / 领域服务
  participant DB as Prisma + libSQL

  B->>E: HTTP Request / HTTP 请求
  E->>RC: Generate Correlation ID / 生成关联 ID
  RC->>I18N: Resolve locale from query + Accept-Language<br/>从查询参数和 Accept-Language 解析区域设置
  I18N->>R: Inject i18n catalog / 注入国际化目录
  R->>D: Execute domain logic / 执行领域逻辑
  D->>DB: Query / Mutation / 查询或变更
  DB-->>D: Result / 结果
  D-->>R: Domain response / 领域响应
  R-->>E: SSR HTML or JSON envelope<br/>SSR HTML 或 JSON 信封
  E-->>B: Response + x-correlation-id header<br/>响应 + x-correlation-id 头
```

### Plugin Composition Order / 插件编排顺序

```mermaid
flowchart LR
  A["1. Request Context<br/>请求上下文"] --> B["2. i18n Context<br/>国际化上下文"]
  B --> C["3. AI Context<br/>AI 上下文"]
  C --> D["4. SSE Plugin<br/>SSE 插件"]
  D --> E["5. Error Handler<br/>错误处理"]
  E --> F["6. Static Mounts<br/>静态资源挂载"]
  F --> G["7. Swagger Docs<br/>API 文档"]
  G --> H["8. SSR + API Routes<br/>SSR 与 API 路由"]

  style A fill:#4ade80,color:#000
  style B fill:#60a5fa,color:#000
  style C fill:#c084fc,color:#000
  style D fill:#fb923c,color:#000
  style E fill:#f87171,color:#000
  style F fill:#94a3b8,color:#000
  style G fill:#fbbf24,color:#000
  style H fill:#2dd4bf,color:#000
```

### Build & Dev Pipeline / 构建与开发流水线

```mermaid
flowchart TD
  DEV["bun run dev"]

  DEV --> SETUP["Asset Setup<br/>资产初始化"]
  DEV --> TW["Tailwind CSS Watcher<br/>Tailwind CSS 监听"]
  DEV --> HX["HTMX Extension Watcher<br/>HTMX 扩展监听"]
  DEV --> GC["Game Client Watcher<br/>游戏客户端监听"]
  DEV --> SRV["Elysia Server Watcher<br/>Elysia 服务器监听"]

  SETUP --> PUBLIC["public/<br/>静态资源"]
  TW --> PUBLIC
  HX --> PUBLIC

  GC --> GAME_DIR["public/game/<br/>游戏运行时资产"]

  SRV --> LIVE["Live Server<br/>实时服务器"]

  FAIL["Fail-Fast Shutdown<br/>快速失败关闭"] -.->|"watches all<br/>监控所有进程"| DEV

  style DEV fill:#4ade80,color:#000
  style FAIL fill:#f87171,color:#000
```

### Domain Architecture / 领域架构

```mermaid
graph LR
  subgraph Domain["Domain Layer / 领域层"]
    direction TB
    O["🔮 Oracle / 神谕<br/>Narrative AI responses<br/>叙事 AI 响应"]
    G["🎮 Game / 游戏<br/>State, scenes, text<br/>状态、场景、文本"]
    B["🏗️ Builder / 构建器<br/>Project management<br/>项目管理"]
    AI["🤖 AI / 人工智能<br/>Inference pipeline<br/>推理管线"]
  end

  subgraph Packages["Workspace Packages / 工作区包"]
    CONTRACTS["lotfk-game-contracts<br/>Type-safe game schemas<br/>类型安全游戏模式"]
    PRNG["lotfk-seeded-prng<br/>Deterministic RNG<br/>确定性随机数"]
  end

  G --> CONTRACTS
  G --> PRNG
  O --> AI

  style O fill:#c084fc,color:#000
  style G fill:#4ade80,color:#000
  style B fill:#60a5fa,color:#000
  style AI fill:#fb923c,color:#000
```

---

## Project Structure / 项目结构

```
tea/
├── src/
│   ├── app.ts              # Plugin + route composition / 插件与路由编排
│   ├── server.ts           # Boot entry / 启动入口
│   ├── config/             # Typed environment config / 类型化环境配置
│   ├── domain/             # Domain logic / 领域逻辑
│   │   ├── ai/             # AI inference pipeline / AI 推理管线
│   │   ├── builder/        # Project builder / 项目构建器
│   │   ├── game/           # Game state & scenes / 游戏状态与场景
│   │   └── oracle/         # Oracle narrative engine / 神谕叙事引擎
│   ├── htmx-extensions/    # Custom HTMX extensions / 自定义 HTMX 扩展
│   ├── lib/                # Structured logging & error envelope / 结构化日志与错误信封
│   ├── playable-game/      # Browser game client source / 浏览器游戏客户端源码
│   ├── plugins/            # Elysia plugins / Elysia 插件
│   ├── routes/             # SSR pages + API + partials / SSR 页面 + API + 局部视图
│   ├── shared/             # Constants, i18n, contracts, utils / 常量、国际化、契约、工具
│   ├── styles/             # Tailwind + DaisyUI source / Tailwind + DaisyUI 源码
│   └── views/              # SSR templates / SSR 模板
├── packages/               # Bun workspace packages / Bun 工作区包
│   ├── lotfk-game-contracts/  # Shared game type schemas / 共享游戏类型模式
│   └── lotfk-seeded-prng/     # Deterministic PRNG / 确定性伪随机数生成器
├── prisma/                 # Prisma schema + migrations / Prisma 模式与迁移
├── scripts/                # Build, dev, sprite processing / 构建、开发、精灵图处理
├── public/                 # Compiled static assets / 编译后静态资产
├── tests/                  # API + config tests / API 与配置测试
└── LOTFK_RMMZ_Agentic_Pack/  # RPG Maker MZ plugin pack / RPG Maker MZ 插件包
```

---

## Runtime Model / 运行时模型

### SSR & Progressive Enhancement / SSR 与渐进增强

```mermaid
flowchart LR
  subgraph SSR["SSR (Default) / SSR（默认）"]
    H["Full HTML Page<br/>完整 HTML 页面"]
  end

  subgraph HTMX_PE["HTMX Enhancement / HTMX 增强"]
    P["Partial Swap<br/>局部交换"]
    OOB["OOB Swap<br/>带外交换"]
  end

  subgraph Game["Game Client / 游戏客户端"]
    CANVAS["PixiJS Canvas<br/>PixiJS 画布"]
    HUD["HUD Overlay<br/>HUD 覆盖层"]
  end

  H -->|"hx-boost / hx-get"| P
  P --> OOB
  H -->|"/game mount"| CANVAS
  CANVAS --> HUD

  style SSR fill:#4ade80,color:#000
  style HTMX_PE fill:#60a5fa,color:#000
  style Game fill:#c084fc,color:#000
```

**Key behaviors / 关键行为:**

- All pages render via SSR by default / 所有页面默认通过 SSR 渲染
- HTMX provides progressive enhancement for interactive elements / HTMX 为交互元素提供渐进增强
- Oracle interactions use HTMX partial swaps within `#oracle-panel` / 神谕交互使用 HTMX 局部交换
- Game client mounts at configurable `PLAYABLE_GAME_MOUNT_PATH` / 游戏客户端挂载在可配置路径
- SSE/WebSocket for real-time game state updates / SSE/WebSocket 用于实时游戏状态更新

### Internationalization / 国际化 (i18n)

```mermaid
flowchart TD
  REQ["Incoming Request / 传入请求"]
  Q["?lang= query param<br/>查询参数"]
  AL["Accept-Language header<br/>Accept-Language 头<br/>(q-weight parsed / q 权重解析)"]
  MATCH["matchLocale()<br/>Centralized matcher<br/>统一匹配器"]
  CAT["Message Catalog / 消息目录"]
  RENDER["SSR Render / SSR 渲染"]

  REQ --> Q
  REQ --> AL
  Q --> MATCH
  AL --> MATCH
  MATCH --> CAT
  CAT --> RENDER

  style MATCH fill:#fbbf24,color:#000
```

- Single locale matcher `matchLocale()` used by both env defaults and request-time resolution / 统一使用 `matchLocale()` 解析区域设置
- Locale persists across navigation via `withLocaleQuery()` / 区域设置通过 `withLocaleQuery()` 在导航间持续保持
- Oracle form includes hidden `lang` input for non-JS fallback / 神谕表单包含隐藏的 `lang` 输入以支持无 JS 回退

### UI State Machine / UI 状态机

```mermaid
stateDiagram-v2
  [*] --> idle : Initial / 初始
  idle --> loading : Request sent / 请求发送
  loading --> success : 200 OK
  loading --> empty : No data / 无数据
  loading --> error : Error / 错误
  error --> retryable : Transient / 暂时性
  error --> non_retryable : Fatal / 致命
  loading --> unauthorized : 401 / 403

  retryable --> loading : Retry / 重试
  success --> idle : Reset / 重置
  empty --> idle : Reset / 重置
```

---

## API Contracts / API 契约

| Endpoint / 端点 | Method / 方法 | Description / 描述 |
|---|---|---|
| `/api/health` | `GET` | Health check envelope / 健康检查信封 |
| `/api/oracle` | `POST` | Oracle query with typed schemas / 带类型模式的神谕查询 |
| `/docs` | `GET` | Swagger UI / Swagger 接口文档 |
| `/partials/oracle` | `POST` | HTMX partial for oracle panel / 神谕面板 HTMX 局部视图 |
| `/game` | `GET` | Playable game client mount / 可玩游戏客户端挂载 |

- Validation errors → `422 Unprocessable Content` typed error envelope / 验证错误 → `422` 类型化错误信封
- Framework errors are localized via `Accept-Language` / 框架错误通过 `Accept-Language` 本地化
- All responses carry `x-correlation-id` for tracing / 所有响应携带 `x-correlation-id` 用于追踪

---

## Commands / 命令

```bash
# Development / 开发
bun run dev           # Start dev watchers / 启动开发监听

# Build / 构建
bun run build:assets  # Compile Tailwind, HTMX extensions, game client / 编译资产

# Production / 生产
bun run start         # Build + start server / 构建并启动服务器

# Quality / 质量检查
bun run lint          # Biome lint / Biome 代码检查
bun run typecheck     # TypeScript strict check / TypeScript 严格检查
bun test              # Run test suite / 运行测试套件
bun run verify        # Full pipeline: build → lint → typecheck → test / 完整流水线
```

### Dev Orchestration / 开发编排

`bun run dev` orchestrates the following concurrent watchers with signal-aware cleanup and fail-fast shutdown:

`bun run dev` 编排以下并发监听器，支持信号感知清理和快速失败关闭：

```mermaid
flowchart LR
  D["bun run dev"]
  D --> A1["1. Asset Setup / 资产初始化"]
  D --> A2["2. Tailwind Watch / Tailwind 监听"]
  D --> A3["3. HTMX Ext Watch / HTMX 扩展监听"]
  D --> A4["4. Game Client Watch / 游戏客户端监听"]
  D --> A5["5. Server Watch / 服务器监听"]

  style D fill:#4ade80,color:#000
```

---

## Environment / 环境配置

Copy `.env.example` to `.env` and configure per environment.

复制 `.env.example` 为 `.env` 并按环境配置。

| Variable / 变量 | Purpose / 用途 |
|---|---|
| `PUBLIC_ASSET_PREFIX` | Base prefix for static assets / 静态资产基础前缀 |
| `PLAYABLE_GAME_MOUNT_PATH` | Game client URL mount / 游戏客户端 URL 挂载 |
| `PLAYABLE_GAME_SOURCE_DIRECTORY` | Game client build output / 游戏客户端构建输出 |
| `RMMZ_PACK_PREFIX` | RPG Maker plugin pack mount / RPG Maker 插件包挂载 |
| `API_DOCS_PATH` | Swagger docs path / Swagger 文档路径 |
| `STYLESHEET_PATH` | CSS override (optional) / CSS 覆盖（可选） |
| `HTMX_SCRIPT_PATH` | HTMX script override (optional) / HTMX 脚本覆盖（可选） |
| `IMAGES_ASSET_PREFIX` | Shared image asset mount / 共享图片资产挂载 |

Session cookie keys, oracle answer-hash multiplier, and sprite extraction config are also environment-driven.

会话 Cookie 密钥、神谕答案哈希乘数和精灵图提取配置同样由环境变量驱动。

---

## Accessibility / 无障碍

- WCAG AA minimum compliance / 最低 WCAG AA 合规
- Skip-to-content link for keyboard users / 为键盘用户提供跳转至内容链接
- `aria-current="page"` on active navigation items / 活动导航项上的 `aria-current="page"`
- Focus management for interactive elements / 交互元素的焦点管理
- All user-facing strings via i18n catalogs / 所有面向用户的字符串通过国际化目录

---

<div align="center">

## Special Thanks / 特别感谢

*This engine is dedicated to **Estrella** and **Ioanin** — the heart and inspiration behind everything this system became.*

*本引擎献给 **Estrella** 和 **Ioanin**——你们是这个系统背后的灵感与灵魂。*

```
        ·  ˚ . ·  ✦  ˚
    ˚   ·  Thank you  ·  ˚
  ✦  ·   谢谢你们    ·  ✦
    ˚   ·    🍵    ·   ˚
        ·  ˚ . ·  ✦  ˚
```

</div>

---

## License / 许可证

Private · All rights reserved.

私有 · 保留所有权利。
]]>
