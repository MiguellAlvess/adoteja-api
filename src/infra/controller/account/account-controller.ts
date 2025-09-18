import { GetAccount } from "../../../application/usecase/account/get-account.js"
import { Signup } from "../../../application/usecase/account/signup.js"
import { HttpServer } from "../../http/http-server.js"

type SignupInput = {
  name: string
  email: string
  password: string
  phone: string
  city: string
  state: string
}

export class AccountController {
  constructor(httpServer: HttpServer, signup: Signup, getAccount: GetAccount) {
    httpServer.route(
      "post",
      "/api/accounts",
      async (_params: Record<string, string>, body: SignupInput) => {
        return signup.execute(body)
      }
    )
    httpServer.route(
      "get",
      "/api/accounts/:id",
      async (params: { id: string }) => {
        return getAccount.execute(params.id)
      }
    )
  }
}
