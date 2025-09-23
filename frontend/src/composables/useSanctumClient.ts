const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const findCookieValue = (key: string): string | null => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(key + '='))

  return match ? decodeURIComponent(match.split('=')[1]) : null
}

export const getXsrfToken = (): string | null => findCookieValue('XSRF-TOKEN')

export const ensureCsrfCookie = async () => {
  await fetch(API_BASE_URL + '/sanctum/csrf-cookie', {
    credentials: 'include',
  })
}

type SanctumRequestOptions = {
  requireCsrf?: boolean
}

export const extractErrorMessage = (problem: unknown): string => {
  if (problem && typeof problem === 'object') {
    const candidate = problem as { message?: unknown; errors?: Record<string, unknown> }

    if (candidate.errors && typeof candidate.errors === 'object') {
      for (const value of Object.values(candidate.errors)) {
        if (Array.isArray(value)) {
          const found = value.find((entry) => typeof entry === 'string')
          if (found) {
            return found
          }
        } else if (typeof value === 'string') {
          return value
        }
      }
    }

    if (typeof candidate.message === 'string') {
      return candidate.message
    }
  }

  return 'Something went wrong.'
}

export const sanctumRequest = async <T>(
  path: string,
  init: RequestInit = {},
  options: SanctumRequestOptions = {}
): Promise<T | null> => {
  const requiresCsrf = options.requireCsrf ?? false
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (requiresCsrf) {
    await ensureCsrfCookie()
    const token = getXsrfToken()

    if (!token) {
      throw new Error('Unable to establish CSRF token.')
    }

    headers['X-XSRF-TOKEN'] = token
  }

  if (init.body && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(API_BASE_URL + path, {
    credentials: 'include',
    ...init,
    headers,
  })

  const text = await response.text()

  if (!response.ok) {
    let problem: unknown = null

    if (text) {
      try {
        problem = JSON.parse(text)
      } catch {
        problem = null
      }
    }

    throw new Error(problem ? extractErrorMessage(problem) : 'Request failed.')
  }

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export const withBaseUrl = (path: string) => API_BASE_URL + path
