import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const getPlayers = (team) =>
  api.get(`/players/${team ? `?team=${team}` : ''}`).then(r => r.data)

export const getTeams = () =>
  api.get('/players/teams/').then(r => r.data)

export const getFixtures = (team, completed) =>
  api.get(`/fixtures/?team=${team || ''}&completed=${completed ?? ''}`).then(r => r.data)

export const getNews = () =>
  api.get('/news/').then(r => r.data)

export const getArticle = (slug) =>
  api.get(`/news/${slug}/`).then(r => r.data)

export const getSponsors = () =>
  api.get('/sponsors/').then(r => r.data)