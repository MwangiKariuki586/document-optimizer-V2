"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ONBOARDING_QUERY_KEY } from "@/lib/onboarding/onboarding.constants";
import type {
  OnboardingState,
  OnboardingUpdate,
} from "@/lib/onboarding/onboarding.types";

type OnboardingResponse = {
  success: boolean;
  data?: OnboardingState;
  error?: string;
};

async function readOnboarding(): Promise<OnboardingState> {
  const response = await fetch("/api/onboarding", {
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json()) as OnboardingResponse;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Could not load onboarding guidance.");
  }
  return payload.data;
}

async function writeOnboarding(update: OnboardingUpdate): Promise<OnboardingState> {
  const response = await fetch("/api/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  const payload = (await response.json()) as OnboardingResponse;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Could not update onboarding guidance.");
  }
  return payload.data;
}

export function useOnboarding() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ONBOARDING_QUERY_KEY,
    queryFn: readOnboarding,
    staleTime: 60_000,
    retry: 1,
  });
  const mutation = useMutation({
    mutationFn: writeOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_QUERY_KEY, data);
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

export function useInvalidateOnboarding() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
}
