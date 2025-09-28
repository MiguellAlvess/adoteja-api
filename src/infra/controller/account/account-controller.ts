import { DeleteAccount } from "../../../application/usecase/account/delete-account.js"
import { GetAccount } from "../../../application/usecase/account/get-account.js"
import { Signup } from "../../../application/usecase/account/signup.js"
import { UpdateAccount } from "../../../application/usecase/account/update-account.js"
import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import {
  accountIdSchema,
  signupSchema,
  UpdateAccountInput,
  updateAccountSchema,
} from "../../http/schemas/account-schemas.js"

export class AccountController {
  constructor(
    httpServer: HttpServer,
    signup: Signup,
    getAccount: GetAccount,
    updateAccount: UpdateAccount,
    deleteAccount: DeleteAccount
  ) {
    httpServer.route(
      "get",
      "/api/accounts/:id",
      async (params: { id: string }) => {
        const parsed = accountIdSchema.parse(params)
        const output = await getAccount.execute(parsed.id)
        return http.ok(output)
      }
    )
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
      "patch",
      "/api/accounts/:id",
      async (params: { id: string }, body: unknown) => {
        const { id } = accountIdSchema.parse(params)
        const parsedBody: UpdateAccountInput = updateAccountSchema.parse(body)
        const output = await updateAccount.execute({
          accountId: id,
          ...parsedBody,
        })

        return http.ok(output)
      }
    )
    httpServer.route(
      "delete",
      "/api/accounts/:id",
      async (params: { id: string }) => {
        const { id } = accountIdSchema.parse(params)
        await deleteAccount.execute(id)
        return http.ok(id)
      }
    )
  }
}
