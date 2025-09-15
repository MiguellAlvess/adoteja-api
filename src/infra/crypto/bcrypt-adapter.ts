import bcrypt from "bcrypt"
import { PasswordHasher } from "../../application/ports/crypto/password-hasher.js"

export class BcryptAdapter implements PasswordHasher {
  hash(plain: string) {
    return bcrypt.hash(plain, 10)
  }
  compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash)
  }
}
