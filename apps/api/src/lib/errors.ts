import type { ApiErrorBody, ApiErrorCode, FieldIssue } from '@cielo/contracts'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ZodError } from 'zod'

/**
 * An error that maps to a JSON error response. Throw it anywhere in a handler or service;
 * {@link handleError} turns it into `{ error: { code, message, issues? } }`.
 */
export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: ApiErrorCode,
    message: string,
    readonly issues?: FieldIssue[],
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/** 404 for a missing resource. */
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message)
  }
}

/** 422 with one entry per invalid field. */
export class ValidationError extends HttpError {
  constructor(issues: FieldIssue[]) {
    super(422, 'VALIDATION_ERROR', 'The request contains invalid fields', issues)
  }

  /** Flattens a Zod error into `{ field, message }` pairs. Root-level issues get the field `body`. */
  static fromZod(error: ZodError): ValidationError {
    return new ValidationError(
      error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : 'body',
        message: issue.message,
      })),
    )
  }
}

/** Builds the JSON error body shared by every failure. */
export function errorBody(code: ApiErrorCode, message: string, issues?: FieldIssue[]): ApiErrorBody {
  return { error: issues ? { code, message, issues } : { code, message } }
}

/**
 * Global `app.onError` handler: known errors keep their status, anything else is logged
 * and hidden behind a generic 500 so internals never leak to clients.
 */
export function handleError(error: Error, c: Context): Response {
  if (error instanceof HttpError) {
    return c.json(errorBody(error.code, error.message, error.issues), error.status)
  }
  // Raised by Hono itself, e.g. a malformed JSON body.
  if (error instanceof HTTPException) {
    return c.json(errorBody('BAD_REQUEST', error.message), error.status)
  }
  console.error('Unhandled error', error)
  return c.json(errorBody('INTERNAL_ERROR', 'Something went wrong. Please try again.'), 500)
}

/** `app.notFound` handler for unknown routes. */
export function handleNotFound(c: Context): Response {
  return c.json(errorBody('NOT_FOUND', `Route ${c.req.method} ${c.req.path} not found`), 404)
}
