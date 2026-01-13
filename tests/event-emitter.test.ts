/**
 * EventEmitter 测试
 */

import { describe, expect, it } from "@dreamer/test";
import { EventEmitter } from "../src/event-emitter.ts";

describe("EventEmitter", () => {
  describe("基础功能", () => {
    it("应该创建 EventEmitter 实例", () => {
      const emitter = new EventEmitter();
      expect(emitter.listenerCount("test")).toBe(0);
    });

    it("应该注册事件监听器", () => {
      const emitter = new EventEmitter();
      let called = false;

      emitter.on("test", () => {
        called = true;
      });

      emitter.emit("test");
      expect(called).toBe(true);
    });

    it("应该支持多个监听器", () => {
      const emitter = new EventEmitter();
      let callCount = 0;

      emitter.on("test", () => callCount++);
      emitter.on("test", () => callCount++);
      emitter.on("test", () => callCount++);

      emitter.emit("test");
      expect(callCount).toBe(3);
    });

    it("应该移除事件监听器", () => {
      const emitter = new EventEmitter();
      let callCount = 0;

      const listener1 = () => callCount++;
      const listener2 = () => callCount++;

      emitter.on("test", listener1);
      emitter.on("test", listener2);
      emitter.off("test", listener1);

      emitter.emit("test");
      expect(callCount).toBe(1);
    });

    it("应该传递事件参数", () => {
      const emitter = new EventEmitter();
      let receivedData: unknown = null;

      emitter.on("test", (data) => {
        receivedData = data;
      });

      const testData = { message: "Hello", count: 123 };
      emitter.emit("test", testData);
      expect(receivedData).toEqual(testData);
    });

    it("应该传递多个事件参数", () => {
      const emitter = new EventEmitter();
      let receivedArgs: unknown[] = [];

      emitter.on("test", (...args) => {
        receivedArgs = args;
      });

      emitter.emit("test", "arg1", "arg2", "arg3");
      expect(receivedArgs).toEqual(["arg1", "arg2", "arg3"]);
    });
  });

  describe("错误处理", () => {
    it("应该处理监听器错误", () => {
      const emitter = new EventEmitter();
      let otherListenerCalled = false;

      // 临时抑制 console.error 输出（这是预期的错误，用于测试错误处理）
      const originalError = console.error;
      const errorMessages: unknown[] = [];
      console.error = (...args: unknown[]) => {
        errorMessages.push(...args);
      };

      try {
        // 第一个监听器会抛出错误
        emitter.on("test", () => {
          throw new Error("监听器错误");
        });

        // 第二个监听器应该仍然执行
        emitter.on("test", () => {
          otherListenerCalled = true;
        });

        // 触发事件不应该抛出错误
        emitter.emit("test");
        expect(otherListenerCalled).toBe(true);
        // 验证错误确实被捕获了（但不输出到控制台）
        expect(errorMessages.length).toBeGreaterThan(0);
      } finally {
        // 恢复 console.error
        console.error = originalError;
      }
    });

    it("应该处理多个监听器中的错误", () => {
      const emitter = new EventEmitter();
      const callOrder: string[] = [];

      // 临时抑制 console.error 输出（这是预期的错误，用于测试错误处理）
      const originalError = console.error;
      const errorMessages: unknown[] = [];
      console.error = (...args: unknown[]) => {
        errorMessages.push(...args);
      };

      try {
        emitter.on("test", () => {
          callOrder.push("listener1");
          throw new Error("错误1");
        });

        emitter.on("test", () => {
          callOrder.push("listener2");
        });

        emitter.on("test", () => {
          callOrder.push("listener3");
          throw new Error("错误2");
        });

        emitter.emit("test");

        // 所有监听器都应该执行
        expect(callOrder).toEqual(["listener1", "listener2", "listener3"]);
        // 验证错误确实被捕获了（但不输出到控制台）
        expect(errorMessages.length).toBeGreaterThan(0);
      } finally {
        // 恢复 console.error
        console.error = originalError;
      }
    });
  });

  describe("监听器管理", () => {
    it("应该返回监听器数量", () => {
      const emitter = new EventEmitter();

      emitter.on("test", () => {});
      emitter.on("test", () => {});

      expect(emitter.listenerCount("test")).toBe(2);
      expect(emitter.listenerCount("nonexistent")).toBe(0);
    });

    it("应该返回所有事件名称", () => {
      const emitter = new EventEmitter();

      emitter.on("event1", () => {});
      emitter.on("event2", () => {});
      emitter.on("event3", () => {});

      const eventNames = emitter.eventNames();
      expect(eventNames.length).toBe(3);
      expect(eventNames).toContain("event1");
      expect(eventNames).toContain("event2");
      expect(eventNames).toContain("event3");
    });

    it("应该移除指定事件的所有监听器", () => {
      const emitter = new EventEmitter();
      let callCount = 0;

      emitter.on("test", () => callCount++);
      emitter.on("test", () => callCount++);
      emitter.on("other", () => callCount++);

      emitter.removeAllListeners("test");
      emitter.emit("test");
      emitter.emit("other");

      expect(callCount).toBe(1); // 只有 other 事件的监听器执行了
      expect(emitter.listenerCount("test")).toBe(0);
      expect(emitter.listenerCount("other")).toBe(1);
    });

    it("应该移除所有事件的所有监听器", () => {
      const emitter = new EventEmitter();
      let callCount1 = 0;
      let callCount2 = 0;

      emitter.on("event1", () => callCount1++);
      emitter.on("event2", () => callCount2++);

      emitter.removeAllListeners();
      emitter.emit("event1");
      emitter.emit("event2");

      expect(callCount1).toBe(0);
      expect(callCount2).toBe(0);
      expect(emitter.eventNames().length).toBe(0);
    });

    it("应该在移除监听器后清理空事件", () => {
      const emitter = new EventEmitter();

      const listener = () => {};

      emitter.on("test", listener);
      expect(emitter.listenerCount("test")).toBe(1);

      emitter.off("test", listener);
      expect(emitter.listenerCount("test")).toBe(0);
      expect(emitter.eventNames()).not.toContain("test");
    });
  });

  describe("边界情况", () => {
    it("应该处理没有监听器的事件", () => {
      const emitter = new EventEmitter();
      // 不应该抛出错误
      emitter.emit("nonexistent");
    });

    it("应该处理移除不存在的监听器", () => {
      const emitter = new EventEmitter();
      const listener = () => {};

      // 不应该抛出错误
      emitter.off("test", listener);
    });

    it("应该处理移除不存在的事件", () => {
      const emitter = new EventEmitter();

      // 不应该抛出错误
      emitter.removeAllListeners("nonexistent");
    });

    it("应该处理多次注册同一个监听器", () => {
      const emitter = new EventEmitter();
      let callCount = 0;
      const listener = () => callCount++;

      emitter.on("test", listener);
      emitter.on("test", listener); // 再次注册同一个监听器

      emitter.emit("test");
      // Set 会自动去重，所以应该只调用一次
      expect(callCount).toBe(1);
    });

    it("应该处理多次移除同一个监听器", () => {
      const emitter = new EventEmitter();
      const listener = () => {};

      emitter.on("test", listener);
      emitter.off("test", listener);
      emitter.off("test", listener); // 再次移除

      // 不应该抛出错误
      expect(emitter.listenerCount("test")).toBe(0);
    });

    it("应该处理空事件名称", () => {
      const emitter = new EventEmitter();
      let called = false;

      emitter.on("", () => {
        called = true;
      });

      emitter.emit("");
      expect(called).toBe(true);
    });

    it("应该处理特殊字符事件名称", () => {
      const emitter = new EventEmitter();
      let called = false;

      emitter.on("event:with:colons", () => {
        called = true;
      });

      emitter.emit("event:with:colons");
      expect(called).toBe(true);
    });
  });
});
