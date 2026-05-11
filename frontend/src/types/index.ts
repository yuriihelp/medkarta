export type RecordType = 'analysis' | 'prescription' | 'discharge' | 'vaccination' | 'imaging' | 'other'

export interface User {
  id: string
  phone: string
  full_name: string
  birth_date: string | null
  created_at: string
}

export interface Indicator {
  id: string
  name: string
  value: number
  unit: string | null
  ref_min: number | null
  ref_max: number | null
  status: 'normal' | 'low' | 'high'
}

export interface MedicalRecord {
  id: string
  user_id: string
  type: RecordType
  title: string
  date: string
  source: string | null
  summary: string | null
  file_url: string | null
  ai_interpreted: boolean
  created_at: string
  indicators: Indicator[]
}

export interface QRToken {
  id: string
  token: string
  mode: 'single' | 'permanent' | 'partial'
  expires_at: string | null
  accessed_by: string | null
  created_at: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
}
