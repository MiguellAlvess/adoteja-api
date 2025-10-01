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
  listen(port: number): unknown
}
