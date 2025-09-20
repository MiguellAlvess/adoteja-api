/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import express, { Application } from "express"
import { Request, Response } from "express"

import { HttpServer } from "./http-server.js"
import { mapErrorToHttp } from "./error-maper.js"

export class ExpressAdapter implements HttpServer {
  app: Application

  constructor() {
    this.app = express()
    this.app.use(express.json())
  }

  route(method: string, url: string, callback: Function): void {
    this.app[method as keyof Application](
      url,
      async (req: Request, res: Response) => {
        try {
          const output = await callback(
            req.params,
            req.body,
            req.query,
            req.headers
          )
          if (
            output &&
            typeof output === "object" &&
            "statusCode" in output &&
            "body" in output
          ) {
            const { statusCode, body } = output as {
              statusCode: number
              body: unknown
            }
            return res.status(statusCode).json(body)
          }
          res.json(output)
        } catch (error: unknown) {
          const { statusCode, body } = mapErrorToHttp(error)
          res.status(statusCode).json(body)
        }
      }
    )
  }

  listen(port: number) {
    const server = this.app.listen(port)
    console.log(`Server running on port ${port}`)
    return server
  }
}
