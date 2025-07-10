import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  name: z.string().min(1),
  organizationId: z.string().uuid().optional(),
  role: z.enum(["SuperAdmin", "Manager", "Operator"]),
});
