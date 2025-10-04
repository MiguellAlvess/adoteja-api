import { z } from "zod"

export const requestAdoptionSchema = z
  .object({
    petId: z.string().uuid(),
  })
  .strict()
