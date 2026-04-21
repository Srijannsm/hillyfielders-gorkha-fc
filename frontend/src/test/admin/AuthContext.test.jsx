import { render, screen, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { AuthProvider, useAuth, canAccess } from '../../admin/context/AuthContext'

vi.mock('axios')

const USER_KEY = 'gfc_user'

function TestConsumer() {
  const auth = useAuth()
  if (!auth) return <div>no context</div>
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.username : 'null'}</div>
      <button onClick={() => auth.login('admin', 'pass')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts with null user when localStorage is empty', async () => {
    axios.get.mockResolvedValue({ data: {} })
    renderWithProvider()
    await waitFor(() => screen.getByTestId('user'))
    expect(screen.getByTestId('user')).toHaveTextContent('null')
  })

  it('reads stored user from localStorage on mount', async () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ username: 'storeduser', isStaff: true, isSuperAdmin: false, role: 'coach' }))
    axios.get.mockResolvedValue({ data: {} })
    renderWithProvider()
    await waitFor(() => screen.getByTestId('user'))
    expect(screen.getByTestId('user')).toHaveTextContent('storeduser')
  })

  it('clears stale localStorage when server returns 401', async () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ username: 'stale', isStaff: true, isSuperAdmin: false, role: 'coach' }))
    axios.get.mockRejectedValue({ response: { status: 401 } })
    renderWithProvider()
    await waitFor(() => screen.getByTestId('user'))
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(localStorage.getItem(USER_KEY)).toBeNull()
  })

  it('login sets user in state and localStorage', async () => {
    axios.get.mockResolvedValue({ data: {} })
    axios.post.mockResolvedValue({
      data: { username: 'newuser', is_staff: true, is_superuser: false, role: 'secretary' }
    })
    renderWithProvider()
    await waitFor(() => screen.getByTestId('user'))
    await act(async () => {
      screen.getByText('Login').click()
    })
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('newuser'))
    const stored = JSON.parse(localStorage.getItem(USER_KEY))
    expect(stored.username).toBe('newuser')
  })

  it('logout clears user from state and localStorage', async () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ username: 'admin', isStaff: true, isSuperAdmin: false, role: 'secretary' }))
    axios.get.mockResolvedValue({ data: {} })
    axios.post.mockResolvedValue({})
    renderWithProvider()
    await waitFor(() => screen.getByTestId('user'))
    expect(screen.getByTestId('user')).toHaveTextContent('admin')
    await act(async () => {
      screen.getByText('Logout').click()
    })
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('null'))
    expect(localStorage.getItem(USER_KEY)).toBeNull()
  })

  it('logout clears local state even if server request fails', async () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ username: 'admin', isStaff: true, isSuperAdmin: false, role: 'coach' }))
    axios.get.mockResolvedValue({ data: {} })
    axios.post.mockRejectedValue(new Error('Network error'))
    renderWithProvider()
    await waitFor(() => screen.getByTestId('user'))
    await act(async () => {
      screen.getByText('Logout').click()
    })
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('null'))
  })
})

describe('canAccess', () => {
  it('returns false when user is null', () => {
    expect(canAccess(null, 'coach')).toBe(false)
  })

  it('returns true for superadmin regardless of role', () => {
    expect(canAccess({ isSuperAdmin: true, role: 'coach' }, 'secretary')).toBe(true)
  })

  it('returns true when user role matches', () => {
    expect(canAccess({ isSuperAdmin: false, role: 'media_officer' }, 'media_officer')).toBe(true)
  })

  it('returns false when role does not match', () => {
    expect(canAccess({ isSuperAdmin: false, role: 'coach' }, 'secretary', 'media_officer')).toBe(false)
  })

  it('returns true when user role matches one of multiple allowed roles', () => {
    expect(canAccess({ isSuperAdmin: false, role: 'team_manager' }, 'team_manager', 'coach')).toBe(true)
  })
})
