/**
 * Safe Headers Utility
 *
 * Provides helper functions to sanitize headers before making fetch requests.
 * Prevents "invalid header name" errors from empty or undefined keys.
 */

/**
 * Creates a safe Headers object, filtering out invalid entries
 *
 * @param headers - Record of header key-value pairs
 * @returns Headers object with only valid entries
 */
export function createSafeHeaders(headers: Record<string, string | undefined | null>): Headers {
  const safeHeaders = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (!key || key.trim() === "") {
      console.warn("[SafeHeaders] Skipping empty header key")
      continue
    }

    if (value === undefined || value === null || value === "") {
      console.warn(`[SafeHeaders] Skipping header "${key}" with empty value`)
      continue
    }

    try {
      safeHeaders.append(key, value)
    } catch (error) {
      console.warn(`[SafeHeaders] Failed to append header "${key}":`, error)
    }
  }

  return safeHeaders
}

/**
 * Validates and sanitizes a header value
 *
 * @param value - The header value to validate
 * @returns The sanitized value or undefined if invalid
 */
export function sanitizeHeaderValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  const stringValue = String(value).trim()
  return stringValue === "" ? undefined : stringValue
}

/**
 * Creates a safe fetch wrapper that sanitizes headers
 */
export async function safeFetch(
  url: string | URL,
  options?: RequestInit & { headers?: Record<string, string | undefined | null> },
): Promise<Response> {
  const safeOptions: RequestInit = {
    ...options,
  }

  if (options?.headers) {
    if (options.headers instanceof Headers) {
      safeOptions.headers = options.headers
    } else if (Array.isArray(options.headers)) {
      safeOptions.headers = new Headers(options.headers.filter(([key, value]) => key && value))
    } else {
      safeOptions.headers = createSafeHeaders(options.headers as Record<string, string | undefined | null>)
    }
  }

  return fetch(url, safeOptions)
}
