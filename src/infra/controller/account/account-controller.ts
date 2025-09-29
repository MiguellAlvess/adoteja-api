import { DeleteAccount } from "../../../application/usecase/account/delete-account.js"
import { GetAccount } from "../../../application/usecase/account/get-account.js"
import { Signup } from "../../../application/usecase/account/signup.js"
import { UpdateAccount } from "../../../application/usecase/account/update-account.js"
import { HttpServer } from "../../http/http-server.js"
import { http } from "../../http/http.js"
import {
  loginSchema,
  signupSchema,
  UpdateAccountInput,
  updateAccountSchema,
} from "../../http/schemas/account-schemas.js"

import {
  makeRequireAuth,
  RouteParams,
  RouteBody,
  RouteQuery,
  Authed,
} from "../../http/require-auth.js"
import { AccessTokenVerifier } from "../../../application/ports/auth/access-token-verifier.js"
import { IncomingHttpHeaders } from "http"
import { Login } from "../../../application/usecase/account/login.js"

export class AccountController {
  constructor(
    httpServer: HttpServer,
    signup: Signup,
    getAccount: GetAccount,
    updateAccount: UpdateAccount,
    deleteAccount: DeleteAccount,
    tokenVerifier: AccessTokenVerifier,
    login: Login
  ) {
    const requireAuth = makeRequireAuth(tokenVerifier)

    httpServer.route(
      "post",
      "/api/accounts",
      async (_p: RouteParams, body: unknown) => {
        const parsed = signupSchema.parse(body)
        const output = await signup.execute(parsed)
        return http.created(output)
      }
    )

    httpServer.route(
      "post",
      "/api/login",
      async (_p: RouteParams, body: unknown) => {
        const parsed = loginSchema.parse(body)
        const output = await login.execute(parsed)
        return http.ok(output)
      }
    )

    httpServer.route(
      "get",
      "/api/accounts/me",
      requireAuth<RouteParams, RouteBody, RouteQuery>(
        async (
          _p: RouteParams,
          _b: RouteBody,
          _q: RouteQuery,
          _h: IncomingHttpHeaders,
          auth: Authed
        ) => {
          const output = await getAccount.execute(auth.sub)
          return http.ok(output)
        }
      )
    )

    httpServer.route(
      "patch",
      "/api/accounts/me",
      requireAuth<RouteParams, unknown, RouteQuery>(
        async (
          _p: RouteParams,
          body: unknown,
          _q: RouteQuery,
          _h: IncomingHttpHeaders,
          auth: Authed
        ) => {
          const parsedBody: UpdateAccountInput = updateAccountSchema.parse(body)
          const output = await updateAccount.execute({
            accountId: auth.sub,
            ...parsedBody,
          })
          return http.ok(output)
        }
      )
    )

    httpServer.route(
      "delete",
      "/api/accounts/me",
      requireAuth<RouteParams, RouteBody, RouteQuery>(
        async (
          _p: RouteParams,
          _b: RouteBody,
          _q: RouteQuery,
          _h: IncomingHttpHeaders,
          auth: Authed
        ) => {
          await deleteAccount.execute(auth.sub)
          return http.ok({ id: auth.sub })
        }
      )
    )
  }
}
