# @dreamer/lifecycle

> An application lifecycle management library compatible with Deno, Bun and
> Node.js, providing full lifecycle management (initialization, start, run,
> stop, and shutdown).

> [English](./README.md) (root) | [中文 (Chinese)](./docs/zh-CN/README.md)

[![JSR](https://jsr.io/badges/@dreamer/lifecycle)](https://jsr.io/@dreamer/lifecycle)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Tests: 82 passed](https://img.shields.io/badge/Tests-82%20passed%20(3%20runtimes)-brightgreen)](./docs/en-US/TEST_REPORT.md)

---

## 📝 Changelog

### [1.1.0] - 2026-07-23

- **Added**: Node.js 22+ compatibility; three-runtime CI (Deno/Bun/Node).
  [Changelog](./docs/en-US/CHANGELOG.md) |
  [中文](./docs/zh-CN/CHANGELOG.md)

---

## 🎯 Overview

Application lifecycle management library for managing the full application
lifecycle, including stages such as initialization, start, run, stop, and
shutdown.

## ✨ Features

- **Full lifecycle stage management**:
  - Standard lifecycle stages (uninitialized → initialized → ready → stopped →
    shutdown)
  - Stage transition and state query
  - Stage transition validation and error rollback

- **Lifecycle hook system**:
  - Register lifecycle hooks (on, off)
  - Sync and async hooks
  - Multiple hooks executed in order
  - Automatic rollback on hook error

- **Event system**:
  - Automatic lifecycle event emission
  - Custom events
  - Event pub/sub pattern

- **Error handling**:
  - Automatic capture of hook execution errors
  - Automatic rollback on failed stage transition
  - Detailed error information

- **Timeout control**:
  - Configurable hook execution timeout
  - Timeout triggers error

- **Service container integration**:
  - Integration with `@dreamer/service` dependency injection
  - Manage multiple LifecycleManager instances
  - `createLifecycleManager` factory function

## 📦 Installation

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

## 🌍 Environment compatibility

| Runtime  | Version | Status      |
| -------- | ------- | ----------- |
| Deno     | 2.9+    | ✅ Supported |
| Bun      | 1.3+    | ✅ Supported |
| Node.js  | 22+     | ✅ Supported (since v1.1.0) |

- **Server**: ✅ Supported (Deno/Bun/Node; lifecycle is a server-side concept)
- **Client**: ❌ Not supported (browser environment; lifecycle is a server-side
  pattern)

---

## 🚀 Quick start

### Basic usage

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

// Create lifecycle manager
const lifecycle = new LifecycleManager();

// Register initialization hook
lifecycle.on("initializing", async () => {
  console.log("Initializing...");
  // Load config, register services, etc.
});

// Register start hook
lifecycle.on("starting", async () => {
  console.log("Starting...");
  // Initialize database, cache, etc.
});

// Register ready hook
lifecycle.on("ready", async () => {
  console.log("Application ready");
});

// Run lifecycle
await lifecycle.initialize();
await lifecycle.start();

// Query state
console.log(lifecycle.getStage()); // "ready"
console.log(lifecycle.isReady()); // true

// Stop
await lifecycle.stop();
await lifecycle.shutdown();
```

### Full lifecycle example

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

// Register all lifecycle hooks
lifecycle.on("initializing", async () => {
  console.log("1. Initializing...");
  // Load config
  // Register core services
});

lifecycle.on("initialized", async () => {
  console.log("2. Initialized");
});

lifecycle.on("starting", async () => {
  console.log("3. Starting...");
  // Initialize database connection
  // Initialize cache connection
  // Load plugins
});

lifecycle.on("started", async () => {
  console.log("4. Started");
  // Start HTTP server
  // Start WebSocket server
});

lifecycle.on("ready", async () => {
  console.log("5. Application ready");
});

lifecycle.on("stopping", async () => {
  console.log("6. Stopping...");
  // Stop accepting new requests
  // Wait for in-flight requests to finish
});

lifecycle.on("stopped", async () => {
  console.log("7. Stopped");
});

lifecycle.on("shutting-down", async () => {
  console.log("8. Shutting down...");
  // Close servers
  // Close database connection
  // Close cache connection
});

lifecycle.on("shutdown", async () => {
  console.log("9. Application shut down");
});

// Run full lifecycle
await lifecycle.initialize(); // 1, 2
await lifecycle.start(); // 3, 4, 5
await lifecycle.stop(); // 6, 7
await lifecycle.shutdown(); // 8, 9
```

### Event listening

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

// Listen to lifecycle events
lifecycle.addEventListener("lifecycle:initializing", (data) => {
  console.log("Initializing event:", data);
});

lifecycle.addEventListener("lifecycle:ready", (data) => {
  console.log("Ready event:", data);
});

// Custom events
lifecycle.addEventListener("custom:event", (data) => {
  console.log("Custom event:", data);
});

// Emit custom event
lifecycle.emit("custom:event", { message: "Hello" });

await lifecycle.initialize();
await lifecycle.start();
```

### Error handling

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

lifecycle.on("initializing", async () => {
  throw new Error("Initialization failed");
});

try {
  await lifecycle.initialize();
} catch (error) {
  console.error("Initialization failed:", error);
  // Lifecycle automatically rolls back to uninitialized
  console.log(lifecycle.getStage()); // "uninitialized"
}
```

### Timeout control

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

// Configure timeout (milliseconds)
const lifecycle = new LifecycleManager({
  timeout: 5000, // 5 second timeout
});

lifecycle.on("initializing", async () => {
  // If this hook runs longer than 5 seconds, a timeout error is thrown
  await new Promise((resolve) => setTimeout(resolve, 10000));
});

try {
  await lifecycle.initialize();
} catch (error) {
  console.error("Timeout error:", error);
}
```

---

## 📚 API documentation

### LifecycleManager class

Lifecycle manager class; provides application lifecycle management.

#### Constructor

```typescript
new LifecycleManager(options?: LifecycleManagerOptions)
```

Creates a new lifecycle manager instance.

**Parameters**:

- `options?: LifecycleManagerOptions` — Configuration
  - `autoEmitEvents?: boolean` — Whether to emit events on stage transition
    (default: true)
  - `timeout?: number` — Timeout in ms; hook execution exceeding this throws
    (default: 0, no timeout)

**Example**:

```typescript
const lifecycle = new LifecycleManager({
  autoEmitEvents: true,
  timeout: 5000,
});
```

#### Methods

##### `on(stage: LifecycleStage, hook: LifecycleHook): void`

Register a lifecycle hook.

**Parameters**:

- `stage: LifecycleStage` — Lifecycle stage
- `hook: LifecycleHook` — Hook function (sync or async)

**Example**:

```typescript
lifecycle.on("initializing", async () => {
  console.log("Initializing...");
});
```

##### `off(stage: LifecycleStage, hook: LifecycleHook): void`

Remove a lifecycle hook.

**Parameters**:

- `stage: LifecycleStage` — Lifecycle stage
- `hook: LifecycleHook` — Hook function to remove

**Example**:

```typescript
const hook = () => console.log("Hook");
lifecycle.on("initializing", hook);
lifecycle.off("initializing", hook);
```

##### `addEventListener(event: string, listener: LifecycleEventListener): void`

Register an event listener.

**Parameters**:

- `event: string` — Event name
- `listener: LifecycleEventListener` — Listener function

**Example**:

```typescript
lifecycle.addEventListener("lifecycle:ready", (data) => {
  console.log("Application ready:", data);
});
```

##### `removeEventListener(event: string, listener: LifecycleEventListener): void`

Remove an event listener.

**Parameters**:

- `event: string` — Event name
- `listener: LifecycleEventListener` — Listener function to remove

##### `emit(event: string, ...args: unknown[]): void`

Emit an event.

**Parameters**:

- `event: string` — Event name
- `...args: unknown[]` — Event arguments

**Example**:

```typescript
lifecycle.emit("custom:event", { message: "Hello" });
```

##### `initialize(): Promise<void>`

Initialize the application. Transitions from `uninitialized` to `initialized`.

**Example**:

```typescript
await lifecycle.initialize();
```

##### `start(): Promise<void>`

Start the application. Transitions from `initialized` to `ready`.

**Example**:

```typescript
await lifecycle.start();
```

##### `stop(): Promise<void>`

Stop the application. Transitions from `ready` or `started` to `stopped`.

**Example**:

```typescript
await lifecycle.stop();
```

##### `shutdown(): Promise<void>`

Shut down the application. Transitions from `stopped` to `shutdown`.

**Example**:

```typescript
await lifecycle.shutdown();
```

##### `getStage(): LifecycleStage`

Get the current lifecycle stage.

**Returns**: Current stage

**Example**:

```typescript
const stage = lifecycle.getStage(); // "ready"
```

##### `isReady(): boolean`

Check whether the application is ready.

**Returns**: Whether ready

**Example**:

```typescript
if (lifecycle.isReady()) {
  console.log("Application ready");
}
```

##### `isShutdown(): boolean`

Check whether the application is shut down.

**Returns**: Whether shut down

**Example**:

```typescript
if (lifecycle.isShutdown()) {
  console.log("Application shut down");
}
```

##### `getStageDescription(): string`

Get a human-readable description of the current stage (locale-aware).

**Returns**: Description of the current stage

**Example**:

```typescript
const description = lifecycle.getStageDescription(); // e.g. "Ready"
```

##### `reset(): void`

Reset the lifecycle manager. Resets stage to `uninitialized` and clears all
hooks and event listeners.

**Example**:

```typescript
lifecycle.reset();
```

### Type definitions

#### LifecycleStage

Lifecycle stage type.

```typescript
type LifecycleStage =
  | "uninitialized" // Not initialized
  | "initializing" // Initializing
  | "initialized" // Initialized
  | "starting" // Starting
  | "started" // Started
  | "ready" // Ready
  | "stopping" // Stopping
  | "stopped" // Stopped
  | "shutting-down" // Shutting down
  | "shutdown"; // Shut down
```

#### LifecycleHook

Lifecycle hook function type.

```typescript
type LifecycleHook = () => void | Promise<void>;
```

#### LifecycleManagerOptions

Lifecycle manager configuration.

```typescript
interface LifecycleManagerOptions {
  autoEmitEvents?: boolean; // Emit events automatically (default: true)
  timeout?: number; // Timeout in ms (default: 0, no timeout)
}
```

#### ServiceContainer integration methods

##### `getName(): string`

Get the manager name.

**Returns**: Manager name

##### `setContainer(container: ServiceContainer): void`

Set the service container.

**Parameters**:

- `container: ServiceContainer` — Service container instance

##### `getContainer(): ServiceContainer | undefined`

Get the service container.

**Returns**: Service container instance, or undefined if not set

##### `static fromContainer(container: ServiceContainer, name?: string): LifecycleManager | undefined`

Get a LifecycleManager instance from the service container.

**Parameters**:

- `container: ServiceContainer` — Service container instance
- `name?: string` — Manager name (default "default")

**Returns**: LifecycleManager instance, or undefined if not found

### createLifecycleManager factory

Factory for registering with the service container.

```typescript
import {
  createLifecycleManager,
  LifecycleManager,
} from "jsr:@dreamer/lifecycle";
import { ServiceContainer } from "jsr:@dreamer/service";

const container = new ServiceContainer();

// Register LifecycleManager
container.registerSingleton(
  "lifecycle:app",
  () => createLifecycleManager({ name: "app" }),
);

// Get instance
const lifecycle = container.get<LifecycleManager>("lifecycle:app");

// Or use static method
const sameLifecycle = LifecycleManager.fromContainer(container, "app");
```

### Utility functions

#### `isValidTransition(from: LifecycleStage, to: LifecycleStage): boolean`

Check whether a stage transition is valid.

**Parameters**:

- `from: LifecycleStage` — Source stage
- `to: LifecycleStage` — Target stage

**Returns**: Whether valid

**Example**:

```typescript
import { isValidTransition } from "@dreamer/lifecycle";

const valid = isValidTransition("uninitialized", "initializing"); // true
const invalid = isValidTransition("uninitialized", "ready"); // false
```

#### `getStageDescription(stage: LifecycleStage): string`

Get a human-readable description for the given stage (locale-aware).

**Parameters**:

- `stage: LifecycleStage` — Lifecycle stage

**Returns**: Description string

**Example**:

```typescript
import { getStageDescription } from "@dreamer/lifecycle";

const desc = getStageDescription("ready"); // e.g. "Ready"
```

---

## 🔄 Lifecycle stages

### Stage transition flow

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

### Stage reference

| Stage           | Description     | Allowed transitions                        |
| --------------- | --------------- | ------------------------------------------ |
| `uninitialized` | Not initialized | `initializing`                             |
| `initializing`  | Initializing    | `initialized`, `uninitialized` (rollback)  |
| `initialized`   | Initialized     | `starting`, `uninitialized` (rollback)     |
| `starting`      | Starting        | `started`, `initialized` (rollback)        |
| `started`       | Started         | `ready`, `stopping`, `starting` (rollback) |
| `ready`         | Ready           | `stopping`, `started` (rollback)           |
| `stopping`      | Stopping        | `stopped`, `ready` (rollback)              |
| `stopped`       | Stopped         | `shutting-down`, `starting` (restart)      |
| `shutting-down` | Shutting down   | `shutdown`, `stopped` (rollback)           |
| `shutdown`      | Shut down       | None (final state)                         |

### Lifecycle events

Each stage transition automatically emits the corresponding event:

- `lifecycle:initializing` — Initializing
- `lifecycle:initialized` — Initialized
- `lifecycle:starting` — Starting
- `lifecycle:started` — Started
- `lifecycle:ready` — Ready
- `lifecycle:stopping` — Stopping
- `lifecycle:stopped` — Stopped
- `lifecycle:shutting-down` — Shutting down
- `lifecycle:shutdown` — Shut down

---

## 💡 Use cases

### 1. Framework application lifecycle

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

class Application {
  private lifecycle: LifecycleManager;

  constructor() {
    this.lifecycle = new LifecycleManager();

    // Register lifecycle hooks
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

### 2. Service startup and shutdown

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

const lifecycle = new LifecycleManager();

// Start services
lifecycle.on("starting", async () => {
  await startDatabase();
  await startRedis();
  await startHttpServer();
});

// Shut down services
lifecycle.on("shutting-down", async () => {
  await stopHttpServer();
  await stopRedis();
  await stopDatabase();
});

// Start
await lifecycle.initialize();
await lifecycle.start();

// Shut down
await lifecycle.stop();
await lifecycle.shutdown();
```

### 3. Graceful shutdown

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";
import { addSignalListener, exit } from "@dreamer/runtime-adapter";

const lifecycle = new LifecycleManager();

// Listen for shutdown signals (Deno and Bun compatible)
addSignalListener("SIGINT", async () => {
  console.log("Shutdown signal received, starting graceful shutdown...");
  await lifecycle.stop();
  await lifecycle.shutdown();
  exit(0);
});

addSignalListener("SIGTERM", async () => {
  console.log("Termination signal received, starting graceful shutdown...");
  await lifecycle.stop();
  await lifecycle.shutdown();
  exit(0);
});
```

---

## 📊 Test report

[![Tests: 82 passed](https://img.shields.io/badge/Tests-82%20passed-brightgreen)](./docs/en-US/TEST_REPORT.md)

| Category                       | Count  | Status      |
| ------------------------------ | ------ | ----------- |
| LifecycleManager core          | 51     | ✅ Pass     |
| EventEmitter events            | 20     | ✅ Pass     |
| ServiceContainer integration   | 6      | ✅ Pass     |
| createLifecycleManager factory | 5      | ✅ Pass     |
| **Total**                      | **82** | ✅ **100%** |

Full test report: [TEST_REPORT.md](./docs/en-US/TEST_REPORT.md).

---

## 📝 Notes

1. **Stage order**: Lifecycle methods must be called in the correct order;
   otherwise an error is thrown.

2. **Error handling**: Hook errors trigger automatic rollback to the previous
   stage; catch and handle errors as needed.

3. **Timeout**: If hooks may run long, set a timeout to avoid waiting
   indefinitely.

4. **Events**: Lifecycle events are emitted synchronously; for async handling,
   implement it inside the listener.

5. **Reset**: `reset()` clears all hooks and event listeners; use with care.

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 📄 License

Apache License 2.0 - see [LICENSE](./LICENSE)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
