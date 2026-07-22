# Changelog

[English](./CHANGELOG.md) | [中文 (Chinese)](../zh-CN/CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-07-23

### Added

- **Node.js compatibility**: lifecycle now runs on Node 22+ — `src/` is pure
  logic (no `Deno.*`, no `IS_NODE` branch); timer types already use
  `ReturnType<typeof setTimeout>` (Deno/Bun return `number`, Node returns
  `NodeJS.Timeout` — unified cross-runtime type); error messages go through
  `@dreamer/i18n` v1.1.2 and service-container integration through
  `@dreamer/service` v1.1.0 (both Node-supported).
- **Node.js test infra**: Added `tsconfig.json`, `ci.yml` (9-job: 3 Deno v2.9 +
  3 Bun + 3 Node 22); `test:node` driven by `tsx --test --test-force-exit`;
  Deno/Bun/Node share the same `tests/*.test.ts` suite.

### Changed

- **src/**: No changes (pure-logic package; `tests/mod.test.ts` already calls
  `setLifecycleLocale("zh-CN")` at module level to lock Chinese messages, so no
  extra fix needed for CI's English locale).
- **Dependencies**: `@dreamer/i18n` ^1.1.2, `@dreamer/runtime-adapter` ^1.2.2,
  `@dreamer/service` ^1.1.0, `@dreamer/test` ^1.2.3.
- **deno.json**: Added `minimumDependencyAge: 0`.
- **.gitignore**: Added `package-lock.json`.

### Compatibility

- Deno 2.9+ / Bun 1.3+ / Node.js 22+

---

## [1.0.2] - 2026-02-19

### Changed

- **i18n**: Initialization now runs automatically when the i18n module is
  loaded. Entry file (`mod.ts`) no longer imports or calls `initLifecycleI18n`;
  remove any such usage from your code.

---

## [1.0.1] - 2026-02-19

### Changed

- **i18n**: Renamed translation method from `$t` to `$tr` to avoid conflict with
  global `$t`. Update existing code to use `$tr` for package messages.
- **Docs**: Reorganized documentation into `docs/en-US/` (CHANGELOG,
  TEST_REPORT) and `docs/zh-CN/` (README, CHANGELOG, TEST_REPORT with full
  Chinese translations). Removed root CHANGELOG and TEST_REPORT. Root README
  shortened with links to docs.
- **License**: Explicitly Apache-2.0 in `deno.json` and documentation.

---

## [1.0.0] - 2026-02-06

### Added

First stable release. Application lifecycle management library compatible with
Deno and Bun, providing full lifecycle management including stage transitions,
hooks, events, and error rollback.

#### Lifecycle Stages

- 10 standard stages: `uninitialized` → `initializing` → `initialized` →
  `starting` → `started` → `ready` → `stopping` → `stopped` → `shutting-down` →
  `shutdown`
- Stage transition validation and automatic rollback on error
- `getStage()`, `isReady()`, `isShutdown()`, `getStageDescription()` for state
  queries

#### LifecycleManager

- **Constructor** (`new LifecycleManager(options?)`): Create instance with
  optional `autoEmitEvents` and `timeout`
- **Hooks** (`on`, `off`): Register and remove lifecycle hooks for each stage
- **Lifecycle methods**: `initialize()`, `start()`, `stop()`, `shutdown()`
- **Reset** (`reset()`): Reset to uninitialized, clear all hooks and listeners
- **Event system**: `addEventListener`, `removeEventListener`, `emit` for
  lifecycle and custom events
- Auto-emit `lifecycle:*` events on stage transitions (configurable)

#### EventEmitter

- `on`, `off`, `emit` for event pub/sub
- `removeAllListeners(event?)`, `listenerCount(event)`, `eventNames()`
- Listener deduplication via Set

#### ServiceContainer Integration

- `getName()`, `setContainer()`, `getContainer()`
- `static fromContainer(container, name?)` to get instance from container
- `createLifecycleManager(options?)` factory for container registration

#### Utilities

- `isValidTransition(from, to)`: Validate stage transitions
- `getStageDescription(stage)`: Get stage description
- `LIFECYCLE_STAGE_TRANSITIONS`: Constant for transition rules

#### Error Handling & Timeout

- Hook execution errors trigger automatic rollback
- Configurable `timeout` for hook execution
- Support for sync and async hooks

#### Type Exports

- `LifecycleStage`, `LifecycleHook`, `LifecycleEventListener`,
  `LifecycleManagerOptions`
