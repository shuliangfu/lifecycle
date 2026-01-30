/**
 * 生命周期管理器
 *
 * 管理应用的生命周期阶段和钩子
 */

import { EventEmitter } from "./event-emitter.ts";
import type {
  LifecycleEventListener,
  LifecycleHook,
  LifecycleStage,
} from "./types.ts";
import { getStageDescription, isValidTransition } from "./types.ts";
import type { ServiceContainer } from "@dreamer/service";

/**
 * 生命周期管理器选项
 */
export interface LifecycleManagerOptions {
  /** 管理器名称（用于服务容器识别） */
  name?: string;
  /** 是否在阶段转换时自动触发事件（默认：true） */
  autoEmitEvents?: boolean;
  /** 超时时间（毫秒），如果钩子执行超时则抛出错误（默认：无超时） */
  timeout?: number;
}

/**
 * 生命周期管理器类
 *
 * 提供应用生命周期的管理功能，包括阶段转换、钩子注册和执行
 */
export class LifecycleManager {
  /** 当前生命周期阶段 */
  private stage: LifecycleStage = "uninitialized";

  /** 生命周期钩子映射表 */
  private hooks: Map<LifecycleStage, Set<LifecycleHook>> = new Map();

  /** 事件发射器 */
  private eventEmitter: EventEmitter = new EventEmitter();

  /** 配置选项 */
  private options: Omit<Required<LifecycleManagerOptions>, "name">;

  /** 服务容器实例 */
  private container?: ServiceContainer;

  /** 管理器名称 */
  private readonly managerName: string;

  /**
   * 创建生命周期管理器实例
   *
   * @param options 配置选项
   */
  constructor(options: LifecycleManagerOptions = {}) {
    this.options = {
      autoEmitEvents: options.autoEmitEvents ?? true,
      timeout: options.timeout ?? 0, // 0 表示无超时
    };
    this.managerName = options.name || "default";
  }

  /**
   * 获取管理器名称
   * @returns 管理器名称
   */
  getName(): string {
    return this.managerName;
  }

  /**
   * 设置服务容器
   * @param container 服务容器实例
   */
  setContainer(container: ServiceContainer): void {
    this.container = container;
  }

  /**
   * 获取服务容器
   * @returns 服务容器实例，如果未设置则返回 undefined
   */
  getContainer(): ServiceContainer | undefined {
    return this.container;
  }

  /**
   * 从服务容器创建 LifecycleManager 实例
   * @param container 服务容器实例
   * @param name 管理器名称（默认 "default"）
   * @returns 关联了服务容器的 LifecycleManager 实例
   */
  static fromContainer(
    container: ServiceContainer,
    name = "default",
  ): LifecycleManager | undefined {
    const serviceName = `lifecycle:${name}`;
    return container.tryGet<LifecycleManager>(serviceName);
  }

  /**
   * 注册生命周期钩子
   *
   * @param stage 生命周期阶段
   * @param hook 钩子函数
   */
  on(stage: LifecycleStage, hook: LifecycleHook): void {
    if (!this.hooks.has(stage)) {
      this.hooks.set(stage, new Set());
    }
    this.hooks.get(stage)!.add(hook);
  }

  /**
   * 移除生命周期钩子
   *
   * @param stage 生命周期阶段
   * @param hook 钩子函数
   */
  off(stage: LifecycleStage, hook: LifecycleHook): void {
    const stageHooks = this.hooks.get(stage);
    if (stageHooks) {
      stageHooks.delete(hook);
      if (stageHooks.size === 0) {
        this.hooks.delete(stage);
      }
    }
  }

  /**
   * 注册事件监听器
   *
   * @param event 事件名称
   * @param listener 监听器函数
   */
  addEventListener(event: string, listener: LifecycleEventListener): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * 移除事件监听器
   *
   * @param event 事件名称
   * @param listener 监听器函数
   */
  removeEventListener(event: string, listener: LifecycleEventListener): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * 触发事件
   *
   * @param event 事件名称
   * @param args 事件参数
   */
  emit(event: string, ...args: unknown[]): void {
    this.eventEmitter.emit(event, ...args);
  }

  /**
   * 转换到指定阶段
   *
   * @param targetStage 目标阶段
   * @throws 如果阶段转换无效，抛出错误
   */
  private async transitionTo(targetStage: LifecycleStage): Promise<void> {
    // 检查阶段转换是否有效
    if (!isValidTransition(this.stage, targetStage)) {
      throw new Error(
        `无效的阶段转换: ${getStageDescription(this.stage)} -> ${
          getStageDescription(targetStage)
        }`,
      );
    }

    const previousStage = this.stage;
    this.stage = targetStage;

    // 触发阶段转换事件
    if (this.options.autoEmitEvents) {
      this.emit(`lifecycle:${targetStage}`, {
        stage: targetStage,
        previousStage,
      });
    }

    // 执行该阶段的所有钩子
    const stageHooks = this.hooks.get(targetStage);
    if (stageHooks && stageHooks.size > 0) {
      // 创建执行钩子的 Promise 数组
      const hookPromises = Array.from(stageHooks).map(async (hook) => {
        try {
          // 如果有超时配置，使用 Promise.race
          if (this.options.timeout > 0) {
            await Promise.race([
              Promise.resolve(hook()),
              new Promise<never>((_, reject) => {
                setTimeout(
                  () => reject(new Error(`钩子执行超时 (${targetStage})`)),
                  this.options.timeout,
                );
              }),
            ]);
          } else {
            await Promise.resolve(hook());
          }
        } catch (error) {
          // 钩子执行错误，回滚到上一个阶段
          this.stage = previousStage;
          throw new Error(
            `生命周期钩子执行失败 (${targetStage}): ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      });

      // 等待所有钩子执行完成
      await Promise.all(hookPromises);
    }
  }

  /**
   * 初始化应用
   *
   * 将应用从 uninitialized 转换到 initialized
   */
  async initialize(): Promise<void> {
    if (this.stage !== "uninitialized") {
      throw new Error(
        `只能在 uninitialized 阶段调用 initialize，当前阶段: ${
          getStageDescription(this.stage)
        }`,
      );
    }

    await this.transitionTo("initializing");
    await this.transitionTo("initialized");
  }

  /**
   * 启动应用
   *
   * 将应用从 initialized 转换到 ready
   */
  async start(): Promise<void> {
    if (this.stage !== "initialized") {
      throw new Error(
        `只能在 initialized 阶段调用 start，当前阶段: ${
          getStageDescription(this.stage)
        }`,
      );
    }

    await this.transitionTo("starting");
    await this.transitionTo("started");
    await this.transitionTo("ready");
  }

  /**
   * 停止应用
   *
   * 将应用从 ready/started 转换到 stopped
   */
  async stop(): Promise<void> {
    if (this.stage !== "ready" && this.stage !== "started") {
      throw new Error(
        `只能在 ready 或 started 阶段调用 stop，当前阶段: ${
          getStageDescription(this.stage)
        }`,
      );
    }

    await this.transitionTo("stopping");
    await this.transitionTo("stopped");
  }

  /**
   * 关闭应用
   *
   * 将应用从 stopped 转换到 shutdown
   */
  async shutdown(): Promise<void> {
    if (this.stage !== "stopped") {
      throw new Error(
        `只能在 stopped 阶段调用 shutdown，当前阶段: ${
          getStageDescription(this.stage)
        }`,
      );
    }

    await this.transitionTo("shutting-down");
    await this.transitionTo("shutdown");
  }

  /**
   * 获取当前生命周期阶段
   *
   * @returns 当前阶段
   */
  getStage(): LifecycleStage {
    return this.stage;
  }

  /**
   * 检查应用是否已就绪
   *
   * @returns 是否已就绪
   */
  isReady(): boolean {
    return this.stage === "ready";
  }

  /**
   * 检查应用是否已关闭
   *
   * @returns 是否已关闭
   */
  isShutdown(): boolean {
    return this.stage === "shutdown";
  }

  /**
   * 获取阶段的中文描述
   *
   * @returns 当前阶段的中文描述
   */
  getStageDescription(): string {
    return getStageDescription(this.stage);
  }

  /**
   * 重置生命周期管理器
   *
   * 将阶段重置为 uninitialized，清除所有钩子和事件监听器
   */
  reset(): void {
    this.stage = "uninitialized";
    this.hooks.clear();
    this.eventEmitter.removeAllListeners();
  }
}

/**
 * 创建 LifecycleManager 的工厂函数
 * 用于服务容器注册
 * @param options 生命周期管理器配置选项
 * @returns LifecycleManager 实例
 */
export function createLifecycleManager(
  options?: LifecycleManagerOptions,
): LifecycleManager {
  return new LifecycleManager(options);
}
