/** Machine-readable error codes returned by the API. */
export type ApiErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_ERROR'

/** One invalid field, keyed by its dotted path (`customerEmail`). */
export interface FieldIssue {
  field: string
  message: string
}

/**
 * Every non-2xx response has this JSON body, so clients handle errors in one place.
 *
 * @example
 * { "error": { "code": "NOT_FOUND", "message": "Ticket abc not found" } }
 */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    issues?: FieldIssue[]
  }
}
