import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth } from './auth'

const mockGetUser = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/test', { headers })
}

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no Authorization header is present', async () => {
    const req = makeRequest()
    const result = await requireAuth(req as any)

    expect(result.user).toBeNull()
    expect(result.error).toBeDefined()
    const body = await result.error!.json()
    expect(body.error).toBe('Missing authorization')
    expect(result.error!.status).toBe(401)
  })

  it('returns 401 when Authorization header has wrong format', async () => {
    const req = makeRequest({ Authorization: 'Basic abc123' })
    const result = await requireAuth(req as any)

    expect(result.user).toBeNull()
    expect(result.error).toBeDefined()
    const body = await result.error!.json()
    expect(body.error).toBe('Missing authorization')
  })

  it('returns 401 when token is invalid (supabase error)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token'),
    })

    const req = makeRequest({ Authorization: 'Bearer invalid-token' })
    const result = await requireAuth(req as any)

    expect(result.user).toBeNull()
    expect(result.error).toBeDefined()
    const body = await result.error!.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when user is null', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const req = makeRequest({ Authorization: 'Bearer some-token' })
    const result = await requireAuth(req as any)

    expect(result.user).toBeNull()
    expect(result.error).toBeDefined()
  })

  it('returns user when token is valid', async () => {
    const fakeUser = { id: 'user-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({
      data: { user: fakeUser },
      error: null,
    })

    const req = makeRequest({ Authorization: 'Bearer valid-token' })
    const result = await requireAuth(req as any)

    expect(result.user).toEqual(fakeUser)
    expect(result.error).toBeNull()
  })
})
