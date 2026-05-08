import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
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
  upload: (formData: FormData) =>
    api.post('/records/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  create: (data: object) => api.post('/records', data),
  delete: (id: string) => api.delete(`/records/${id}`),
}

export const aiApi = {
  chat: (message: string, record_id?: string) =>
    api.post('/ai/chat', { message, record_id }),
  interpret: (record_id: string) =>
    api.post(`/ai/interpret/${record_id}`),
}

export const accessApi = {
  listTokens: () => api.get('/access/tokens'),
  createToken: (mode: string, expires_hours?: number) =>
    api.post('/access/tokens', { mode, expires_hours }),
  revokeToken: (id: string) => api.delete(`/access/tokens/${id}`),
}

export const marketplaceApi = {
  searchPharmacies: (query: string, lat?: number, lng?: number) =>
    api.get('/marketplace/pharmacies', { params: { query, lat, lng } }),
  searchLabs: (lat?: number, lng?: number) =>
    api.get('/marketplace/labs', { params: { lat, lng } }),
  searchDoctors: (specialty?: string) =>
    api.get('/marketplace/doctors', { params: { specialty } }),
}

export default api
