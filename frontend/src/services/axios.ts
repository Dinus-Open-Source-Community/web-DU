import axios, { AxiosHeaders } from 'axios'
import Cookies from 'js-cookie'

export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080').replace(/\/+$/, '')
export const AUTH_COOKIE_TOKEN = 'du_access_token'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export function getApiAuthToken() {
  return Cookies.get(AUTH_COOKIE_TOKEN) ?? null
}

export function setApiAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

setApiAuthToken(getApiAuthToken())

api.interceptors.request.use((config) => {
  const token = getApiAuthToken()
  const headers = AxiosHeaders.from(config.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else {
    headers.delete('Authorization')
  }

  config.headers = headers
  return config
})
