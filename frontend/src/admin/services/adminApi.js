import axios from 'axios'

const USER_KEY = 'gfc_user'

const adminApi = axios.create({
  baseURL: '/api/admin',
  withCredentials: true,  // send httpOnly auth cookies on every request
})

// Auto-refresh on 401 — the refresh endpoint reads the gfc_refresh cookie
adminApi.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post('/api/auth/refresh/', {}, { withCredentials: true })
        // New gfc_access cookie is now set — retry the original request
        return adminApi(original)
      } catch {
        // Refresh token also expired — send user back to login
        localStorage.removeItem(USER_KEY)
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// List endpoints return paginated { count, next, previous, results: [...] }
const results = r => r.data.results

// Dashboard (aggregation — not a list, not paginated)
export const getDashboard = () => adminApi.get('/dashboard/').then(r => r.data)

// Players & Staff
export const getAdminPlayers     = () => adminApi.get('/players/').then(results)
export const createPlayer        = data => adminApi.post('/players/', data).then(r => r.data)
export const updatePlayer        = (id, data) => adminApi.patch(`/players/${id}/`, data).then(r => r.data)
export const deletePlayer        = id => adminApi.delete(`/players/${id}/`)

export const getAdminStaff       = () => adminApi.get('/staff/').then(results)
export const createStaff         = data => adminApi.post('/staff/', data).then(r => r.data)
export const updateStaff         = (id, data) => adminApi.patch(`/staff/${id}/`, data).then(r => r.data)
export const deleteStaff         = id => adminApi.delete(`/staff/${id}/`)

// Teams & Programmes
export const getAdminTeams       = () => adminApi.get('/teams/').then(results)
export const createTeam          = data => adminApi.post('/teams/', data).then(r => r.data)
export const updateTeam          = (id, data) => adminApi.patch(`/teams/${id}/`, data).then(r => r.data)
export const deleteTeam          = id => adminApi.delete(`/teams/${id}/`)

export const getAdminProgrammes  = () => adminApi.get('/programmes/').then(results)
export const createProgramme     = data => adminApi.post('/programmes/', data).then(r => r.data)
export const updateProgramme     = (id, data) => adminApi.patch(`/programmes/${id}/`, data).then(r => r.data)
export const deleteProgramme     = id => adminApi.delete(`/programmes/${id}/`)

// Fixtures & Competitions
export const getAdminFixtures    = () => adminApi.get('/fixtures/').then(results)
export const createFixture       = data => adminApi.post('/fixtures/', data).then(r => r.data)
export const updateFixture       = (id, data) => adminApi.patch(`/fixtures/${id}/`, data).then(r => r.data)
export const deleteFixture       = id => adminApi.delete(`/fixtures/${id}/`)

export const getAdminCompetitions= () => adminApi.get('/competitions/').then(results)
export const createCompetition   = data => adminApi.post('/competitions/', data).then(r => r.data)
export const updateCompetition   = (id, data) => adminApi.patch(`/competitions/${id}/`, data).then(r => r.data)
export const deleteCompetition   = id => adminApi.delete(`/competitions/${id}/`)

// News & Categories
export const getAdminArticles    = () => adminApi.get('/articles/').then(results)
export const getAdminArticle     = id => adminApi.get(`/articles/${id}/`).then(r => r.data)
export const createArticle       = data => adminApi.post('/articles/', data).then(r => r.data)
export const updateArticle       = (id, data) => adminApi.patch(`/articles/${id}/`, data).then(r => r.data)
export const deleteArticle       = id => adminApi.delete(`/articles/${id}/`)

export const getAdminCategories  = () => adminApi.get('/categories/').then(results)
export const createCategory      = data => adminApi.post('/categories/', data).then(r => r.data)
export const updateCategory      = (id, data) => adminApi.patch(`/categories/${id}/`, data).then(r => r.data)
export const deleteCategory      = id => adminApi.delete(`/categories/${id}/`)

// Gallery
export const getAdminPhotos      = () => adminApi.get('/photos/').then(results)
export const createPhoto         = data => adminApi.post('/photos/', data).then(r => r.data)
export const updatePhoto         = (id, data) => adminApi.patch(`/photos/${id}/`, data).then(r => r.data)
export const deletePhoto         = id => adminApi.delete(`/photos/${id}/`)

// Sponsors
export const getAdminSponsors    = () => adminApi.get('/sponsors/').then(results)
export const createSponsor       = data => adminApi.post('/sponsors/', data).then(r => r.data)
export const updateSponsor       = (id, data) => adminApi.patch(`/sponsors/${id}/`, data).then(r => r.data)
export const deleteSponsor       = id => adminApi.delete(`/sponsors/${id}/`)

// Club Profile (singleton — not a list, not paginated)
export const getAdminClub        = () => adminApi.get('/club/').then(r => r.data)
export const updateClub          = data => adminApi.patch('/club/', data).then(r => r.data)

// Enquiries
export const getAdminEnquiries   = () => adminApi.get('/enquiries/').then(results)
export const markEnquiryRead     = id => adminApi.post(`/enquiries/${id}/mark_read/`).then(r => r.data)
export const markAllEnquiriesRead= () => adminApi.post('/enquiries/mark_all_read/').then(r => r.data)
export const replyToEnquiry      = (id, message) => adminApi.post(`/enquiries/${id}/reply/`, { message }).then(r => r.data)
export const deleteEnquiry       = id => adminApi.delete(`/enquiries/${id}/`)

// Admin Profile
export const getAdminProfile     = () => adminApi.get('/profile/').then(r => r.data)
export const updateAdminProfile  = data => adminApi.patch('/profile/', data).then(r => r.data)

// User Management (Super Admin only)
export const getAdminUsers       = () => adminApi.get('/users/').then(results)
export const createAdminUser     = data => adminApi.post('/users/', data).then(r => r.data)
export const updateAdminUser     = (id, data) => adminApi.patch(`/users/${id}/`, data).then(r => r.data)
export const deleteAdminUser     = id => adminApi.delete(`/users/${id}/`)

export default adminApi
