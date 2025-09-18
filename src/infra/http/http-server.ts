/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import express, { Application } from "express"
import { Request, Response } from "express"

export interface HttpServer {
  route(method: string, url: string, callback: Function): void
  listen(port: number): void
}

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
          const output = await callback(req.params, req.body)
          res.json(output)
        } catch (error: unknown) {
          console.log(error)
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error"
          res.status(422).json({
            message: errorMessage,
          })
        }
      }
    )
  }
  listen(port: number): void {
    this.app.listen(port)
    console.log(`Server running on port ${port}`)
  }
}
