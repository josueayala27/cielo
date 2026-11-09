import { validator } from 'hono/validator'
import type { ZodType } from 'zod'
import { ValidationError } from './errors'

/**
 * Validates the request query string against a Zod schema.
 * On failure it throws a {@link ValidationError} (422) with one issue per field.
 *
 * @example
 * router.get('/', validateQuery(listTicketsQuerySchema), (c) => c.req.valid('query'))
 */
export const validateQuery = <T extends ZodType>(schema: T) =>
  validator('query', (value) => parseOrThrow(schema, value))

/**
 * Validates a JSON body against a Zod schema. Malformed JSON is rejected by Hono with a 400
 * (mapped in `handleError`); a well-formed body with invalid fields is a 422.
 */
export const validateJson = <T extends ZodType>(schema: T) =>
  validator('json', (value) => parseOrThrow(schema, value))

/** Parses `value`, returning the typed output or throwing a {@link ValidationError}. */
function parseOrThrow<T extends ZodType>(schema: T, value: unknown) {
  const result = schema.safeParse(value)
  if (!result.success) throw ValidationError.fromZod(result.error)
  return result.data as T['_output']
}

