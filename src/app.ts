import { DeleteAccount } from "./application/usecase/account/delete-account.js"
import { GetAccount } from "./application/usecase/account/get-account.js"
import { Signup } from "./application/usecase/account/signup.js"
import { UpdateAccount } from "./application/usecase/account/update-account.js"
import { JwtTokenGeneratorAdapter } from "./infra/auth/jwt-token-generator-adapter.js"
import { AccountController } from "./infra/controller/account/account-controller.js"
import { BcryptAdapter } from "./infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "./infra/database/prisma-adapter.js"
import { ExpressAdapter } from "./infra/http/express-adapter.js"
import { AccountRepositoryDatabase } from "./infra/repository/account/account-repository.js"

export function buildApp() {
  const databaseConnection = new PrismaAdapter()
  const accountRepository = new AccountRepositoryDatabase(databaseConnection)
  const getAccount = new GetAccount(accountRepository)
  const tokenGenerator = new JwtTokenGeneratorAdapter(
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    process.env.JWT_REFRESH_TOKEN_SECRET!,
    "15m",
    "7d"
  )
  const passwordHasher = new BcryptAdapter()
  const signup = new Signup(accountRepository, passwordHasher, tokenGenerator)
  const deleteAccount = new DeleteAccount(accountRepository)
  const httpServer = new ExpressAdapter()
  const updateAccount = new UpdateAccount(accountRepository, passwordHasher)
  new AccountController(
    httpServer,
    signup,
    getAccount,
    updateAccount,
    deleteAccount
  )
  return httpServer
}
