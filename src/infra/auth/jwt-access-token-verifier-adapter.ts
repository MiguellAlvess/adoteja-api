import jwt, { type Secret, type Algorithm, JwtPayload } from "jsonwebtoken"
import { AccessTokenVerifier } from "../../application/ports/auth/access-token-verifier.js"

interface TokenPayload extends JwtPayload {
  accountId?: string
  sub?: string
}

export class JwtAccessTokenVerifierAdapter implements AccessTokenVerifier {
  constructor(
    private readonly accessSecret: Secret,
    private readonly algorithm: Algorithm = "HS256"
  ) {}

  verify(accessToken: string): { sub: string } {
    const payload = jwt.verify(accessToken, this.accessSecret, {
      algorithms: [this.algorithm],
    }) as TokenPayload
    const sub = payload.accountId
    if (!sub) {
      throw new Error("Invalid token payload")
    }
    return { sub }
  }
}
