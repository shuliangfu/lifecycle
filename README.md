# @dreamer/lifecycle

> Application lifecycle management library compatible with Deno and Bun,
> providing full lifecycle management (stages, hooks, events, rollback).

[![JSR](https://jsr.io/badges/@dreamer/lifecycle)](https://jsr.io/@dreamer/lifecycle)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Tests: 82 passed](https://img.shields.io/badge/Tests-82%20passed-brightgreen)](./docs/en-US/TEST_REPORT.md)

📖 **Docs**: [English](./README.md) (root) |
[中文 (Chinese)](./docs/zh-CN/README.md)

**Changelog**: [English](./docs/en-US/CHANGELOG.md) |
[zh-CN](./docs/zh-CN/CHANGELOG.md)

### [1.0.1] - 2026-02-19

- **Changed**: i18n translation method `$t` → `$tr`; docs reorganized to
  `docs/en-US/` and `docs/zh-CN/`; license explicitly Apache-2.0.

---

## Features

- **Lifecycle stages**: uninitialized → initializing → initialized → starting →
  started → ready → stopping → stopped → shutting-down → shutdown
- **Hooks**: `on` / `off` per stage, sync/async, timeout, auto rollback on error
- **Events**: auto-emit `lifecycle:*`, custom events
- **i18n**: `initLifecycleI18n()`, `$tr`, `getStageDescription` (en-US / zh-CN)
- **Service container**: `createLifecycleManager`, `fromContainer`

## Installation

```bash
deno add jsr:@dreamer/lifecycle
```

## Quick start

```typescript
import { LifecycleManager } from "jsr:@dreamer/lifecycle";

const lifecycle = new LifecycleManager();
lifecycle.on("initializing", async () => {/* load config */});
lifecycle.on("starting", async () => {/* init DB */});
lifecycle.on("ready", async () => {
  console.log("Ready");
});

await lifecycle.initialize();
await lifecycle.start();
console.log(lifecycle.getStage()); // "ready"
```

- **Test report**: [English](./docs/en-US/TEST_REPORT.md) |
  [zh-CN](./docs/zh-CN/TEST_REPORT.md)
- Full documentation: [README](./README.md) (English) |
  [中文](./docs/zh-CN/README.md).

---

## License

Apache-2.0 - see [LICENSE](./LICENSE)
