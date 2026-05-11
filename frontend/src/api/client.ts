import axios from 'axios'
import { Platform } from 'react-native'
import { storage } from '../lib/storage'

// EXPO_PUBLIC_API_URL — full base without /api suffix, e.g. http://45.80.130.211:8000
const PROD_URL = process.env.EXPO_PUBLIC_API_URL
const BASE_URL = PROD_URL
  ? `${PROD_URL}/api`
  : Platform.OS === 'web'
    ? '/api'
    : 'http://localhost:8000/api'

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
  register: (phone: string, password: string, full_name: string, gender?: string) =>
    api.post('/auth/register', { phone, password, full_name, gender }),
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

export const womenApi = {
  getStatus: () => api.get('/women/status'),
  createCycle: (data: { start_date: string; end_date?: string; symptoms?: string[]; notes?: string }) =>
    api.post('/women/cycles', data),
  updateCycle: (id: string, data: object) => api.put(`/women/cycles/${id}`, data),
  deleteCycle: (id: string) => api.delete(`/women/cycles/${id}`),
  startPregnancy: (data: { lmp_date: string; child_name?: string; child_gender?: string }) =>
    api.post('/women/pregnancy', data),
  updatePregnancy: (id: string, data: object) => api.put(`/women/pregnancy/${id}`, data),
  endPregnancy: (id: string) => api.delete(`/women/pregnancy/${id}`),
}

export const appointmentsApi = {
  list: () => api.get('/appointments'),
  create: (data: { date: string; time?: string; doctor_name: string; specialty?: string; clinic?: string; notes?: string }) =>
    api.post('/appointments', data),
  update: (id: string, data: object) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
}

export const vaccinationsApi = {
  list: () => api.get('/vaccinations'),
  add: (data: { vaccine_key: string; vaccine_name: string; dose_number: string; date_given: string; clinic?: string; batch_number?: string }) =>
    api.post('/vaccinations', data),
  delete: (id: string) => api.delete(`/vaccinations/${id}`),
}

export default api
