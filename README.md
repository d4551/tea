<div align="center">

```

        ) )  )
       ( ( (          ╔════════════════════════════════════════════╗
    ┌───────────┐     ║                                            ║
    │  ~~~~~~~  │     ║   ████████╗███████╗ █████╗                 ║
    │  ~ 茶 ~  │     ║   ╚══██╔══╝██╔════╝██╔══██╗                ║
    │  ~~~~~~~  │╗    ║      ██║   █████╗  ███████║                ║
    │           ││    ║      ██║   ██╔══╝  ██╔══██║                ║
    └───────────┘│    ║      ██║   ███████╗██║  ██║                ║
     └───────────┘    ║      ╚═╝   ╚══════╝╚═╝  ╚═╝               ║
    ═══════════════   ║                                            ║
                      ║   Templated · Event-driven · Agentic       ║
                      ║   模板化     · 事件驱动     · 智能体        ║
                      ║                                            ║
                      ║   Game Engine  ·  游戏引擎                  ║
                      ╚════════════════════════════════════════════╝

```

# 🍵 TEA Game Engine

### **T**emplated · **E**vent-driven · **A**gentic

A server-driven game engine and worldbuilding platform.<br/>服务端驱动的游戏引擎与世界构建平台。

[![Bun](https://img.shields.io/badge/Bun-1.3-f9f1e1?logo=bun&logoColor=f9f1e1&labelColor=14151a)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white&labelColor=14151a)](https://www.typescriptlang.org)
[![Elysia](https://img.shields.io/badge/Elysia-1.4-a855f7?labelColor=14151a)](https://elysiajs.com)
[![HTMX](https://img.shields.io/badge/HTMX-2.0-3366cc?labelColor=14151a)](https://htmx.org)
[![PixiJS](https://img.shields.io/badge/PixiJS-8-e72264?logo=pixi.js&logoColor=white&labelColor=14151a)](https://pixijs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=white&labelColor=14151a)](https://www.prisma.io)

[English](#overview)&ensp;·&ensp;[中文说明](#中文说明)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Commands](#commands)
- [Environment](#environment)
- [API Reference](#api-reference)
- [Acknowledgements](#acknowledgements)
- [中文说明](#中文说明)

---

## Overview

TEA Game Engine is an SSR-first game development platform that unifies server-rendered pages, real-time AI narrative generation, and a browser-native playable game client into a single runtime. Built for **Leaves of the Fallen Kingdom (LOTFK)** — a strategy worldbuilding experience.

### Key Capabilities

- **Server-Side Rendering** — all pages render on the server via Elysia; HTMX provides progressive enhancement
- **AI Narrative Engine** — on-device inference via 🤗 Transformers with ONNX/WebGPU acceleration
- **Playable Game Client** — PixiJS 8 canvas with Three.js 3D layer, bundled and hot-reloaded during development
- **Type-Safe Stack** — end-to-end types from Prisma schema through Elysia routes to Eden Treaty client
- **Internationalization** — `Accept-Language` q-weight parsing with deterministic locale persistence
- **Structured Observability** — correlation ID propagation, levelled JSON logging, typed error envelopes

---

## Quick Start

```bash
# Clone
git clone https://github.com/d4551/tea.git && cd tea

# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Generate Prisma client (Prisma 7 reads DATABASE_URL from prisma.config.ts)
bun run prisma:generate

# Start development (launches all watchers)
bun run dev
```

---

## Architecture

### System Overview

```mermaid
graph TB
  subgraph Browser["Browser"]
    HTMX["HTMX"]
    PIXI["PixiJS 8 Canvas"]
    THREE["Three.js Layer"]
    EXT["HTMX Extensions"]
  end

  subgraph Elysia["Elysia Server"]
    APP["app.ts"]

    subgraph Plugins
      RC["Request Context"]
      I18N["i18n Context"]
      AIC["AI Context"]
      SSE["SSE"]
      ERR["Error Handler"]
      GP["Game Plugin"]
      SP["Session Purge"]
    end

    subgraph Routes
      PAGE["SSR Pages"]
      API["JSON API"]
      AIR["AI Routes"]
      BLD["Builder API"]
      GMR["Game Routes"]
    end

    subgraph Domain
      ORC["Oracle"]
      GML["Game Logic"]
      BDS["Builder"]
      AIS["AI Service"]
    end
  end

  subgraph Storage["Data"]
    PRI["Prisma ORM"]
    SQL["libSQL / Turso"]
  end

  Browser -->|"HTTP / HTMX Swaps"| Elysia
  APP --> Plugins --> Routes --> Domain --> Storage
  PIXI -.->|"SSE / WebSocket"| SSE
```

### Request Lifecycle

Every inbound request flows through the plugin chain before reaching a route handler:

```mermaid
sequenceDiagram
  participant B as Browser
  participant E as Elysia
  participant RC as Request Context
  participant I as i18n Plugin
  participant R as Route Handler
  participant D as Domain
  participant DB as Prisma

  B->>E: HTTP Request
  E->>RC: Generate correlation ID
  RC->>I: Resolve locale (query + Accept-Language)
  I->>R: Inject message catalog
  R->>D: Domain logic
  D->>DB: Query / Mutation
  DB-->>D: Result
  D-->>R: Response
  R-->>E: SSR HTML or JSON
  E-->>B: Response + x-correlation-id
```

### Plugin Pipeline

Plugins are composed in strict order. Each plugin decorates the request context for downstream consumers:

```mermaid
flowchart LR
  A["Request\nContext"] --> B["i18n\nContext"]
  B --> C["AI\nContext"]
  C --> D["SSE"]
  D --> E["Error\nHandler"]
  E --> F["Static\nMounts"]
  F --> G["Swagger"]
  G --> H["Routes"]

  style A fill:#4ade80,color:#000
  style B fill:#60a5fa,color:#000
  style C fill:#c084fc,color:#000
  style D fill:#fb923c,color:#000
  style E fill:#f87171,color:#000
  style F fill:#94a3b8,color:#000
  style G fill:#fbbf24,color:#000
  style H fill:#2dd4bf,color:#000
```

### Domain Model

```mermaid
graph LR
  subgraph Core["Domain Layer"]
    direction TB
    O["🔮 Oracle\nNarrative AI"]
    G["🎮 Game\nState & Scenes"]
    B["🏗️ Builder\nProject CRUD"]
    AI["🤖 AI\nInference"]
  end

  subgraph Pkg["Workspace Packages"]
    C["lotfk-game-contracts"]
    P["lotfk-seeded-prng"]
  end

  G --> C
  G --> P
  O --> AI

  style O fill:#c084fc,color:#000
  style G fill:#4ade80,color:#000
  style B fill:#60a5fa,color:#000
  style AI fill:#fb923c,color:#000
```

### Dev Pipeline

`bun run dev` orchestrates concurrent watchers with signal-aware cleanup and fail-fast shutdown:

```mermaid
flowchart TD
  DEV["bun run dev"]

  DEV --> S["Asset Setup"]
  DEV --> TW["Tailwind Watcher"]
  DEV --> HX["HTMX Ext Watcher"]
  DEV --> GC["Game Client Watcher"]
  DEV --> SRV["Server Watcher"]

  S --> PUB["public/"]
  TW --> PUB
  HX --> PUB
  GC --> GAME["public/game/"]
  SRV --> LIVE["Live Server"]
  FAIL["Fail-Fast Monitor"] -.-> DEV

  style DEV fill:#4ade80,color:#000
  style FAIL fill:#f87171,color:#000
```

### UI State Machine

All interactive panels follow a deterministic state model:

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading : Request sent
  loading --> success : 200 OK
  loading --> empty : No data
  loading --> error : Error
  loading --> unauthorized : 401/403
  error --> retryable : Transient
  error --> non_retryable : Fatal
  retryable --> loading : Retry
  success --> idle : Reset
  empty --> idle : Reset
```

---

## Project Structure

```
tea/
├── src/
│   ├── app.ts                 # Plugin + route composition
│   ├── server.ts              # Boot entry
│   ├── config/                # Typed environment config
│   ├── domain/
│   │   ├── ai/               # AI inference pipeline
│   │   ├── builder/          # Project builder service
│   │   ├── game/             # Game state, scenes, progression
│   │   └── oracle/           # Oracle narrative engine
│   ├── htmx-extensions/      # Custom HTMX extensions
│   ├── lib/                  # Logger, error envelope, correlation ID
│   ├── playable-game/        # Browser game client (PixiJS + Three.js)
│   ├── plugins/              # Elysia plugins
│   ├── routes/               # SSR pages, JSON API, HTMX partials
│   ├── shared/               # Constants, i18n, contracts, utils
│   ├── styles/               # Tailwind CSS + DaisyUI theme
│   └── views/                # SSR HTML templates
├── packages/
│   ├── lotfk-game-contracts/ # Shared type-safe game schemas
│   └── lotfk-seeded-prng/    # Deterministic PRNG
├── prisma/                   # Schema + migrations
├── scripts/                  # Build, dev orchestrator, sprite processing
├── public/                   # Compiled static assets
├── tests/                    # API contract + config tests
└── LOTFK_RMMZ_Agentic_Pack/  # RPG Maker MZ plugin pack
```

---

## Commands

| Command | Description |
|---|---|
| `bun run dev` | Start all dev watchers (CSS, HTMX, game client, server) |
| `bun run build:assets` | One-shot asset compilation |
| `bun run start` | Production: build + start |
| `bun run lint` | Biome lint |
| `bun run typecheck` | TypeScript strict check |
| `bun test` | Run test suite |
| `bun run verify` | Full pipeline: build → lint → typecheck → test |
| `bun run prisma:generate` | Regenerate Prisma client |
| `bunx prisma db push` | Sync local schema changes using Prisma 7 datasource config |

---

## Environment

Copy `.env.example` → `.env` and configure:

| Variable | Description |
|---|---|
| `PUBLIC_ASSET_PREFIX` | Base URL prefix for static assets |
| `PLAYABLE_GAME_MOUNT_PATH` | URL path for game client (default: `/game`) |
| `PLAYABLE_GAME_SOURCE_DIRECTORY` | Game client build output directory |
| `RMMZ_PACK_PREFIX` | RPG Maker plugin pack mount (default: `/rmmz-pack`) |
| `API_DOCS_PATH` | Swagger docs path (default: `/docs`) |
| `IMAGES_ASSET_PREFIX` | Shared image asset mount |
| `STYLESHEET_PATH` | Optional CSS path override |
| `HTMX_SCRIPT_PATH` | Optional HTMX script path override |

Session cookie keys, oracle hash multiplier, and sprite extraction thresholds are also environment-driven.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check |
| `/api/oracle` | `POST` | Oracle query (typed request/response) |
| `/partials/oracle` | `POST` | HTMX partial for oracle panel |
| `/game` | `GET` | Playable game client |
| `/docs` | `GET` | Swagger UI |

- Validation errors return `422` with typed error envelopes
- Framework errors are localized via `Accept-Language`
- All responses include `x-correlation-id` for distributed tracing

---

## Accessibility

- WCAG AA minimum
- Skip-to-content link for keyboard navigation
- `aria-current="page"` on active nav items
- Focus management on all interactive elements
- All user-facing text via i18n message catalogs

---

## Acknowledgements

<div align="center">

```
    ·  ˚ . ·  ✦  ˚
  ˚  · Thank you ·  ˚
  ✦  ·  谢谢你们  ·  ✦
    ˚  ·    🍵   ·  ˚
    ·  ˚ . ·  ✦  ˚
```

*Dedicated to **Estrella** and **Ioanin** — the heart and inspiration behind this engine.*

</div>

---

<details>
<summary><h2>中文说明</h2></summary>

### 概述

TEA 游戏引擎是一个以服务端渲染 (SSR) 为核心的游戏开发平台，将服务端页面交付、实时 AI 叙事生成和浏览器原生可玩游戏客户端统一在单一运行时中。专为 **落叶王国 (LOTFK)** 策略世界构建体验而打造。

### 核心能力

- **服务端渲染** — 所有页面由 Elysia 在服务端渲染，HTMX 提供渐进增强
- **AI 叙事引擎** — 通过 🤗 Transformers 进行设备端推理，支持 ONNX/WebGPU 加速
- **可玩游戏客户端** — PixiJS 8 画布 + Three.js 3D 层，开发期间支持热重载
- **全链路类型安全** — 从 Prisma 模式到 Elysia 路由到 Eden Treaty 客户端的端到端类型
- **国际化** — `Accept-Language` q 权重解析与确定性区域设置持久化
- **结构化可观察性** — 关联 ID 传播、分级 JSON 日志、类型化错误信封

### 快速开始

```bash
git clone https://github.com/d4551/tea.git && cd tea
bun install
cp .env.example .env
bun run prisma:generate
bun run dev
```

### 技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| 运行时 | Bun | 1.3 |
| 语言 | TypeScript (strict) | 5.9 |
| 服务端框架 | Elysia | 1.4 |
| 类型安全客户端 | Eden Treaty | 1.4 |
| SSR 增强 | HTMX | 2.0 |
| CSS 框架 | Tailwind CSS | 4.x |
| UI 组件库 | DaisyUI | 5.x |
| ORM | Prisma + libSQL | 7.x |
| 2D 渲染 | PixiJS | 8.x |
| 3D 渲染 | Three.js | 0.183 |
| AI 推理 | 🤗 Transformers (ONNX) | 3.8 |
| 图像处理 | Sharp | 0.34 |

### 系统架构

```mermaid
graph TB
  subgraph 浏览器
    A["HTMX"]
    B["PixiJS 画布"]
    C["Three.js 层"]
  end

  subgraph 服务器["Elysia 服务器"]
    subgraph 插件层
      D["请求上下文"]
      E["国际化"]
      F["AI 上下文"]
      G["错误处理"]
    end

    subgraph 路由层
      H["SSR 页面"]
      I["JSON API"]
      J["游戏路由"]
    end

    subgraph 领域层
      K["神谕系统"]
      L["游戏逻辑"]
      M["AI 服务"]
    end
  end

  subgraph 数据层
    N["Prisma + libSQL"]
  end

  浏览器 -->|"HTTP / HTMX"| 服务器
  插件层 --> 路由层 --> 领域层 --> 数据层
```

### 请求生命周期

```mermaid
sequenceDiagram
  participant 浏览器
  participant 服务器 as Elysia
  participant 上下文 as 请求上下文
  participant 国际化 as i18n 插件
  participant 路由 as 路由处理
  participant 领域 as 领域服务
  participant 数据库 as Prisma

  浏览器->>服务器: HTTP 请求
  服务器->>上下文: 生成关联 ID
  上下文->>国际化: 解析区域设置
  国际化->>路由: 注入消息目录
  路由->>领域: 执行领域逻辑
  领域->>数据库: 查询 / 变更
  数据库-->>领域: 结果
  领域-->>路由: 领域响应
  路由-->>服务器: HTML 或 JSON
  服务器-->>浏览器: 响应 + x-correlation-id
```

### 命令

| 命令 | 说明 |
|---|---|
| `bun run dev` | 启动所有开发监听器 |
| `bun run build:assets` | 一次性资产编译 |
| `bun run start` | 生产环境：构建并启动 |
| `bun run lint` | Biome 代码检查 |
| `bun run typecheck` | TypeScript 严格类型检查 |
| `bun test` | 运行测试套件 |
| `bun run verify` | 完整流水线：构建 → 检查 → 类型检查 → 测试 |

### 无障碍

- 最低 WCAG AA 合规
- 键盘用户跳转至内容链接
- 活动导航项 `aria-current="page"`
- 交互元素焦点管理
- 所有面向用户文本通过国际化目录管理

### 致谢

*本引擎献给 **Estrella** 和 **Ioanin** — 你们是这一切背后的灵感与灵魂。* 🍵

</details>

---

## License

Private · All rights reserved.
