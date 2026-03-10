# 运维 Runbook（日常操作与故障响应）

用于仓库启动、验收和生产化排障的统一手册。

## 1) 环境前置

- 安装 Bun 且满足项目约束版本。
- 数据库可达（SQLite/配置的数据库 URL）。
- 资源构建工具可用，输出目录可写。
- 启用本地模型时，AI 运行文件齐备。

## 2) 启动基线

```mermaid
flowchart LR
  S1["bun install"]
  S2["bun run setup"]
  S3["bun run doctor"]
  S4["bun run build:assets"]
  S5["bun run verify"]
  S6["bun run dev"]
  S1 --> S2 --> S3 --> S4 --> S5 --> S6
```

## 3) 命令矩阵

| 命令 | 目的 | 预期结果 |
| --- | --- | --- |
| `bun run setup` | 首次初始化 | 环境、数据库、资产、就绪检查 |
| `bun run doctor` | 结构化就绪 | 依赖与文件系统健康状态 |
| `bun run build:assets` | 重建静态/客户端资源 | 更新 `public/` 输出 |
| `bun run docs:check` | 文档档案校验 | 所需 archive key 完整 |
| `bun run lint` | 风格与边界检查 | 规则通过 |
| `bun run typecheck` | TS 接口与边界 | 严格校验通过 |
| `bun test` | 业务契约与路由测试 | 全绿 |
| `bun run verify` | 全量预合并门禁 | 所有检查通过 |
| `bun run dependency:drift` | 依赖漂移检查 | 无异常 |
| `bun run start` | 生产形态启动 | 路由可达 |

## 4) verify 流

```mermaid
stateDiagram-v2
  [*] --> docs
  docs --> assets
  assets --> lint
  lint --> typecheck
  typecheck --> test
  test --> drift
  drift --> ok: 所有通过
  ok --> [*]
  docs --> blocked
  lint --> blocked
  typecheck --> blocked
  test --> blocked
  drift --> blocked
  blocked --> recover
  recover --> docs
```

## 5) 故障应对

### 5.1 发布被阻塞

1. 打开项目诊断视图。
2. 查看发布校验报告。
3. 修复缺失场景、对话、资源引用。
4. 重新执行 publish。
5. 确认 `publishedReleaseVersion` 更新，并且 `/game` 使用发布快照。

### 5.2 会话无法启动

1. 检查 `/game` 是否注入合法 bootstrap payload。
2. 确认项目已发布，快照存在。
3. 检查 `/api/game/session` 是否返回 session + token。
4. 校验 WS 与 HUD 订阅使用同一 session id。
5. 断线后立即测试 `resumeToken` 恢复。

### 5.3 UI 回归（busy/focus/validation）

1. 确认 `layout-controls`/`focus-panel` 初始化。
2. 确认路由仍返回信封化响应与正确状态码。
3. 检查是否出现重复页面级监听器。
4. 复现 `hx-target/hx-swap`，观察焦点目标。

### 5.4 AI 失败

1. 检查 `/api/ai/status` 与 `/api/ai/health`。
2. 核查 provider/模型文件和 warmup。
3. 检视 circuit 状态日志。
4. 必要时切换 fallback 并回归测试。

### 5.5 文档或 manifest 漂移

1. 运行 `bun run docs:check`。
2. 检查 `notes/doc-archive/index.json` 与链接完整性。
3. 文档变更后同步更新 index 与归档映射。

## 6) 日志与关联追踪

- 主要失败必须包含 `correlationId`。
- 发布、命令、恢复流程记录 owner 与 outcome。
- 使用结构化日志，不保留 ad-hoc print。

## 7) 每日与每周检查

- 日常：
  - `bun run doctor`
  - `bun run dev`（活动期）
  - 关键改动后 `bun run verify`
- 周度：
  - `bun run dependency:drift`
  - `bun run docs:check`
  - 关键用例 smoke 回归
