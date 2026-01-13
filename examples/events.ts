/**
 * 事件系统示例
 *
 * 演示如何使用生命周期事件系统
 */

import { LifecycleManager } from "@dreamer/lifecycle";

// 创建生命周期管理器
const lifecycle = new LifecycleManager();

// 监听生命周期事件
lifecycle.addEventListener("lifecycle:initializing", (data) => {
  console.log("📢 事件: 初始化中", data);
});

lifecycle.addEventListener("lifecycle:initialized", (data) => {
  console.log("📢 事件: 初始化完成", data);
});

lifecycle.addEventListener("lifecycle:starting", (data) => {
  console.log("📢 事件: 启动中", data);
});

lifecycle.addEventListener("lifecycle:started", (data) => {
  console.log("📢 事件: 启动完成", data);
});

lifecycle.addEventListener("lifecycle:ready", (data) => {
  console.log("📢 事件: 应用已就绪", data);
});

// 自定义事件
lifecycle.addEventListener("custom:user-login", (data) => {
  console.log("📢 自定义事件: 用户登录", data);
});

// 注册钩子
lifecycle.on("initializing", async () => {
  console.log("执行初始化钩子");
});

lifecycle.on("starting", async () => {
  console.log("执行启动钩子");
});

lifecycle.on("ready", async () => {
  console.log("执行就绪钩子");
  // 触发自定义事件
  lifecycle.emit("custom:user-login", { userId: 123, username: "alice" });
});

// 执行生命周期
async function main() {
  console.log("=== 启动应用 ===");
  await lifecycle.initialize();
  await lifecycle.start();

  console.log("\n=== 触发自定义事件 ===");
  lifecycle.emit("custom:user-login", { userId: 456, username: "bob" });
}

if (import.meta.main) {
  main().catch(console.error);
}
