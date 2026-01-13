/**
 * 超时控制示例
 *
 * 演示如何使用超时控制功能
 */

import { LifecycleManager } from "@dreamer/lifecycle";

// 创建生命周期管理器（配置超时时间）
const lifecycle = new LifecycleManager({
  timeout: 1000, // 1 秒超时
});

// 注册一个执行时间较长的钩子
lifecycle.on("initializing", async () => {
  console.log("初始化钩子开始执行...");
  // 模拟长时间操作（2 秒，超过超时时间）
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("初始化钩子执行完成（不应该执行到这里）");
});

// 执行生命周期（会超时）
async function main() {
  try {
    console.log("尝试初始化（超时时间: 1 秒）...");
    await lifecycle.initialize();
    console.log("初始化成功（不应该执行到这里）");
  } catch (error) {
    console.error(
      "初始化超时:",
      error instanceof Error ? error.message : error,
    );
    console.log("当前阶段:", lifecycle.getStage()); // 应该是 "uninitialized"
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
