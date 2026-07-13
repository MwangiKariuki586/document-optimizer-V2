"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { appToast } from "@/lib/feedback/toast";
import type { OnboardingTipKey } from "@/lib/onboarding/onboarding.constants";
import { useOnboarding } from "@/lib/onboarding/onboarding.query";

type Props = { tip: OnboardingTipKey; title: string; description: string; actionLabel?: string; actionHref?: string };

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function ContextualTip({ tip, title, description, actionLabel, actionHref }: Props) {
  const router = useRouter();
  const { update } = useOnboarding();
  const [isLocallyDismissed, setIsLocallyDismissed] = useState(false);
  const isNarrowViewport = useMediaQuery("(max-width: 639px)");

  useEffect(() => {
    const toastId = `onboarding-guide-${tip}`;

    if (isLocallyDismissed) {
      appToast.dismiss(toastId);
      return;
    }

    appToast.persistentInfo(title, {
      id: toastId,
      description,
      position: isNarrowViewport ? "top-center" : "top-right",
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
    isNarrowViewport,
    router,
    tip,
    title,
    update,
  ]);

  return null;
}
