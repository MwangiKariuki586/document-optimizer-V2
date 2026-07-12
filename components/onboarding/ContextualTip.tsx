"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { appToast } from "@/lib/feedback/toast";
import type { OnboardingTipKey } from "@/lib/onboarding/onboarding.constants";
import { useOnboarding } from "@/lib/onboarding/onboarding.query";

type Props = { tip: OnboardingTipKey; title: string; description: string; actionLabel?: string; actionHref?: string };

export function ContextualTip({ tip, title, description, actionLabel, actionHref }: Props) {
  const router = useRouter();
  const { update } = useOnboarding();
  const [isLocallyDismissed, setIsLocallyDismissed] = useState(false);

  useEffect(() => {
    const toastId = `onboarding-guide-${tip}`;

    if (isLocallyDismissed) {
      appToast.dismiss(toastId);
      return;
    }

    appToast.persistentInfo(title, {
      id: toastId,
      description,
      action:
        actionHref && actionLabel
          ? { label: actionLabel, onClick: () => router.push(actionHref) }
          : undefined,
      onConfirm: () => {
        setIsLocallyDismissed(true);
        update({ action: "dismiss-tip", tip });
      },
    });

    return () => {
      appToast.dismiss(toastId);
    };
  }, [
    actionHref,
    actionLabel,
    description,
    isLocallyDismissed,
    router,
    tip,
    title,
    update,
  ]);

  return null;
}
