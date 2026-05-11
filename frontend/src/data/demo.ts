// Demo data for testing both male and female dashboards without a backend

export async function isDemoMode(storage: { getItem: (k: string) => Promise<string | null> }) {
  const token = await storage.getItem('access_token')
  return token === 'demo_male_token' || token === 'demo_female_token'
}

export async function getDemoGender(storage: { getItem: (k: string) => Promise<string | null> }) {
  const token = await storage.getItem('access_token')
  return token === 'demo_female_token' ? 'female' : 'male'
}

// ─── Vaccinations ────────────────────────────────────────────────────────────

export const DEMO_VACCINATIONS_MALE = [
  { id: 'v1', vaccine_key: 'flu',     vaccine_name: 'Грипп',   dose_number: 'ежегодно', date_given: '2025-10-20', clinic: 'Поликлиника №3' },
  { id: 'v2', vaccine_key: 'covid19', vaccine_name: 'COVID-19', dose_number: '1',        date_given: '2025-04-15', clinic: 'Городская больница' },
  { id: 'v3', vaccine_key: 'covid19', vaccine_name: 'COVID-19', dose_number: '2',        date_given: '2025-05-06', clinic: 'Городская больница' },
  { id: 'v4', vaccine_key: 'dtp',     vaccine_name: 'АДС-М (столбняк/дифтерия)', dose_number: 'взр. (АДС-М)', date_given: '2020-06-10', clinic: 'Поликлиника №3' },
]

export const DEMO_VACCINATIONS_FEMALE = [
  { id: 'v1', vaccine_key: 'flu',     vaccine_name: 'Грипп',   dose_number: 'ежегодно', date_given: '2025-10-15', clinic: 'Женская консультация №2' },
  { id: 'v2', vaccine_key: 'hpv',     vaccine_name: 'ВПЧ',     dose_number: '1',        date_given: '2024-03-10', clinic: 'Частная клиника' },
  { id: 'v3', vaccine_key: 'hpv',     vaccine_name: 'ВПЧ',     dose_number: '2',        date_given: '2024-09-12', clinic: 'Частная клиника' },
  { id: 'v4', vaccine_key: 'covid19', vaccine_name: 'COVID-19', dose_number: '1',        date_given: '2025-05-20', clinic: 'Городская больница' },
  { id: 'v5', vaccine_key: 'dtp',     vaccine_name: 'АДС-М (столбняк/дифтерия)', dose_number: 'взр. (АДС-М)', date_given: '2018-08-01', clinic: 'Поликлиника №7' },
]

// ─── Appointments ─────────────────────────────────────────────────────────────

export const DEMO_APPOINTMENTS_MALE = [
  {
    id: 'a1', date: '2026-05-20', time: '10:00',
    doctor_name: 'Соколов Андрей Викторович',
    specialty: 'Кардиолог', clinic: 'Клиника "Медицина"',
    notes: 'Плановый осмотр, взять направление на ЭКГ', is_done: false, reminder_sent: false,
  },
  {
    id: 'a2', date: '2026-06-03', time: '09:30',
    doctor_name: 'Фёдоров Игорь Сергеевич',
    specialty: 'Стоматолог', clinic: 'СтомаКлиника Центр',
    notes: 'Чистка и осмотр', is_done: false, reminder_sent: false,
  },
  {
    id: 'a3', date: '2026-03-15', time: '09:30',
    doctor_name: 'Петрова Светлана Игоревна',
    specialty: 'Терапевт', clinic: 'Поликлиника №3',
    notes: null, is_done: true, reminder_sent: true,
  },
  {
    id: 'a4', date: '2026-01-10', time: '11:00',
    doctor_name: 'Козлов Владимир Петрович',
    specialty: 'Офтальмолог', clinic: 'Глазной центр',
    notes: 'Проверка зрения, подбор линз', is_done: true, reminder_sent: true,
  },
]

export const DEMO_APPOINTMENTS_FEMALE = [
  {
    id: 'a1', date: '2026-05-22', time: '11:00',
    doctor_name: 'Смирнова Ольга Николаевна',
    specialty: 'Гинеколог-акушер', clinic: 'Женская консультация №2',
    notes: 'Плановый осмотр, 19 неделя', is_done: false, reminder_sent: false,
  },
  {
    id: 'a2', date: '2026-05-28', time: '14:00',
    doctor_name: 'УЗИ плода',
    specialty: 'УЗИ-диагностика', clinic: 'Диагностический центр "Медика"',
    notes: 'Скрининг II триместра', is_done: false, reminder_sent: false,
  },
  {
    id: 'a3', date: '2026-06-15', time: '10:30',
    doctor_name: 'Волкова Татьяна Михайловна',
    specialty: 'Терапевт', clinic: 'Поликлиника №7',
    notes: 'Анализы крови, ОАМ', is_done: false, reminder_sent: false,
  },
  {
    id: 'a4', date: '2026-04-10', time: '09:00',
    doctor_name: 'Новикова Алина Сергеевна',
    specialty: 'Терапевт', clinic: 'Поликлиника №7',
    notes: null, is_done: true, reminder_sent: true,
  },
  {
    id: 'a5', date: '2026-02-14', time: '12:00',
    doctor_name: 'Смирнова Ольга Николаевна',
    specialty: 'Гинеколог-акушер', clinic: 'Женская консультация №2',
    notes: 'Постановка на учёт по беременности', is_done: true, reminder_sent: true,
  },
]

// ─── Women's health ───────────────────────────────────────────────────────────

export const DEMO_CYCLES = [
  { id: 'c1', start_date: '2025-12-03', end_date: '2025-12-07', symptoms: ['headache'], notes: null },
  { id: 'c2', start_date: '2025-11-05', end_date: '2025-11-09', symptoms: [], notes: null },
  { id: 'c3', start_date: '2025-10-08', end_date: '2025-10-12', symptoms: ['cramps', 'fatigue'], notes: 'Болезненные' },
]

export const DEMO_PREGNANCY = {
  id: 'p1',
  user_id: 'demo',
  lmp_date: '2026-01-05',
  due_date: '2026-10-12',
  is_active: true,
  child_name: null,
  child_gender: 'unknown' as const,
  created_at: '2026-02-14T12:00:00',
}

export const DEMO_WOMEN_STATUS_FEMALE = {
  pregnancy: DEMO_PREGNANCY,
  last_cycle: DEMO_CYCLES[0],
  cycles: DEMO_CYCLES,
}

// ─── Medical records (for dashboard) ─────────────────────────────────────────

export const DEMO_RECORDS_MALE = [
  {
    id: 'r1', type: 'analysis', title: 'Липидный панель', date: '2026-03-10',
    source: 'Поликлиника №3', summary: 'Холестерин: 5.2 ммоль/л (норма). ЛПНП: 3.1 ммоль/л. ЛПВП: 1.4 ммоль/л.',
    indicators: [
      { name: 'Холестерин общий', value: 5.2, unit: 'ммоль/л', ref_min: 0, ref_max: 5.2, status: 'normal' },
      { name: 'ЛПНП', value: 3.1, unit: 'ммоль/л', ref_min: 0, ref_max: 3.5, status: 'normal' },
      { name: 'ЛПВП', value: 1.4, unit: 'ммоль/л', ref_min: 1.0, ref_max: 99, status: 'normal' },
      { name: 'Триглицериды', value: 1.8, unit: 'ммоль/л', ref_min: 0, ref_max: 1.7, status: 'high' },
    ],
  },
  {
    id: 'r2', type: 'analysis', title: 'Общий анализ крови', date: '2026-01-05',
    source: 'Лаборатория Гемотест', summary: 'Гемоглобин и лейкоциты в норме. Незначительное снижение тромбоцитов.',
    indicators: [
      { name: 'Гемоглобин', value: 148, unit: 'г/л', ref_min: 130, ref_max: 175, status: 'normal' },
      { name: 'Лейкоциты', value: 6.2, unit: '10⁹/л', ref_min: 4.0, ref_max: 9.0, status: 'normal' },
      { name: 'Тромбоциты', value: 145, unit: '10⁹/л', ref_min: 150, ref_max: 400, status: 'low' },
      { name: 'СОЭ', value: 8, unit: 'мм/ч', ref_min: 0, ref_max: 15, status: 'normal' },
    ],
  },
  {
    id: 'r3', type: 'imaging', title: 'ЭКГ', date: '2026-01-10',
    source: 'Клиника "Медицина"', summary: 'Синусовый ритм, ЧСС 72 уд/мин. Без патологий.',
    indicators: [],
  },
]

export const DEMO_RECORDS_FEMALE = [
  {
    id: 'r1', type: 'analysis', title: 'Общий анализ крови', date: '2026-04-10',
    source: 'Поликлиника №7', summary: 'Лёгкая анемия — гемоглобин снижен. Рекомендован препарат железа.',
    indicators: [
      { name: 'Гемоглобин', value: 108, unit: 'г/л', ref_min: 120, ref_max: 160, status: 'low' },
      { name: 'Лейкоциты', value: 8.4, unit: '10⁹/л', ref_min: 4.0, ref_max: 9.0, status: 'normal' },
      { name: 'Тромбоциты', value: 280, unit: '10⁹/л', ref_min: 150, ref_max: 400, status: 'normal' },
      { name: 'Ферритин', value: 6, unit: 'нг/мл', ref_min: 12, ref_max: 150, status: 'low' },
    ],
  },
  {
    id: 'r2', type: 'analysis', title: 'ТТГ (щитовидная железа)', date: '2026-02-20',
    source: 'Лаборатория Инвитро', summary: 'ТТГ в норме для беременных — 1.8 мМЕ/л.',
    indicators: [
      { name: 'ТТГ', value: 1.8, unit: 'мМЕ/л', ref_min: 0.1, ref_max: 4.0, status: 'normal' },
      { name: 'Т4 свободный', value: 14.2, unit: 'пмоль/л', ref_min: 9.0, ref_max: 22.0, status: 'normal' },
    ],
  },
  {
    id: 'r3', type: 'analysis', title: 'Биохимия крови', date: '2026-02-14',
    source: 'Женская консультация №2', summary: 'Показатели в норме. АЛТ и АСТ незначительно повышены.',
    indicators: [
      { name: 'Глюкоза', value: 4.8, unit: 'ммоль/л', ref_min: 3.9, ref_max: 6.1, status: 'normal' },
      { name: 'АЛТ', value: 42, unit: 'Ед/л', ref_min: 0, ref_max: 35, status: 'high' },
      { name: 'АСТ', value: 38, unit: 'Ед/л', ref_min: 0, ref_max: 35, status: 'high' },
      { name: 'Билирубин общий', value: 10.2, unit: 'мкмоль/л', ref_min: 0, ref_max: 20.5, status: 'normal' },
    ],
  },
]
