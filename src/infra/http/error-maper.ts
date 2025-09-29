import { http, HttpResponse } from "./http.js"

import { DomainError } from "../../domain/errors/domain-error.js"

import {
  AccountNotFoundError,
  EmailAlreadyExistsError,
} from "../../application/errors/account/index.js"
import { ZodError } from "zod"
import { UnauthorizedError } from "../../application/errors/auth/index.js"
import { InvalidCityError } from "../../domain/errors/account/account-errors.js"

type ErrorBody = { message: string; code?: string; details?: unknown }

export function mapErrorToHttp(error: unknown): HttpResponse<ErrorBody> {
  if (error instanceof ZodError) {
    return http.badRequest({
      message: "Invalid request",
      details: error.flatten().fieldErrors,
    })
  }
  if (error instanceof DomainError) {
    return http.badRequest({ message: error.message, code: error.code })
  }
  if (error instanceof AccountNotFoundError) {
    return http.notFound({ message: error.message })
  }
  if (error instanceof EmailAlreadyExistsError) {
    return http.conflict({ message: error.message })
  }
  if (error instanceof UnauthorizedError) {
    return http.unauthorized({ message: error.message })
  }
  if (error instanceof InvalidCityError) {
    return http.unauthorized({ message: error.message })
  }
  return http.serverError()
}
