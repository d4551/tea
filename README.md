<div align="center">

```text
             )  (   )  (
            (   ) )   ( )
             ) ( (   ) (
          .--------------.
          |  ~   ~   ~   |          _____  _____     _
          |              |___      |_   _|| ____|   / \
          |              |__ \       | |  |  _|    / _ \
          |              |__| |      | |  | |___  / ___ \
          \              /____/      |_|  |_____|/_/   \_\
           \____________/
         .================.        Templated · Event-driven · Agentic
        '------------------'           模板化 · 事件驱动 · 智能体

                                       Game Engine · 游戏引擎
```

**服务端驱动的游戏引擎与世界构建平台**<br/>
A server-driven game engine and worldbuilding platform.

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
  - [Key Capabilities](#key-capabilities)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
  - [System Overview](#system-overview)
  - [Request Lifecycle](#request-lifecycle)
  - [Plugin Pipeline](#plugin-pipeline)
  - [Domain Model](#domain-model)
- [Project Structure](#project-structure)
- [Commands](#commands)
- [Environment](#environment)
- [API Reference](#api-reference)
- [Accessibility](#accessibility)
- [Acknowledgements](#acknowledgements)
- [中文说明](#%E4%B8%AD%E6%96%87%E8%AF%B4%E6%98%8E)

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

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Bun | 1.3 |
| Language | TypeScript (strict) | 5.9 |
| Server Framework | Elysia | 1.4 |
| Type-safe Client | Eden Treaty | 1.4 |
| SSR Enhancement | HTMX | 2.0 |
| CSS Framework | Tailwind CSS | 4.x |
| UI Components | DaisyUI | 5.x |
| ORM | Prisma + libSQL | 7.x |
| 2D Render | PixiJS | 8.x |
| 3D Render | Three.js | 0.183 |
| AI Inference | 🤗 Transformers (ONNX) | 3.8 |
| Image Ops | Sharp | 0.34 |

---

## Quick Start

```bash
# Clone
git clone https://github.com/d4551/tea.git && cd tea

# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Generate Prisma client
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
erDiagram
    GAME ||--o{ SESSION : hosts
    SESSION ||--|{ ACTOR : contains
    ACTOR ||--o{ MESSAGE : speaks
    SESSION ||--o{ MESSAGE : records
```

---

## Project Structure

```text
tea/
├── apps/                 # Future multi-app support
├── libs/                 # Shared libraries
├── packages/             # Bun workspaces
├── prisma/               # Schema and migrations
│   └── schema.prisma     # Single source of truth
├── public/               # Static web assets
├── src/                  # Server / Backend
│   ├── build/            # Asset pipeline (esbuild/bun)
│   ├── config/           # Envs and constants
│   ├── db/               # Prisma client instantiation
│   ├── domain/           # Core game logic (Game, AI, Oracle)
│   ├── plugins/          # Elysia plugins (i18n, HTMX, Error)
│   └── app.ts            # Elysia entry point
├── tests/                # bun:test suites
└── index.html            # Core HTMX template
```

---

## Commands

| Command | Description |
|---|---|
| `bun run dev` | Start development server with all watchers |
| `bun run build:assets` | One-off asset compilation |
| `bun run start` | Production: build and start |
| `bun run lint` | Biome linting |
| `bun run typecheck` | Strict TypeScript checking |
| `bun test` | Run test suite |
| `bun run verify` | Full pipeline: lint → typecheck → test |

---

## Environment

Required `.env` variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | libSQL connection string (e.g., `file:./prisma/dev.db`) |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 3000) |

---

## API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | SSR Application Entry |
| `/api/health` | GET | System metrics |
| `/api/game/:id` | GET | Game state |
| `/api/ai/chat` | POST | Oracle interaction |
| `/ws/events` | WS | Realtime game events |

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

```text
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
<summary><h2 id="中文说明">中文说明</h2></summary>

### 目录

- [概述](#概述)
  - [核心能力](#核心能力)
- [技术栈](#技术栈-1)
- [快速开始](#快速开始-1)
- [系统架构](#系统架构)
  - [系统概览](#系统概览)
  - [请求生命周期](#请求生命周期-1)
  - [插件流水线](#插件流水线-1)
  - [领域模型](#领域模型-1)
- [项目结构](#项目结构-1)
- [命令](#命令-1)
- [环境变量](#环境变量)
- [API 参考](#api-参考)
- [无障碍](#无障碍)
- [致谢](#致谢)

### 概述

TEA 游戏引擎是一个以服务端渲染 (SSR) 为核心的游戏开发平台，将服务端页面交付、实时 AI 叙事生成和浏览器原生可玩游戏客户端统一在单一运行时中。专为 **落叶王国 (LOTFK)** 策略世界构建体验而打造。

#### 核心能力

- **服务端渲染** — 所有页面由 Elysia 在服务端渲染，HTMX 提供渐进增强
- **AI 叙事引擎** — 通过 🤗 Transformers 进行设备端推理，支持 ONNX/WebGPU 加速
- **可玩游戏客户端** — PixiJS 8 画布 + Three.js 3D 层，开发期间支持热重载
- **全链路类型安全** — 从 Prisma 模式到 Elysia 路由到 Eden Treaty 客户端的端到端类型
- **国际化** — `Accept-Language` q 权重解析与确定性区域设置持久化
- **结构化可观察性** — 关联 ID 传播、分级 JSON 日志、类型化错误信封

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

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/d4551/tea.git && cd tea

# 安装依赖
bun install

# 配置环境变量
cp .env.example .env

# 生成 Prisma 客户端
bun run prisma:generate

# 启动开发服务器
bun run dev
```

### 系统架构

#### 系统概览

```mermaid
graph TB
  subgraph Browser["浏览器"]
    HTMX["HTMX"]
    PIXI["PixiJS 8 画布"]
    THREE["Three.js 层"]
    EXT["HTMX 扩展"]
  end

  subgraph Elysia["Elysia 服务器"]
    APP["app.ts"]

    subgraph Plugins["插件层"]
      RC["请求上下文"]
      I18N["国际化"]
      AIC["AI 上下文"]
      SSE["服务器发送事件"]
      ERR["错误处理"]
      GP["游戏插件"]
      SP["会话清理"]
    end

    subgraph Routes["路由层"]
      PAGE["SSR 页面"]
      API["JSON API"]
      AIR["AI 路由"]
      BLD["构建器 API"]
      GMR["游戏路由"]
    end

    subgraph Domain["领域层"]
      ORC["神谕系统"]
      GML["游戏逻辑"]
      BDS["构建器"]
      AIS["AI 服务"]
    end
  end

  subgraph Storage["数据层"]
    PRI["Prisma ORM"]
    SQL["libSQL / Turso"]
  end

  Browser -->|"HTTP / HTMX 交换"| Elysia
  APP --> Plugins --> Routes --> Domain --> Storage
  PIXI -.->|"SSE / WebSocket"| SSE
```

#### 请求生命周期

```mermaid
sequenceDiagram
  participant B as 浏览器
  participant E as Elysia
  participant RC as 请求上下文
  participant I as i18n 插件
  participant R as 路由处理
  participant D as 领域逻辑
  participant DB as Prisma

  B->>E: HTTP 请求
  E->>RC: 生成关联 ID
  RC->>I: 解析区域设置
  I->>R: 注入消息目录
  R->>D: 领域逻辑
  D->>DB: 查询 / 变更
  DB-->>D: 结果
  D-->>R: 响应
  R-->>E: SSR HTML 或 JSON
  E-->>B: 响应 + x-correlation-id
```

#### 插件流水线

```mermaid
flowchart LR
  A["请求\n上下文"] --> B["国际化\n上下文"]
  B --> C["AI\n上下文"]
  C --> D["SSE"]
  D --> E["错误\n处理"]
  E --> F["静态\n挂载"]
  F --> G["Swagger"]
  G --> H["路由"]

  style A fill:#4ade80,color:#000
  style B fill:#60a5fa,color:#000
  style C fill:#c084fc,color:#000
  style D fill:#fb923c,color:#000
  style E fill:#f87171,color:#000
  style F fill:#94a3b8,color:#000
  style G fill:#fbbf24,color:#000
  style H fill:#2dd4bf,color:#000
```

#### 领域模型

```mermaid
erDiagram
    GAME ||--o{ SESSION : 拥有
    SESSION ||--|{ ACTOR : 包含
    ACTOR ||--o{ MESSAGE : 发送
    SESSION ||--o{ MESSAGE : 记录
```

### 项目结构

```text
tea/
├── apps/                 # 未来多应用支持
├── libs/                 # 共享库
├── packages/             # Bun 工作区
├── prisma/               # 数据库模式与迁移
│   └── schema.prisma     # 唯一事实来源
├── public/               # 静态 Web 资产
├── src/                  # 服务器 / 后端
│   ├── build/            # 资产构建流水线 (esbuild/bun)
│   ├── config/           # 环境变量与常量
│   ├── db/               # Prisma 客户端实例化
│   ├── domain/           # 核心游戏逻辑 (游戏, AI, 神谕)
│   ├── plugins/          # Elysia 插件 (国际化, HTMX, 错误处理)
│   └── app.ts            # Elysia 入口点
├── tests/                # bun:test 测试套件
└── index.html            # 核心 HTMX 模板
```

### 命令

| 命令 | 说明 |
|---|---|
| `bun run dev` | 启动开发服务器 |
| `bun run build:assets` | 一次性资产编译 |
| `bun run start` | 生产环境：构建并启动 |
| `bun run lint` | Biome 代码检查 |
| `bun run typecheck` | TypeScript 严格类型检查 |
| `bun test` | 运行测试套件 |
| `bun run verify` | 完整流水线：检查 → 类型检查 → 测试 |

### 环境变量

必须的 `.env` 变量：

| 变量 | 用途 |
|---|---|
| `DATABASE_URL` | libSQL 连接字符串 (例如: `file:./prisma/dev.db`) |
| `NODE_ENV` | `development` (开发) 或 `production` (生产) |
| `PORT` | 服务器端口 (默认: 3000) |

### API 参考

| 端点 | 方法 | 用途 |
|---|---|---|
| `/` | GET | SSR 应用程序入口 |
| `/api/health` | GET | 系统指标查询 |
| `/api/game/:id` | GET | 获取游戏状态 |
| `/api/ai/chat` | POST | 神谕 AI 交互 |
| `/ws/events` | WS | 实时游戏事件流 |

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
