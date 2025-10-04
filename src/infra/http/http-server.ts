/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export type RouteOptions = {
  upload?: { single?: string }
}

export interface HttpServer {
  route(
    method: string,
    url: string,
    callback: Function,
    options?: RouteOptions
  ): void
  use(path: string, ...handlers: Array<Function>): void
  listen(port: number): unknown
}
