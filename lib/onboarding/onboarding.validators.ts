import { z } from "zod";
import { ONBOARDING_TIP_KEYS } from "@/lib/onboarding/onboarding.constants";

export const onboardingUpdateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("dismiss-welcome") }),
  z.object({
    action: z.literal("dismiss-tip"),
    tip: z.enum(ONBOARDING_TIP_KEYS),
  }),
  z.object({ action: z.literal("dismiss-checklist") }),
  z.object({ action: z.literal("restart-guide") }),
]);
