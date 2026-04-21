import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to mock axios BEFORE any module imports that use it.
// In Vitest ESM, vi.mock is hoisted to the top of the file.
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal()
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: { use: vi.fn() },
      request: { use: vi.fn() },
    },
  }
  return {
    default: { ...actual.default, create: vi.fn(() => mockInstance) },
    __mockInstance: mockInstance,
  }
})

// Import after vi.mock so the mock is in place at module init time
const adminApiModule = await import('../../admin/services/adminApi.js')
const axios = (await import('axios')).default
const mockInstance = (await import('axios')).__mockInstance

const {
  getDashboard,
  getAdminPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = adminApiModule

describe('adminApi service', () => {
  beforeEach(() => {
    mockInstance.get.mockReset()
    mockInstance.post.mockReset()
    mockInstance.patch.mockReset()
    mockInstance.delete.mockReset()
  })

  it('getDashboard calls GET /dashboard/ and returns data', async () => {
    mockInstance.get.mockResolvedValue({ data: { players: 10, teams: 4 } })
    const result = await getDashboard()
    expect(mockInstance.get).toHaveBeenCalledWith('/dashboard/')
    expect(result.players).toBe(10)
  })

  it('getAdminPlayers calls GET /players/ and extracts results', async () => {
    mockInstance.get.mockResolvedValue({ data: { results: [{ id: 1, name: 'Alice' }] } })
    const result = await getAdminPlayers()
    expect(mockInstance.get).toHaveBeenCalledWith('/players/')
    expect(result).toEqual([{ id: 1, name: 'Alice' }])
  })

  it('createPlayer calls POST /players/ with form data', async () => {
    const formData = new FormData()
    formData.append('name', 'New Player')
    mockInstance.post.mockResolvedValue({ data: { id: 5, name: 'New Player' } })
    const result = await createPlayer(formData)
    expect(mockInstance.post).toHaveBeenCalledWith('/players/', formData)
    expect(result.id).toBe(5)
  })

  it('updatePlayer calls PATCH /players/:id/ with data', async () => {
    mockInstance.patch.mockResolvedValue({ data: { id: 3, name: 'Updated' } })
    const result = await updatePlayer(3, { position: 'MID' })
    expect(mockInstance.patch).toHaveBeenCalledWith('/players/3/', { position: 'MID' })
    expect(result.id).toBe(3)
  })

  it('deletePlayer calls DELETE /players/:id/', async () => {
    mockInstance.delete.mockResolvedValue({})
    await deletePlayer(7)
    expect(mockInstance.delete).toHaveBeenCalledWith('/players/7/')
  })

  it('adminApi instance is created with withCredentials and correct baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: '/api/admin', withCredentials: true })
    )
  })
})
