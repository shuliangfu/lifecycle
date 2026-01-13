/**
 * 基础生命周期管理示例
 *
 * 演示如何使用 @dreamer/lifecycle 管理应用生命周期
 */

import { LifecycleManager } from "@dreamer/lifecycle";

// 创建生命周期管理器
const lifecycle = new LifecycleManager();

// 注册初始化钩子
lifecycle.on("initializing", async () => {
  console.log("1. 初始化中...");
  // 模拟加载配置
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("   配置加载完成");
});

lifecycle.on("initialized", async () => {
  console.log("2. 初始化完成");
});

// 注册启动钩子
lifecycle.on("starting", async () => {
  console.log("3. 启动中...");
  // 模拟初始化数据库
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("   数据库连接已建立");
});

lifecycle.on("started", async () => {
  console.log("4. 启动完成");
  // 模拟启动 HTTP 服务器
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("   HTTP 服务器已启动");
});

lifecycle.on("ready", async () => {
  console.log("5. 应用已就绪");
});

// 注册停止钩子
lifecycle.on("stopping", async () => {
  console.log("6. 停止中...");
  // 模拟停止接收新请求
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("   已停止接收新请求");
});

lifecycle.on("stopped", async () => {
  console.log("7. 停止完成");
});

// 注册关闭钩子
lifecycle.on("shutting-down", async () => {
  console.log("8. 关闭中...");
  // 模拟关闭服务器和数据库
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("   服务器和数据库已关闭");
});

lifecycle.on("shutdown", async () => {
  console.log("9. 应用已关闭");
});

// 执行完整的生命周期
async function main() {
  console.log("=== 启动应用 ===");
  await lifecycle.initialize();
  await lifecycle.start();

  console.log("\n当前状态:", lifecycle.getStage());
  console.log("是否就绪:", lifecycle.isReady());

  // 模拟应用运行一段时间
  console.log("\n应用运行中...");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("\n=== 关闭应用 ===");
  await lifecycle.stop();
  await lifecycle.shutdown();

  console.log("\n当前状态:", lifecycle.getStage());
  console.log("是否已关闭:", lifecycle.isShutdown());
}

if (import.meta.main) {
  main().catch(console.error);
}
