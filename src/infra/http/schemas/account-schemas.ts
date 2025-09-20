import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Invalid email",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  phone: z.string(),
  city: z.string(),
  state: z.string().length(2, {
    message: "Invalid state",
  }),
})

export type SignupInput = z.infer<typeof signupSchema>

export const accountIdSchema = z.object({
  id: z.string().uuid({
    message: "Invalid account id",
  }),
})
export type AccountIdParams = z.infer<typeof accountIdSchema>
