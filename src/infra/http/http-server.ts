/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export interface HttpServer {
  route(method: string, url: string, callback: Function): void
  listen(port: number): void
}
