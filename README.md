# @dreamer/lifecycle

> Application lifecycle management library compatible with Deno and Bun, providing full lifecycle management

English | [中文 (Chinese)](./README-zh.md)

[![JSR](https://jsr.io/badges/@dreamer/lifecycle)](https://jsr.io/@dreamer/lifecycle)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.md)
[![Tests: 82 passed](https://img.shields.io/badge/Tests-82%20passed-brightgreen)](./TEST_REPORT.md)

---

## 🎯 Features

Application lifecycle management library for managing the full application lifecycle, including initialization, startup, running, stopping, and shutdown.

## ✨ Capabilities

- **Full lifecycle stage management**:
  - Standard lifecycle stages (uninitialized → initialized → ready → stopped → shutdown)
  - Stage transition and state query management
  - Stage transition validation and error rollback

- **Lifecycle hook system**:
  - Register lifecycle hooks (on, off)
  - Support sync and async hooks
  - Multiple hooks execute in order
  - Automatic rollback on hook execution errors

- **Event system**:
  - Auto-emit lifecycle events
  - Custom events
  - Publish/subscribe pattern

- **Error handling**:
  - Auto-capture hook execution errors
  - Auto-rollback on failed stage transitions
  - Detailed error messages

- **Timeout control**:
  - Configurable hook execution timeout
  - Auto-throw on timeout

- **Service container integration**:
  - Works with `@dreamer/service` dependency injection
  - Manage multiple LifecycleManager instances
  - `createLifecycleManager` factory function

## 📦 Installation

```bash
deno add jsr:@dreamer/lifecycle
```

## 🌍 Environment Compatibility

- **Runtime**: Deno 2.6+ or Bun 1.3.5
- **Server**: ✅ Supported (compatible with Deno and Bun; lifecycle is a server-side concept)
- **Client**: ❌ Not supported (browser; lifecycle is a server-side pattern)

---

## 🚀 Quick Start

### Basic usage

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

// Create lifecycle manager
const lifecycle = new LifecycleManager();

// Register init hook
lifecycle.on("initializing", async () => {
  console.log("Initializing...");
  // Load config, register services, etc.
});

// Register start hook
lifecycle.on("starting", async () => {
  console.log("Starting...");
  // Init database, cache, etc.
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
  // Init database connection
  // Init cache connection
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
  // Wait for in-flight requests
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
  console.log("9. Application shutdown");
});

// Run full lifecycle
await lifecycle.initialize(); // 1, 2
await lifecycle.start(); // 3, 4, 5
await lifecycle.stop(); // 6, 7
await lifecycle.shutdown(); // 8, 9
```

### Event listeners

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
  throw new Error("Init failed");
});

try {
  await lifecycle.initialize();
} catch (error) {
  console.error("Init failed:", error);
  // Lifecycle auto-rolls back to uninitialized
  console.log(lifecycle.getStage()); // "uninitialized"
}
```

### Timeout control

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

// Configure timeout (ms)
const lifecycle = new LifecycleManager({
  timeout: 5000, // 5 second timeout
});

lifecycle.on("initializing", async () => {
  // If this hook runs > 5s, timeout error is thrown
  await new Promise((resolve) => setTimeout(resolve, 10000));
});

try {
  await lifecycle.initialize();
} catch (error) {
  console.error("Timeout error:", error);
}
```

---

## 📚 API Reference

### LifecycleManager class

Lifecycle manager class for application lifecycle management.

#### Constructor

```typescript
new LifecycleManager(options?: LifecycleManagerOptions)
```

Creates a new lifecycle manager instance.

**Parameters**:

- `options?: LifecycleManagerOptions` - Config options
  - `autoEmitEvents?: boolean` - Auto-emit events on stage transitions (default: true)
  - `timeout?: number` - Timeout in ms; throws if hook exceeds (default: 0, no timeout)

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

- `stage: LifecycleStage` - Lifecycle stage
- `hook: LifecycleHook` - Hook function (sync or async)

**Example**:

```typescript
lifecycle.on("initializing", async () => {
  console.log("Initializing...");
});
```

##### `off(stage: LifecycleStage, hook: LifecycleHook): void`

Remove a lifecycle hook.

**Parameters**:

- `stage: LifecycleStage` - Lifecycle stage
- `hook: LifecycleHook` - Hook to remove

**Example**:

```typescript
const hook = () => console.log("hook");
lifecycle.on("initializing", hook);
lifecycle.off("initializing", hook);
```

##### `addEventListener(event: string, listener: LifecycleEventListener): void`

Register an event listener.

**Parameters**:

- `event: string` - Event name
- `listener: LifecycleEventListener` - Listener function

**Example**:

```typescript
lifecycle.addEventListener("lifecycle:ready", (data) => {
  console.log("Application ready:", data);
});
```

##### `removeEventListener(event: string, listener: LifecycleEventListener): void`

Remove an event listener.

**Parameters**:

- `event: string` - Event name
- `listener: LifecycleEventListener` - Listener to remove

##### `emit(event: string, ...args: unknown[]): void`

Emit an event.

**Parameters**:

- `event: string` - Event name
- `...args: unknown[]` - Event arguments

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

Check if the application is ready.

**Returns**: Whether ready

**Example**:

```typescript
if (lifecycle.isReady()) {
  console.log("Application ready");
}
```

##### `isShutdown(): boolean`

Check if the application is shut down.

**Returns**: Whether shut down

**Example**:

```typescript
if (lifecycle.isShutdown()) {
  console.log("Application shut down");
}
```

##### `getStageDescription(): string`

Get a description of the current stage.

**Returns**: Stage description

**Example**:

```typescript
const description = lifecycle.getStageDescription(); // "Ready"
```

##### `reset(): void`

Reset the lifecycle manager. Resets stage to `uninitialized` and clears all hooks and listeners.

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
  | "shutdown"; // Shutdown
```

#### LifecycleHook

Lifecycle hook function type.

```typescript
type LifecycleHook = () => void | Promise<void>;
```

#### LifecycleManagerOptions

Lifecycle manager config options.

```typescript
interface LifecycleManagerOptions {
  autoEmitEvents?: boolean; // Auto-emit events (default: true)
  timeout?: number; // Timeout in ms (default: 0, no timeout)
}
```

#### ServiceContainer integration methods

##### `getName(): string`

Get manager name.

**Returns**: Manager name

##### `setContainer(container: ServiceContainer): void`

Set service container.

**Parameters**:

- `container: ServiceContainer` - Service container instance

##### `getContainer(): ServiceContainer | undefined`

Get service container.

**Returns**: Service container instance, or undefined if not set

##### `static fromContainer(container: ServiceContainer, name?: string): LifecycleManager | undefined`

Get LifecycleManager from service container.

**Parameters**:

- `container: ServiceContainer` - Service container instance
- `name?: string` - Manager name (default "default")

**Returns**: LifecycleManager instance, or undefined if not found

### createLifecycleManager factory

Factory for service container registration.

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

Check if a stage transition is valid.

**Parameters**:

- `from: LifecycleStage` - Source stage
- `to: LifecycleStage` - Target stage

**Returns**: Whether valid

**Example**:

```typescript
import { isValidTransition } from "@dreamer/lifecycle";

const valid = isValidTransition("uninitialized", "initializing"); // true
const invalid = isValidTransition("uninitialized", "ready"); // false
```

#### `getStageDescription(stage: LifecycleStage): string`

Get description for a stage.

**Parameters**:

- `stage: LifecycleStage` - Lifecycle stage

**Returns**: Stage description

**Example**:

```typescript
import { getStageDescription } from "@dreamer/lifecycle";

const desc = getStageDescription("ready"); // "Ready"
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

| Stage | Description | Transitions to |
|-------|-------------|----------------|
| `uninitialized` | Not initialized | `initializing` |
| `initializing` | Initializing | `initialized`, `uninitialized` (rollback) |
| `initialized` | Initialized | `starting`, `uninitialized` (rollback) |
| `starting` | Starting | `started`, `initialized` (rollback) |
| `started` | Started | `ready`, `stopping`, `starting` (rollback) |
| `ready` | Ready | `stopping`, `started` (rollback) |
| `stopping` | Stopping | `stopped`, `ready` (rollback) |
| `stopped` | Stopped | `shutting-down`, `starting` (restart) |
| `shutting-down` | Shutting down | `shutdown`, `stopped` (rollback) |
| `shutdown` | Shutdown | None (final state) |

### Lifecycle events

Each stage transition auto-emits the corresponding event:

- `lifecycle:initializing` - Initializing
- `lifecycle:initialized` - Initialized
- `lifecycle:starting` - Starting
- `lifecycle:started` - Started
- `lifecycle:ready` - Ready
- `lifecycle:stopping` - Stopping
- `lifecycle:stopped` - Stopped
- `lifecycle:shutting-down` - Shutting down
- `lifecycle:shutdown` - Shutdown

---

## 💡 Use cases

### 1. Framework application lifecycle

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";

class Application {
  private lifecycle: LifecycleManager;

  constructor() {
    this.lifecycle = new LifecycleManager();

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

lifecycle.on("starting", async () => {
  await startDatabase();
  await startRedis();
  await startHttpServer();
});

lifecycle.on("shutting-down", async () => {
  await stopHttpServer();
  await stopRedis();
  await stopDatabase();
});

await lifecycle.initialize();
await lifecycle.start();

await lifecycle.stop();
await lifecycle.shutdown();
```

### 3. Graceful shutdown

```typescript
import { LifecycleManager } from "@dreamer/lifecycle";
import { addSignalListener, exit } from "@dreamer/runtime-adapter";

const lifecycle = new LifecycleManager();

addSignalListener("SIGINT", async () => {
  console.log("Received SIGINT, graceful shutdown...");
  await lifecycle.stop();
  await lifecycle.shutdown();
  exit(0);
});

addSignalListener("SIGTERM", async () => {
  console.log("Received SIGTERM, graceful shutdown...");
  await lifecycle.stop();
  await lifecycle.shutdown();
  exit(0);
});
```

---

## 📊 Test Report

[![Tests: 82 passed](https://img.shields.io/badge/Tests-82%20passed-brightgreen)](./TEST_REPORT.md)

| Category | Tests | Status |
|----------|-------|--------|
| LifecycleManager core | 51 | ✅ Passed |
| EventEmitter events | 20 | ✅ Passed |
| ServiceContainer integration | 6 | ✅ Passed |
| createLifecycleManager factory | 5 | ✅ Passed |
| **Total** | **82** | ✅ **100%** |

See [TEST_REPORT.md](./TEST_REPORT.md) for details.

---

## 📝 Notes

1. **Stage order**: Lifecycle methods must be called in the correct order; otherwise an error is thrown.

2. **Error handling**: Hook errors trigger automatic rollback to the previous stage; catch and handle errors as needed.

3. **Timeout**: For long-running hooks, configure a timeout to avoid indefinite waits.

4. **Events**: Lifecycle events are emitted synchronously; handle async logic inside listeners if needed.

5. **Reset**: `reset()` clears all hooks and listeners; use with care.

---

## 🤝 Contributing

Issues and Pull Requests are welcome.

---

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
