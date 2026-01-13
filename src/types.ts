/**
 * 生命周期阶段类型
 *
 * 定义应用生命周期的各个阶段
 */
export type LifecycleStage =
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

/**
 * 生命周期钩子函数类型
 *
 * 钩子函数可以是同步或异步的
 */
export type LifecycleHook = () => void | Promise<void>;

/**
 * 生命周期事件监听器类型
 */
export type LifecycleEventListener = (...args: unknown[]) => void;

/**
 * 生命周期阶段转换规则
 *
 * 定义哪些阶段可以转换到哪些阶段
 */
export const LIFECYCLE_STAGE_TRANSITIONS: Record<
  LifecycleStage,
  LifecycleStage[]
> = {
  uninitialized: ["initializing"],
  initializing: ["initialized", "uninitialized"], // 可以回滚
  initialized: ["starting", "uninitialized"], // 可以回滚
  starting: ["started", "initialized"], // 可以回滚
  started: ["ready", "stopping", "starting"], // 可以回滚或停止
  ready: ["stopping", "started"], // 可以停止或回滚
  stopping: ["stopped", "ready"], // 可以回滚
  stopped: ["shutting-down", "starting"], // 可以关闭或重新启动
  "shutting-down": ["shutdown", "stopped"], // 可以回滚
  shutdown: [], // 最终状态，无法转换
};

/**
 * 检查阶段转换是否有效
 *
 * @param from 源阶段
 * @param to 目标阶段
 * @returns 是否有效
 */
export function isValidTransition(
  from: LifecycleStage,
  to: LifecycleStage,
): boolean {
  const allowedTransitions = LIFECYCLE_STAGE_TRANSITIONS[from] || [];
  return allowedTransitions.includes(to);
}

/**
 * 获取阶段的中文描述
 *
 * @param stage 生命周期阶段
 * @returns 中文描述
 */
export function getStageDescription(stage: LifecycleStage): string {
  const descriptions: Record<LifecycleStage, string> = {
    uninitialized: "未初始化",
    initializing: "初始化中",
    initialized: "初始化完成",
    starting: "启动中",
    started: "启动完成",
    ready: "就绪",
    stopping: "停止中",
    stopped: "停止完成",
    "shutting-down": "关闭中",
    shutdown: "已关闭",
  };
  return descriptions[stage];
}
