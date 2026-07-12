"use client";

import { toast } from "sonner";

type PersistentInfoOptions = {
  id: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onConfirm: () => void;
};

export const appToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
  persistentInfo: (message: string, options: PersistentInfoOptions) =>
    toast.info(message, {
      id: options.id,
      description: options.description,
      duration: Infinity,
      closeButton: false,
      dismissible: true,
      action: {
        label: "Got it",
        onClick: () => {
          toast.dismiss(options.id);
          options.onConfirm();
        },
      },
      cancel: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    }),
  dismiss: (id: string | number) => toast.dismiss(id),
};
