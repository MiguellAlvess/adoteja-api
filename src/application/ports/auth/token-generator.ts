export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface TokenGenerator {
  generateForAccount(accountId: string): Promise<TokenPair>
}
