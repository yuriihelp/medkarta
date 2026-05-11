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

export interface MenstrualCycle {
  id: string
  user_id: string
  start_date: string
  end_date: string | null
  symptoms: string[]
  notes: string | null
  created_at: string
}

export interface Pregnancy {
  id: string
  user_id: string
  lmp_date: string
  due_date: string
  is_active: boolean
  child_name: string | null
  child_gender: 'unknown' | 'boy' | 'girl' | null
  created_at: string
}

export interface WomenStatus {
  is_pregnant: boolean
  active_pregnancy: Pregnancy | null
  last_cycle: MenstrualCycle | null
  avg_cycle_length: number
}

export interface Appointment {
  id: string
  user_id: string
  date: string
  time: string | null
  doctor_name: string
  specialty: string | null
  clinic: string | null
  notes: string | null
  is_done: boolean
  reminder_sent: boolean
  created_at: string
}

export interface VaccinationRecord {
  id: string
  user_id: string
  vaccine_key: string
  vaccine_name: string
  dose_number: string
  date_given: string
  clinic: string | null
  batch_number: string | null
  created_at: string
}
