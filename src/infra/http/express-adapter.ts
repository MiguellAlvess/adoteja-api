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
    if (hasUpload) {
      this.app[method as keyof Application](url, uploadMw!, handler)
    } else {
      this.app[method as keyof Application](url, handler)
    }
  }

  listen(port: number) {
    const server = this.app.listen(port)
    console.log(`Server running on port ${port}`)
    return server
  }
}
