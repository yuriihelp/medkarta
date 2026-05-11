import axios from 'axios'
import { Platform } from 'react-native'
import { storage } from '../lib/storage'

// EXPO_PUBLIC_API_URL — set to https://yourdomain.com in production
// Web: use relative /api (proxied by Nginx)
// Mobile dev: fallback to localhost; in prod set EXPO_PUBLIC_API_URL
const PROD_URL = process.env.EXPO_PUBLIC_API_URL
const BASE_URL = Platform.OS === 'web'
  ? (PROD_URL ? `${PROD_URL}/api` : '/api')
  : (PROD_URL ? `${PROD_URL}/api` : 'http://localhost:8000/api')

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await storage.deleteItem('access_token')
      // Expo Router redirect handled in _layout
    }
    return Promise.reject(err)
  },
)

export const authApi = {
  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }),
  register: (phone: string, password: string, full_name: string) =>
    api.post('/auth/register', { phone, password, full_name }),
  me: () => api.get('/auth/me'),
}

export const recordsApi = {
  list: (params?: { type?: string; limit?: number; offset?: number }) =>
    api.get('/records', { params }),
  get: (id: string) => api.get(`/records/${id}`),
  create: (data: object) => api.post('/records', data),
  delete: (id: string) => api.delete(`/records/${id}`),
  upload: (formData: FormData) =>
    api.post('/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const aiApi = {
  chat: (message: string, record_id?: string) =>
    api.post('/ai/chat', { message, record_id }),
}

export const accessApi = {
  listTokens: () => api.get('/access/tokens'),
  createToken: (mode: string, expires_hours?: number) =>
    api.post('/access/tokens', { mode, expires_hours }),
  revokeToken: (id: string) => api.delete(`/access/tokens/${id}`),
}

export const marketplaceApi = {
  pharmacies: (query?: string) => api.get('/marketplace/pharmacies', { params: { query } }),
  labs: () => api.get('/marketplace/labs'),
  doctors: (specialty?: string) => api.get('/marketplace/doctors', { params: { specialty } }),
}

export default api
