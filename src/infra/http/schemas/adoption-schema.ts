import { z } from "zod"

export const requestAdoptionSchema = z.object({
  petId: z.string().uuid(),
})

export const adoptionIdSchema = z.object({
  id: z.string().uuid({ message: "Invalid adoption id" }),
})

export type RequestAdoptionBody = z.infer<typeof requestAdoptionSchema>
export type AdoptionIdParams = z.infer<typeof adoptionIdSchema>
