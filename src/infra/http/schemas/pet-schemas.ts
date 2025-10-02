import { z } from "zod"

export const createPetSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE"]),
  age: z.coerce.number().int().min(0).max(40),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  description: z.string().max(500).optional().nullable(),
})

export const petIdSchema = z.object({
  id: z.string().uuid({
    message: "Invalid pet id",
  }),
})

export type PetIdParams = z.infer<typeof petIdSchema>
export type CreatePetBody = z.infer<typeof createPetSchema>
