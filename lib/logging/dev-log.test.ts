import { afterEach, describe, expect, it, vi } from "vitest";
import { devLog } from "@/lib/logging/dev-log";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("devLog", () => {
  it("logs structured diagnostics outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    devLog("ai/run", "completed", { requestId: "request_123" });

    expect(info).toHaveBeenCalledWith("[ai/run] completed", {
      requestId: "request_123",
    });
  });

  it("does not log diagnostics in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    devLog("ai/run", "completed", { requestId: "request_123" });

    expect(info).not.toHaveBeenCalled();
  });
});
