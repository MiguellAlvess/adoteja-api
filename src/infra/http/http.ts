export type HttpResponse<T = unknown> = {
  statusCode: number
  body: T
}

export const http = {
  ok<T>(body: T): HttpResponse<T> {
    return { statusCode: 200, body }
  },
  created<T>(body: T): HttpResponse<T> {
    return { statusCode: 201, body }
  },
  badRequest<T>(body: T): HttpResponse<T> {
    return { statusCode: 400, body }
  },
  unauthorized<T>(body: T): HttpResponse<T> {
    return { statusCode: 401, body }
  },
  forbidden<T>(body: T): HttpResponse<T> {
    return { statusCode: 403, body }
  },
  notFound<T>(body: T): HttpResponse<T> {
    return { statusCode: 404, body }
  },
  conflict<T>(body: T): HttpResponse<T> {
    return { statusCode: 409, body }
  },

  serverError(): HttpResponse<{ message: string }> {
    return { statusCode: 500, body: { message: "Internal server error" } }
  },
}
