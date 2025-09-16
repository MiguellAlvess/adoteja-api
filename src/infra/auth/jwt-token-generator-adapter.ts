import jwt, {
  type Secret,
  type SignOptions,
  type Algorithm,
} from "jsonwebtoken"
import type {
  TokenGenerator,
  TokenPair,
} from "../../application/ports/auth/token-generator.js"

export class JwtTokenGeneratorAdapter implements TokenGenerator {
  constructor(
    private readonly accessSecret: Secret,
    private readonly refreshSecret: Secret,
    private readonly accessTtl: SignOptions["expiresIn"] = "15m",
    private readonly refreshTtl: SignOptions["expiresIn"] = "7d",
    private readonly algorithm: Algorithm = "HS256"
  ) {}

  async generateForAccount(accountId: string): Promise<TokenPair> {
    const payload = { accountId }
    const accessToken = jwt.sign(payload, this.accessSecret, {
      algorithm: this.algorithm,
      expiresIn: this.accessTtl,
    })
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      algorithm: this.algorithm,
      expiresIn: this.refreshTtl,
    })
    return { accessToken, refreshToken }
  }
}
