# @dreamer/lifecycle

> 一个兼容 Deno、Bun 和 Node.js 的应用生命周期管理包，提供完整的应用生命周期管理功能

> [English](../../README.md) | 中文 (Chinese)

[![JSR](https://jsr.io/badges/@dreamer/lifecycle)](https://jsr.io/@dreamer/lifecycle)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../../LICENSE)
[![Tests: 82 passed](https://img.shields.io/badge/Tests-82%20passed%20(三端)-brightgreen)](./TEST_REPORT.md)

---

## 🎯 功能

应用生命周期管理包，用于管理应用的完整生命周期，包括初始化、启动、运行、停止和关闭等阶段，
兼容 Deno、Bun 与 Node.js 22+。

## ✨ 特性

- **完整的生命周期阶段管理**：
  - 定义标准的生命周期阶段（uninitialized → initialized → ready → stopped →
    shutdown）
  - 管理阶段转换和状态查询
  - 支持阶段转换验证和错误回滚

- **生命周期钩子系统**：
  - 注册生命周期钩子（on、off）
  - 支持同步和异步钩子
  - 支持多个钩子按顺序执行
  - 钩子执行错误自动回滚

- **事件系统**：
  - 自动触发生命周期事件
  - 支持自定义事件
  - 事件发布/订阅模式

- **错误处理**：
  - 钩子执行错误自动捕获
  - 阶段转换失败自动回滚
  - 详细的错误信息

- **超时控制**：
  - 可配置的钩子执行超时
  - 超时自动抛出错误

- **服务容器集成**：
  - 支持 `@dreamer/service` 依赖注入
  - 管理多个 LifecycleManager 实例
  - 提供 `createLifecycleManager` 工厂函数

## 📦 安装

### Deno

```bash
deno add jsr:@dreamer/lifecycle
```

### Bun

```bash
bunx jsr add @dreamer/lifecycle
```

### Node.js

```bash
npx jsr add @dreamer/lifecycle
```

## 🌍 环境兼容性

| 运行时   | 版本要求 | 状态                |
| -------- | -------- | ------------------- |
| Deno     | 2.9+     | ✅ 完全支持         |
| Bun      | 1.3+     | ✅ 完全支持         |
| Node.js  | 22+      | ✅ 完全支持（自 v1.1.0 起） |

- **服务端**：✅ 支持（兼容 Deno/Bun/Node，生命周期管理是服务端概念）
- **客户端**：❌ 不支持（浏览器环境，生命周期管理是服务端架构模式）

---

## 🚀 快速开始

### 基础用法

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

// 创建生命周期管理器
const lifecycle = new LifecycleManager();

// 注册初始化钩子
lifecycle.on("initializing", async () => {
  console.log("初始化中...");
  // 加载配置、注册服务等
});

// 注册启动钩子
lifecycle.on("starting", async () => {
  console.log("启动中...");
  // 初始化数据库、缓存等
});

// 注册就绪钩子
lifecycle.on("ready", async () => {
  console.log("应用已就绪");
});

// 执行生命周期
await lifecycle.initialize();
await lifecycle.start();

// 查询状态
console.log(lifecycle.getStage()); // "ready"
console.log(lifecycle.isReady()); // true

// 停止
await lifecycle.stop();
await lifecycle.shutdown();
```

### 完整生命周期示例

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

// 注册所有生命周期钩子
lifecycle.on("initializing", async () => {
  console.log("1. 初始化中...");
  // 加载配置
  // 注册核心服务
});

lifecycle.on("initialized", async () => {
  console.log("2. 初始化完成");
});

lifecycle.on("starting", async () => {
  console.log("3. 启动中...");
  // 初始化数据库连接
  // 初始化缓存连接
  // 加载插件
});

lifecycle.on("started", async () => {
  console.log("4. 启动完成");
  // 启动 HTTP 服务器
  // 启动 WebSocket 服务器
});

lifecycle.on("ready", async () => {
  console.log("5. 应用已就绪");
});

lifecycle.on("stopping", async () => {
  console.log("6. 停止中...");
  // 停止接收新请求
  // 等待正在处理的请求完成
});

lifecycle.on("stopped", async () => {
  console.log("7. 停止完成");
});

lifecycle.on("shutting-down", async () => {
  console.log("8. 关闭中...");
  // 关闭服务器
  // 关闭数据库连接
  // 关闭缓存连接
});

lifecycle.on("shutdown", async () => {
  console.log("9. 应用已关闭");
});

// 执行完整的生命周期
await lifecycle.initialize(); // 1, 2
await lifecycle.start(); // 3, 4, 5
await lifecycle.stop(); // 6, 7
await lifecycle.shutdown(); // 8, 9
```

### 事件监听

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

// 监听生命周期事件
lifecycle.addEventListener("lifecycle:initializing", (data) => {
  console.log("初始化中事件:", data);
});

lifecycle.addEventListener("lifecycle:ready", (data) => {
  console.log("就绪事件:", data);
});

// 自定义事件
lifecycle.addEventListener("custom:event", (data) => {
  console.log("自定义事件:", data);
});

// 触发自定义事件
lifecycle.emit("custom:event", { message: "Hello" });

await lifecycle.initialize();
await lifecycle.start();
```

### 错误处理

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

lifecycle.on("initializing", async () => {
  throw new Error("初始化失败");
});

try {
  await lifecycle.initialize();
} catch (error) {
  console.error("初始化失败:", error);
  // 生命周期会自动回滚到 uninitialized 阶段
  console.log(lifecycle.getStage()); // "uninitialized"
}
```

### 超时控制

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

// 配置超时时间（毫秒）
const lifecycle = new LifecycleManager({
  timeout: 5000, // 5 秒超时
});

lifecycle.on("initializing", async () => {
  // 如果这个钩子执行超过 5 秒，会抛出超时错误
  await new Promise((resolve) => setTimeout(resolve, 10000));
});

try {
  await lifecycle.initialize();
} catch (error) {
  console.error("超时错误:", error);
}
```

---

## 📚 API 文档

### LifecycleManager 类

生命周期管理器类，提供应用生命周期的管理功能。

#### 构造函数

```typescript
new LifecycleManager(options?: LifecycleManagerOptions)
```

创建一个新的生命周期管理器实例。

**参数**：

- `options?: LifecycleManagerOptions` - 配置选项
  - `autoEmitEvents?: boolean` - 是否在阶段转换时自动触发事件（默认：true）
  - `timeout?: number` -
    超时时间（毫秒），如果钩子执行超时则抛出错误（默认：0，无超时）

**示例**：

```typescript
const lifecycle = new LifecycleManager({
  autoEmitEvents: true,
  timeout: 5000,
});
```

#### 方法

##### `on(stage: LifecycleStage, hook: LifecycleHook): void`

注册生命周期钩子。

**参数**：

- `stage: LifecycleStage` - 生命周期阶段
- `hook: LifecycleHook` - 钩子函数（可以是同步或异步）

**示例**：

```typescript
lifecycle.on("initializing", async () => {
  console.log("初始化中...");
});
```

##### `off(stage: LifecycleStage, hook: LifecycleHook): void`

移除生命周期钩子。

**参数**：

- `stage: LifecycleStage` - 生命周期阶段
- `hook: LifecycleHook` - 要移除的钩子函数

**示例**：

```typescript
const hook = () => console.log("钩子");
lifecycle.on("initializing", hook);
lifecycle.off("initializing", hook);
```

##### `addEventListener(event: string, listener: LifecycleEventListener): void`

注册事件监听器。

**参数**：

- `event: string` - 事件名称
- `listener: LifecycleEventListener` - 监听器函数

**示例**：

```typescript
lifecycle.addEventListener("lifecycle:ready", (data) => {
  console.log("应用已就绪:", data);
});
```

##### `removeEventListener(event: string, listener: LifecycleEventListener): void`

移除事件监听器。

**参数**：

- `event: string` - 事件名称
- `listener: LifecycleEventListener` - 要移除的监听器函数

##### `emit(event: string, ...args: unknown[]): void`

触发事件。

**参数**：

- `event: string` - 事件名称
- `...args: unknown[]` - 事件参数

**示例**：

```typescript
lifecycle.emit("custom:event", { message: "Hello" });
```

##### `initialize(): Promise<void>`

初始化应用。将应用从 `uninitialized` 转换到 `initialized`。

**示例**：

```typescript
await lifecycle.initialize();
```

##### `start(): Promise<void>`

启动应用。将应用从 `initialized` 转换到 `ready`。

**示例**：

```typescript
await lifecycle.start();
```

##### `stop(): Promise<void>`

停止应用。将应用从 `ready` 或 `started` 转换到 `stopped`。

**示例**：

```typescript
await lifecycle.stop();
```

##### `shutdown(): Promise<void>`

关闭应用。将应用从 `stopped` 转换到 `shutdown`。

**示例**：

```typescript
await lifecycle.shutdown();
```

##### `getStage(): LifecycleStage`

获取当前生命周期阶段。

**返回**：当前阶段

**示例**：

```typescript
const stage = lifecycle.getStage(); // "ready"
```

##### `isReady(): boolean`

检查应用是否已就绪。

**返回**：是否已就绪

**示例**：

```typescript
if (lifecycle.isReady()) {
  console.log("应用已就绪");
}
```

##### `isShutdown(): boolean`

检查应用是否已关闭。

**返回**：是否已关闭

**示例**：

```typescript
if (lifecycle.isShutdown()) {
  console.log("应用已关闭");
}
```

##### `getStageDescription(): string`

获取当前阶段的中文描述。

**返回**：阶段的中文描述

**示例**：

```typescript
const description = lifecycle.getStageDescription(); // "就绪"
```

##### `reset(): void`

重置生命周期管理器。将阶段重置为 `uninitialized`，清除所有钩子和事件监听器。

**示例**：

```typescript
lifecycle.reset();
```

### 类型定义

#### LifecycleStage

生命周期阶段类型。

```typescript
type LifecycleStage =
  | "uninitialized" // 未初始化
  | "initializing" // 初始化中
  | "initialized" // 初始化完成
  | "starting" // 启动中
  | "started" // 启动完成
  | "ready" // 就绪
  | "stopping" // 停止中
  | "stopped" // 停止完成
  | "shutting-down" // 关闭中
  | "shutdown"; // 关闭完成
```

#### LifecycleHook

生命周期钩子函数类型。

```typescript
type LifecycleHook = () => void | Promise<void>;
```

#### LifecycleManagerOptions

生命周期管理器配置选项。

```typescript
interface LifecycleManagerOptions {
  autoEmitEvents?: boolean; // 是否自动触发事件（默认：true）
  timeout?: number; // 超时时间（毫秒，默认：0，无超时）
}
```

#### ServiceContainer 集成方法

##### `getName(): string`

获取管理器名称。

**返回**：管理器名称

##### `setContainer(container: ServiceContainer): void`

设置服务容器。

**参数**：

- `container: ServiceContainer` - 服务容器实例

##### `getContainer(): ServiceContainer | undefined`

获取服务容器。

**返回**：服务容器实例，如果未设置则返回 undefined

##### `static fromContainer(container: ServiceContainer, name?: string): LifecycleManager | undefined`

从服务容器获取 LifecycleManager 实例。

**参数**：

- `container: ServiceContainer` - 服务容器实例
- `name?: string` - 管理器名称（默认 "default"）

**返回**：LifecycleManager 实例，如果不存在则返回 undefined

### createLifecycleManager 工厂函数

用于服务容器注册的工厂函数。

```typescript
import {
  createLifecycleManager,
  LifecycleManager,
} from "jsr:@dreamer/lifecycle";
import { ServiceContainer } from "jsr:@dreamer/service";

const container = new ServiceContainer();

// 注册 LifecycleManager
container.registerSingleton(
  "lifecycle:app",
  () => createLifecycleManager({ name: "app" }),
);

// 获取实例
const lifecycle = container.get<LifecycleManager>("lifecycle:app");

// 或者使用静态方法
const sameLifecycle = LifecycleManager.fromContainer(container, "app");
```

### 工具函数

#### `isValidTransition(from: LifecycleStage, to: LifecycleStage): boolean`

检查阶段转换是否有效。

**参数**：

- `from: LifecycleStage` - 源阶段
- `to: LifecycleStage` - 目标阶段

**返回**：是否有效

**示例**：

```typescript
import { isValidTransition } from "@dreamer/lifecycle";

const valid = isValidTransition("uninitialized", "initializing"); // true
const invalid = isValidTransition("uninitialized", "ready"); // false
```

#### `getStageDescription(stage: LifecycleStage): string`

获取阶段的中文描述。

**参数**：

- `stage: LifecycleStage` - 生命周期阶段

**返回**：中文描述

**示例**：

```typescript
import { getStageDescription } from "@dreamer/lifecycle";

const desc = getStageDescription("ready"); // "就绪"
```

---

## 🔄 生命周期阶段

### 阶段转换流程

```
uninitialized
    ↓
initializing
    ↓
initialized
    ↓
starting
    ↓
started
    ↓
ready
    ↓
stopping
    ↓
stopped
    ↓
shutting-down
    ↓
shutdown
```

### 阶段说明

| 阶段            | 说明       | 可转换到的阶段                          |
| --------------- | ---------- | --------------------------------------- |
| `uninitialized` | 未初始化   | `initializing`                          |
| `initializing`  | 初始化中   | `initialized`, `uninitialized`（回滚）  |
| `initialized`   | 初始化完成 | `starting`, `uninitialized`（回滚）     |
| `starting`      | 启动中     | `started`, `initialized`（回滚）        |
| `started`       | 启动完成   | `ready`, `stopping`, `starting`（回滚） |
| `ready`         | 就绪       | `stopping`, `started`（回滚）           |
| `stopping`      | 停止中     | `stopped`, `ready`（回滚）              |
| `stopped`       | 停止完成   | `shutting-down`, `starting`（重新启动） |
| `shutting-down` | 关闭中     | `shutdown`, `stopped`（回滚）           |
| `shutdown`      | 已关闭     | 无（最终状态）                          |

### 生命周期事件

每个阶段转换都会自动触发对应的事件：

- `lifecycle:initializing` - 初始化中
- `lifecycle:initialized` - 初始化完成
- `lifecycle:starting` - 启动中
- `lifecycle:started` - 启动完成
- `lifecycle:ready` - 就绪
- `lifecycle:stopping` - 停止中
- `lifecycle:stopped` - 停止完成
- `lifecycle:shutting-down` - 关闭中
- `lifecycle:shutdown` - 关闭完成

---

## 💡 使用场景

### 1. 框架应用生命周期管理

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

class Application {
  private lifecycle: LifecycleManager;

  constructor() {
    this.lifecycle = new LifecycleManager();

    // 注册生命周期钩子
    this.lifecycle.on("initializing", async () => {
      await this.loadConfig();
      await this.registerServices();
    });

    this.lifecycle.on("starting", async () => {
      await this.initDatabase();
      await this.initCache();
      await this.loadPlugins();
    });

    this.lifecycle.on("started", async () => {
      await this.startHttpServer();
      await this.startWebSocketServer();
    });

    this.lifecycle.on("stopping", async () => {
      await this.stopAcceptingRequests();
      await this.waitForRequests();
    });

    this.lifecycle.on("shutting-down", async () => {
      await this.closeServers();
      await this.closeDatabase();
      await this.closeCache();
    });
  }

  async start(): Promise<void> {
    await this.lifecycle.initialize();
    await this.lifecycle.start();
  }

  async stop(): Promise<void> {
    await this.lifecycle.stop();
    await this.lifecycle.shutdown();
  }
}
```

### 2. 服务启动和关闭

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

// 启动服务
lifecycle.on("starting", async () => {
  await startDatabase();
  await startRedis();
  await startHttpServer();
});

// 关闭服务
lifecycle.on("shutting-down", async () => {
  await stopHttpServer();
  await stopRedis();
  await stopDatabase();
});

// 启动
await lifecycle.initialize();
await lifecycle.start();

// 关闭
await lifecycle.stop();
await lifecycle.shutdown();
```

### 3. 优雅关闭

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";
import { addSignalListener, exit } from "@dreamer/runtime-adapter";

const lifecycle = new LifecycleManager();

// 监听关闭信号（兼容 Deno 和 Bun）
addSignalListener("SIGINT", async () => {
  console.log("收到关闭信号，开始优雅关闭...");
  await lifecycle.stop();
  await lifecycle.shutdown();
  exit(0);
});

addSignalListener("SIGTERM", async () => {
  console.log("收到终止信号，开始优雅关闭...");
  await lifecycle.stop();
  await lifecycle.shutdown();
  exit(0);
});
```

---

## 📝 变更日志

### [1.0.2] - 2026-02-19

- **变更**：i18n 在模块加载时自动初始化，入口不再调用
  init。完整历史：[CHANGELOG](../en-US/CHANGELOG.md) |
  [中文](../zh-CN/CHANGELOG.md)

---

## 📊 测试报告

[![Tests: 82 passed](https://img.shields.io/badge/Tests-82%20passed-brightgreen)](./TEST_REPORT.md)

| 测试类别                        | 测试数 | 状态        |
| ------------------------------- | ------ | ----------- |
| LifecycleManager 核心功能       | 51     | ✅ 通过     |
| EventEmitter 事件系统           | 20     | ✅ 通过     |
| ServiceContainer 集成           | 6      | ✅ 通过     |
| createLifecycleManager 工厂函数 | 5      | ✅ 通过     |
| **总计**                        | **82** | ✅ **100%** |

详细测试报告请查看 [TEST_REPORT.md](./TEST_REPORT.md)

---

## 📝 注意事项

1. **阶段转换顺序**：必须按照正确的顺序调用生命周期方法，否则会抛出错误。

2. **错误处理**：钩子执行错误会自动回滚到上一个阶段，需要捕获错误并处理。

3. **超时控制**：如果钩子执行时间较长，建议配置超时时间，避免无限等待。

4. **事件系统**：生命周期事件是同步触发的，如果需要异步处理，请在监听器中自行处理。

5. **重置功能**：`reset()` 方法会清除所有钩子和事件监听器，谨慎使用。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

Apache License 2.0 - 详见 [LICENSE](./LICENSE)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
