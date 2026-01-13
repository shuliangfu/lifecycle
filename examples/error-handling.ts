/**
 * 错误处理示例
 *
 * 演示生命周期管理器的错误处理和回滚机制
 */

import { LifecycleManager } from "@dreamer/lifecycle";

// 创建生命周期管理器
const lifecycle = new LifecycleManager();

// 注册钩子（包含错误）
lifecycle.on("initializing", async () => {
  console.log("初始化钩子执行中...");
  throw new Error("初始化失败");
});

// 注册后续钩子（不会执行，因为前面的钩子失败了）
lifecycle.on("initialized", async () => {
  console.log("这个钩子不会执行");
});

// 监听错误事件
lifecycle.addEventListener("lifecycle:initializing", (data) => {
  console.log("初始化中事件触发:", data);
});

// 执行生命周期（会失败并回滚）
async function main() {
  try {
    console.log("尝试初始化...");
    await lifecycle.initialize();
    console.log("初始化成功（不应该执行到这里）");
  } catch (error) {
    console.error("初始化失败:", error instanceof Error ? error.message : error);
    console.log("当前阶段:", lifecycle.getStage()); // 应该是 "uninitialized"
    console.log("生命周期已回滚到初始状态");
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
