import { beforeEach, describe, expect, it, vi } from "vitest";

const { info, dismiss } = vi.hoisted(() => ({
  info: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info,
    dismiss,
  },
}));

import { appToast } from "@/lib/feedback/toast";

describe("appToast persistentInfo", () => {
  beforeEach(() => {
    info.mockReset();
    dismiss.mockReset();
  });

  it("stays open indefinitely and dismisses through the primary action", () => {
    const onConfirm = vi.fn();

    appToast.persistentInfo("Guide", {
      id: "guide-id",
      description: "Helpful context",
      onConfirm,
    });

    const options = info.mock.calls[0]?.[1];
    expect(options).toMatchObject({
      id: "guide-id",
      duration: Infinity,
      dismissible: true,
      closeButton: false,
    });

    options.action.onClick();

    expect(dismiss).toHaveBeenCalledWith("guide-id");
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
