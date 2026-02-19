# 变更日志

[English](../en-US/CHANGELOG.md) | 中文 (Chinese)

本文档记录 @dreamer/lifecycle 的所有重要变更。格式基于
[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循
[Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [1.0.2] - 2026-02-19

### 变更

- **i18n**：初始化改为在加载 i18n 模块时自动执行。入口文件（`mod.ts`）不再
  导入或调用 `initLifecycleI18n`；请从你的代码中移除相关用法。

---

## [1.0.1] - 2026-02-19

### 变更

- **i18n**：翻译方法由 `$t` 重命名为 `$tr`，避免与全局 `$t`
  冲突。请将现有代码中本包消息改为使用 `$tr`。
- **文档**：文档结构调整为 `docs/en-US/`（CHANGELOG、TEST_REPORT）与
  `docs/zh-CN/`（README、CHANGELOG、TEST_REPORT 全文中文）。根目录
  CHANGELOG、TEST_REPORT 已移除，根目录 README 精简并链接至 docs。
- **许可证**：在 `deno.json` 及文档中明确为 Apache-2.0。

---

## [1.0.0] - 2026-02-06

### 新增

首个稳定版。兼容 Deno 与 Bun
的应用生命周期管理库，提供完整的生命周期管理，包括阶段转换、钩子、事件与错误回滚。

#### 生命周期阶段

- 10 个标准阶段：`uninitialized` → `initializing` → `initialized` → `starting` →
  `started` → `ready` → `stopping` → `stopped` → `shutting-down` → `shutdown`
- 阶段转换校验与错误时自动回滚
- `getStage()`、`isReady()`、`isShutdown()`、`getStageDescription()`
  用于状态查询

#### LifecycleManager

- **构造**（`new LifecycleManager(options?)`）：可选用
  `autoEmitEvents`、`timeout` 创建实例
- **钩子**（`on`、`off`）：为各阶段注册与移除生命周期钩子
- **生命周期方法**：`initialize()`、`start()`、`stop()`、`shutdown()`
- **重置**（`reset()`）：重置为未初始化，清除所有钩子与监听器
- **事件系统**：`addEventListener`、`removeEventListener`、`emit`
  支持生命周期与自定义事件
- 阶段转换时自动发出 `lifecycle:*` 事件（可配置）

#### EventEmitter

- `on`、`off`、`emit` 用于事件发布/订阅
- `removeAllListeners(event?)`、`listenerCount(event)`、`eventNames()`
- 通过 Set 对监听器去重

#### ServiceContainer 集成

- `getName()`、`setContainer()`、`getContainer()`
- `static fromContainer(container, name?)` 从容器获取实例
- `createLifecycleManager(options?)` 工厂方法用于容器注册

#### 工具

- `isValidTransition(from, to)`：校验阶段转换
- `getStageDescription(stage)`：获取阶段描述
- `LIFECYCLE_STAGE_TRANSITIONS`：转换规则常量

#### 错误处理与超时

- 钩子执行错误触发自动回滚
- 可配置 `timeout` 控制钩子执行
- 支持同步与异步钩子

#### 类型导出

- `LifecycleStage`、`LifecycleHook`、`LifecycleEventListener`、`LifecycleManagerOptions`
