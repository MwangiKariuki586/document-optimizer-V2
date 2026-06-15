import { z } from "zod";

export const restoreVersionParamsSchema = z.object({
  id: z.string().uuid("Invalid document id."),
  versionNumber: z.coerce
    .number({ message: "Invalid version number." })
    .int("Invalid version number.")
    .min(0, "Invalid version number."),
});
