import axios from 'axios'

const TOKEN_KEY   = 'gfc_admin_access'
const REFRESH_KEY = 'gfc_admin_refresh'

const adminApi = axios.create({ baseURL: '/api/admin' })

// Attach JWT token to every request
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
adminApi.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem(REFRESH_KEY)
        const { data } = await axios.post('/api/auth/refresh/', { refresh })
        localStorage.setItem(TOKEN_KEY, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return adminApi(original)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// Dashboard
export const getDashboard = () => adminApi.get('/dashboard/').then(r => r.data)

// Players & Staff
export const getAdminPlayers     = () => adminApi.get('/players/').then(r => r.data)
export const createPlayer        = data => adminApi.post('/players/', data).then(r => r.data)
export const updatePlayer        = (id, data) => adminApi.patch(`/players/${id}/`, data).then(r => r.data)
export const deletePlayer        = id => adminApi.delete(`/players/${id}/`)

export const getAdminStaff       = () => adminApi.get('/staff/').then(r => r.data)
export const createStaff         = data => adminApi.post('/staff/', data).then(r => r.data)
export const updateStaff         = (id, data) => adminApi.patch(`/staff/${id}/`, data).then(r => r.data)
export const deleteStaff         = id => adminApi.delete(`/staff/${id}/`)

// Teams & Programmes
export const getAdminTeams       = () => adminApi.get('/teams/').then(r => r.data)
export const createTeam          = data => adminApi.post('/teams/', data).then(r => r.data)
export const updateTeam          = (id, data) => adminApi.patch(`/teams/${id}/`, data).then(r => r.data)
export const deleteTeam          = id => adminApi.delete(`/teams/${id}/`)

export const getAdminProgrammes  = () => adminApi.get('/programmes/').then(r => r.data)
export const createProgramme     = data => adminApi.post('/programmes/', data).then(r => r.data)
export const updateProgramme     = (id, data) => adminApi.patch(`/programmes/${id}/`, data).then(r => r.data)
export const deleteProgramme     = id => adminApi.delete(`/programmes/${id}/`)

// Fixtures & Competitions
export const getAdminFixtures    = () => adminApi.get('/fixtures/').then(r => r.data)
export const createFixture       = data => adminApi.post('/fixtures/', data).then(r => r.data)
export const updateFixture       = (id, data) => adminApi.patch(`/fixtures/${id}/`, data).then(r => r.data)
export const deleteFixture       = id => adminApi.delete(`/fixtures/${id}/`)

export const getAdminCompetitions= () => adminApi.get('/competitions/').then(r => r.data)
export const createCompetition   = data => adminApi.post('/competitions/', data).then(r => r.data)
export const updateCompetition   = (id, data) => adminApi.patch(`/competitions/${id}/`, data).then(r => r.data)
export const deleteCompetition   = id => adminApi.delete(`/competitions/${id}/`)

// News & Categories
export const getAdminArticles    = () => adminApi.get('/articles/').then(r => r.data)
export const getAdminArticle     = id => adminApi.get(`/articles/${id}/`).then(r => r.data)
export const createArticle       = data => adminApi.post('/articles/', data).then(r => r.data)
export const updateArticle       = (id, data) => adminApi.patch(`/articles/${id}/`, data).then(r => r.data)
export const deleteArticle       = id => adminApi.delete(`/articles/${id}/`)

export const getAdminCategories  = () => adminApi.get('/categories/').then(r => r.data)
export const createCategory      = data => adminApi.post('/categories/', data).then(r => r.data)
export const updateCategory      = (id, data) => adminApi.patch(`/categories/${id}/`, data).then(r => r.data)
export const deleteCategory      = id => adminApi.delete(`/categories/${id}/`)

// Gallery
export const getAdminPhotos      = () => adminApi.get('/photos/').then(r => r.data)
export const createPhoto         = data => adminApi.post('/photos/', data).then(r => r.data)
export const updatePhoto         = (id, data) => adminApi.patch(`/photos/${id}/`, data).then(r => r.data)
export const deletePhoto         = id => adminApi.delete(`/photos/${id}/`)

// Sponsors
export const getAdminSponsors    = () => adminApi.get('/sponsors/').then(r => r.data)
export const createSponsor       = data => adminApi.post('/sponsors/', data).then(r => r.data)
export const updateSponsor       = (id, data) => adminApi.patch(`/sponsors/${id}/`, data).then(r => r.data)
export const deleteSponsor       = id => adminApi.delete(`/sponsors/${id}/`)

// Club Profile
export const getAdminClub        = () => adminApi.get('/club/').then(r => r.data)
export const updateClub          = data => adminApi.patch('/club/', data).then(r => r.data)

export default adminApi
