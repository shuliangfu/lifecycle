/**
 * @module @dreamer/lifecycle
 *
 * @dreamer/lifecycle 应用生命周期管理库
 *
 * 提供应用生命周期的管理功能，包括阶段转换、钩子注册和执行、事件系统。
 *
 * 环境兼容性：
 * - 服务端：✅ 支持（Deno 和 Bun 运行时）
 * - 客户端：❌ 不支持（浏览器环境，生命周期管理是服务端概念）
 *
 * @example
 * ```typescript
 * import { LifecycleManager } from "@dreamer/lifecycle";
 *
 * const lifecycle = new LifecycleManager();
 *
 * // 注册初始化钩子
 * lifecycle.on("initializing", async () => {
 *   console.log("初始化中...");
 * });
 *
 * // 注册启动钩子
 * lifecycle.on("starting", async () => {
 *   console.log("启动中...");
 * });
 *
 * // 执行生命周期
 * await lifecycle.initialize();
 * await lifecycle.start();
 *
 * // 查询状态
 * console.log(lifecycle.getStage()); // "ready"
 * console.log(lifecycle.isReady()); // true
 * ```
 */

// 导出核心类
export { createLifecycleManager, LifecycleManager } from "./manager.ts";
export type { LifecycleManagerOptions } from "./manager.ts";

// 导出类型
export type {
  LifecycleEventListener,
  LifecycleHook,
  LifecycleStage,
} from "./types.ts";

// 导出工具函数
export {
  getStageDescription,
  isValidTransition,
  LIFECYCLE_STAGE_TRANSITIONS,
} from "./types.ts";

// 导出事件发射器（如果需要直接使用）
export { EventEmitter } from "./event-emitter.ts";

// 注意：transitionTo 是私有方法，不对外导出
// 如果需要测试阶段转换，可以通过公共方法（initialize、start、stop、shutdown）间接测试
