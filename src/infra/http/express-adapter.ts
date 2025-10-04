/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import express, { Application, Request, Response } from "express"
import multer from "multer"
import { HttpServer, RouteOptions } from "./http-server.js"
import { mapErrorToHttp } from "./error-maper.js"

export class ExpressAdapter implements HttpServer {
  private readonly app: Application

  constructor() {
    this.app = express()
    this.app.use(express.json())
  }

  use(path: string, ...handlers: Array<Function>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.app.use(path, ...(handlers as any[]))
  }

  route(
    method: string,
    url: string,
    callback: Function,
    options?: RouteOptions
  ): void {
    const hasUpload = Boolean(options?.upload?.single)
    const uploadMw = hasUpload
      ? multer({ storage: multer.memoryStorage() }).single(
          options!.upload!.single!
        )
      : null

    const handler = async (req: Request, res: Response) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: any = req.body ?? {}
        if (hasUpload && req.file) {
          body.__file = {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
          }
        }
        const output = await callback(req.params, body, req.query, req.headers)
        if (output && typeof output === "object") {
          const status =
            (output.statusCode as number) ?? (output.status as number)
          const bodyOut = "body" in output ? (output.body as unknown) : output
          if (status) return res.status(status).json(bodyOut)
        }

        res.json(output)
      } catch (error: unknown) {
        const { statusCode, body } = mapErrorToHttp(error)
        res.status(statusCode).json(body)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const middlewares: any[] = []
    if (hasUpload && uploadMw)
      middlewares.push(uploadMw)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.app as any)[method](url, ...middlewares, handler)
  }

  listen(port: number) {
    const server = this.app.listen(port)
    console.log(`Server running on port ${port}`)
    return server
  }
}
