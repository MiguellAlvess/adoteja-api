export interface AccessTokenVerifier {
  verify(accessToken: string): { sub: string }
}
