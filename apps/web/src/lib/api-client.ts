import type { ApiErrorBody, ApiErrorCode, FieldIssue } from '@cielo/contracts'

/** Base URL of the API, inlined at build time. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787').replace(/\/$/, '')

/**
 * A failed request. `status` is 0 when the server could not be reached (offline, DNS,
 * CORS), so the UI can tell "check your connection" apart from a server-side refusal.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | 'NETWORK_ERROR',
    message: string,
    readonly issues: FieldIssue[] = [],
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR'
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

/** Query-string values; `undefined` and empty strings are left out. */
export type QueryParams = Record<string, string | number | undefined>

/** Serialises params, skipping empty values so URLs stay clean. */
export function toSearchParams(params: QueryParams = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  query?: QueryParams
  body?: unknown
  signal?: AbortSignal
}

/**
 * Sends a JSON request to the API and returns the parsed body.
 *
 * @throws {ApiError} with `code: 'NETWORK_ERROR'` when the request never got a response,
 * or with the server's `{ error }` payload for non-2xx responses.
 */
export async function apiRequest<T>(path: string, { method = 'GET', query, body, signal }: RequestOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}${toSearchParams(query)}`, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.')
  }

  if (response.status === 204) return undefined as T

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) throw toApiError(response.status, payload)
  return payload as T
}

/** Converts an error response into an {@link ApiError}, tolerating non-JSON bodies. */
function toApiError(status: number, payload: unknown): ApiError {
  const error = (payload as Partial<ApiErrorBody> | null)?.error
  if (error?.code && error.message) return new ApiError(status, error.code, error.message, error.issues)
  return new ApiError(status, 'INTERNAL_ERROR', `Unexpected server response (${status}).`)
}
