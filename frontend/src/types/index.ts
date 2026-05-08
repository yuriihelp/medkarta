export interface User {
  id: string
  phone: string
  full_name: string
  birth_date: string | null
  created_at: string
}

export type RecordType = 'analysis' | 'prescription' | 'discharge' | 'vaccination' | 'imaging' | 'other'

export interface MedicalRecord {
  id: string
  user_id: string
  type: RecordType
  title: string
  date: string
  source: string
  summary: string | null
  file_url: string | null
  ai_interpreted: boolean
  created_at: string
  indicators?: Indicator[]
}

export interface Indicator {
  name: string
  value: number
  unit: string
  ref_min: number | null
  ref_max: number | null
  status: 'normal' | 'low' | 'high'
}

export interface QRToken {
  id: string
  token: string
  mode: 'single' | 'permanent' | 'partial'
  expires_at: string | null
  accessed_by: string | null
  created_at: string
}

export interface MarketplaceItem {
  id: string
  type: 'pharmacy' | 'lab' | 'doctor'
  name: string
  address: string
  distance_km: number
  price: number | null
  rating: number | null
}

export interface AuthTokens {
  access_token: string
  token_type: string
}
