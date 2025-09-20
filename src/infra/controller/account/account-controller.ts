import { GetAccount } from "../../../application/usecase/account/get-account.js"
import { Signup } from "../../../application/usecase/account/signup.js"
import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import {
  accountIdSchema,
  signupSchema,
} from "../../http/schemas/account-schemas.js"

export class AccountController {
  constructor(httpServer: HttpServer, signup: Signup, getAccount: GetAccount) {
    httpServer.route(
      "post",
      "/api/accounts",
      async (_params: Record<string, string>, body: unknown) => {
        const parsed = signupSchema.parse(body)
        const output = await signup.execute(parsed)
        return http.created(output)
      }
    )
    httpServer.route(
      "get",
      "/api/accounts/:id",
      async (params: { id: string }) => {
        const parsed = accountIdSchema.parse(params)
        const output = await getAccount.execute(parsed.id)
        return http.ok(output)
      }
    )
  }
}
