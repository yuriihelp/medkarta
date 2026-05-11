// Demo data for testing both male and female dashboards without a backend

export async function isDemoMode(storage: { getItem: (k: string) => Promise<string | null> }) {
  const token = await storage.getItem('access_token')
  return token === 'demo_male_token' || token === 'demo_female_token' || token === 'demo_female2_token'
}

export async function getDemoGender(storage: { getItem: (k: string) => Promise<string | null> }) {
  const token = await storage.getItem('access_token')
  return (token === 'demo_female_token' || token === 'demo_female2_token') ? 'female' : 'male'
}

// Returns 'male' | 'female_pregnant' | 'female_cycle' for demo users, null for real users
export async function getDemoType(storage: { getItem: (k: string) => Promise<string | null> }) {
  const token = await storage.getItem('access_token')
  if (token === 'demo_male_token') return 'male' as const
  if (token === 'demo_female_token') return 'female_pregnant' as const
  if (token === 'demo_female2_token') return 'female_cycle' as const
  return null
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
  is_pregnant: true,
  active_pregnancy: DEMO_PREGNANCY,
  last_cycle: DEMO_CYCLES[0],
  avg_cycle_length: 28,
}

// ─── Medical records (for dashboard) ─────────────────────────────────────────

export const DEMO_RECORDS_MALE = [
  // Latest lipid panel — slight improvement after diet
  {
    id: 'r1', type: 'analysis', title: 'Липидный панель', date: '2026-03-10',
    source: 'Поликлиника №3', summary: 'Холестерин: 5.2 ммоль/л (норма). Триглицериды снизились по сравнению с прошлым разом.',
    indicators: [
      { name: 'Холестерин общий', value: 5.2, unit: 'ммоль/л', ref_min: 0, ref_max: 5.2, status: 'normal' },
      { name: 'ЛПНП', value: 3.1, unit: 'ммоль/л', ref_min: 0, ref_max: 3.5, status: 'normal' },
      { name: 'ЛПВП', value: 1.4, unit: 'ммоль/л', ref_min: 1.0, ref_max: 99, status: 'normal' },
      { name: 'Триглицериды', value: 1.8, unit: 'ммоль/л', ref_min: 0, ref_max: 1.7, status: 'high' },
    ],
  },
  // Earlier lipid panel — higher values before diet correction
  {
    id: 'r1b', type: 'analysis', title: 'Липидный панель', date: '2025-09-15',
    source: 'Поликлиника №3', summary: 'Холестерин незначительно повышен. Триглицериды повышены.',
    indicators: [
      { name: 'Холестерин общий', value: 5.6, unit: 'ммоль/л', ref_min: 0, ref_max: 5.2, status: 'high' },
      { name: 'ЛПНП', value: 3.7, unit: 'ммоль/л', ref_min: 0, ref_max: 3.5, status: 'high' },
      { name: 'ЛПВП', value: 1.2, unit: 'ммоль/л', ref_min: 1.0, ref_max: 99, status: 'normal' },
      { name: 'Триглицериды', value: 2.3, unit: 'ммоль/л', ref_min: 0, ref_max: 1.7, status: 'high' },
    ],
  },
  // Latest CBC
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
  // CBC a year ago
  {
    id: 'r2b', type: 'analysis', title: 'Общий анализ крови', date: '2025-05-20',
    source: 'Лаборатория Гемотест', summary: 'Все показатели в норме.',
    indicators: [
      { name: 'Гемоглобин', value: 152, unit: 'г/л', ref_min: 130, ref_max: 175, status: 'normal' },
      { name: 'Лейкоциты', value: 5.8, unit: '10⁹/л', ref_min: 4.0, ref_max: 9.0, status: 'normal' },
      { name: 'Тромбоциты', value: 210, unit: '10⁹/л', ref_min: 150, ref_max: 400, status: 'normal' },
      { name: 'СОЭ', value: 6, unit: 'мм/ч', ref_min: 0, ref_max: 15, status: 'normal' },
    ],
  },
  {
    id: 'r3', type: 'imaging', title: 'ЭКГ', date: '2026-01-10',
    source: 'Клиника "Медицина"', summary: 'Синусовый ритм, ЧСС 72 уд/мин. Без патологий.',
    indicators: [],
  },
]

// ─── Doctor documents (for analytics page) ───────────────────────────────────

export interface DemoDocument {
  id: string
  title: string
  date: string
  doctor: string
  specialty: string
  clinic: string
  summary: string
  fullText: string
  tags: string[]
  type: 'conclusion' | 'analysis' | 'imaging' | 'prescription'
}

export const DEMO_DOCUMENTS_MALE: DemoDocument[] = [
  {
    id: 'd1',
    title: 'Заключение кардиолога',
    date: '2026-01-10',
    doctor: 'Соколов А.В.',
    specialty: 'Кардиология',
    clinic: 'Клиника «Медицина»',
    summary: 'Синусовый ритм. Признаков ИБС не выявлено. Рекомендовано снижение уровня триглицеридов.',
    fullText: `ЗАКЛЮЧЕНИЕ КАРДИОЛОГА
Дата: 10.01.2026
Пациент: Петров И.С., 35 лет

Жалобы: периодические боли в грудной клетке при физической нагрузке.

Обследование:
- АД: 125/80 мм рт. ст.
- ЧСС: 72 уд/мин
- ЭКГ: синусовый ритм, нормальная ЭОС, без патологических изменений

Заключение: Функциональная кардиалгия. Признаков ИБС, аритмии не выявлено.
Триглицериды незначительно повышены (1.8 ммоль/л).

Рекомендации:
1. Диета с ограничением жиров животного происхождения
2. Аэробные нагрузки 3 раза в неделю
3. Контроль липидограммы через 3 месяца
4. Повторная консультация через 6 месяцев`,
    tags: ['#кардиология', '#сердце', '#ЭКГ', '#холестерин', '#профилактика'],
    type: 'conclusion',
  },
  {
    id: 'd2',
    title: 'Результаты липидограммы',
    date: '2026-03-10',
    doctor: 'Лаборатория',
    specialty: 'Лабораторная диагностика',
    clinic: 'Поликлиника №3',
    summary: 'Общий холестерин в норме, триглицериды незначительно повышены.',
    fullText: `ЛИПИДНЫЙ ПРОФИЛЬ
Дата: 10.03.2026

Холестерин общий:     5.2 ммоль/л   (норма < 5.2)   ✓ норма
ЛПНП («плохой»):     3.1 ммоль/л   (норма < 3.5)   ✓ норма
ЛПВП («хороший»):    1.4 ммоль/л   (норма > 1.0)   ✓ норма
Триглицериды:         1.8 ммоль/л   (норма < 1.7)   ↑ незначительно повышены
Коэф. атерогенности: 2.7           (норма < 3.0)   ✓ норма

Интерпретация: Незначительное повышение триглицеридов. Рекомендуется
ограничение быстрых углеводов и алкоголя.`,
    tags: ['#анализ_крови', '#холестерин', '#липиды', '#кардиология', '#биохимия'],
    type: 'analysis',
  },
  {
    id: 'd3',
    title: 'Заключение офтальмолога',
    date: '2026-01-10',
    doctor: 'Козлов В.П.',
    specialty: 'Офтальмология',
    clinic: 'Глазной центр',
    summary: 'Миопия слабой степени OD -1.5, OS -1.25. Рекомендована коррекция.',
    fullText: `ЗАКЛЮЧЕНИЕ ОФТАЛЬМОЛОГА
Дата: 10.01.2026
Пациент: Петров И.С.

Острота зрения без коррекции: OD 0.4 / OS 0.5
Острота зрения с коррекцией: OD 1.0 / OS 1.0

Рефракция: OD sph -1.5 D / OS sph -1.25 D

Глазное дно: без патологии
ВГД: OD 15 мм рт. ст. / OS 14 мм рт. ст. (норма)

Диагноз: Миопия слабой степени OU
Рекомендации: очки или КЛ для постоянного ношения, контроль 1 раз в год`,
    tags: ['#зрение', '#офтальмология', '#миопия', '#глаза'],
    type: 'conclusion',
  },
]

export const DEMO_DOCUMENTS_FEMALE: DemoDocument[] = [
  {
    id: 'd1',
    title: 'Заключение гинеколога-акушера',
    date: '2026-02-14',
    doctor: 'Смирнова О.Н.',
    specialty: 'Гинекология / Акушерство',
    clinic: 'Женская консультация №2',
    summary: 'Беременность 6 недель. Постановка на учёт. Назначены витамины и анализы.',
    fullText: `ЗАКЛЮЧЕНИЕ ГИНЕКОЛОГА-АКУШЕРА
Дата: 14.02.2026
Пациентка: Иванова М.А., 30 лет

Срок беременности: 6 недель (по дате последней менструации 05.01.2026)
ПДР: 12.10.2026

УЗИ (6 нед.): Беременность маточная, одноплодная. КТР эмбриона 7 мм.
Сердцебиение определяется, ЧСС 122 уд/мин.

Назначено:
- Фолиевая кислота 400 мкг/сут
- Йодомарин 200 мкг/сут
- Витамин D3 2000 МЕ/сут

Анализы: ОАК, ОАМ, группа крови, TORCH, ВИЧ, RW, гепатиты B и C, ТТГ

Следующий осмотр: в 10 недель`,
    tags: ['#беременность', '#гинекология', '#акушерство', '#1_триместр', '#УЗИ'],
    type: 'conclusion',
  },
  {
    id: 'd2',
    title: 'Общий анализ крови',
    date: '2026-04-10',
    doctor: 'Новикова А.С.',
    specialty: 'Терапевт',
    clinic: 'Поликлиника №7',
    summary: 'Железодефицитная анемия лёгкой степени. Назначены препараты железа.',
    fullText: `ОБЩИЙ АНАЛИЗ КРОВИ
Дата: 10.04.2026
Срок беременности: ~14 недель

Гемоглобин:     108 г/л    (норма беременных 110–140)   ↓ снижен
Эритроциты:     3.6×10¹²   (норма 3.5–4.7)             ✓ норма
Лейкоциты:      8.4×10⁹    (норма 4.0–9.0)             ✓ норма
Тромбоциты:     280×10⁹    (норма 150–400)             ✓ норма
СОЭ:            24 мм/ч    (норма до 30 при берем.)    ✓ норма
Ферритин:       6 нг/мл    (норма >12)                 ↓ снижен

Заключение: Железодефицитная анемия лёгкой степени (гестационная).

Назначено:
- Сорбифер Дурулес 100 мг 2 раза/день
- Контроль ОАК через 4 недели`,
    tags: ['#анализ_крови', '#анемия', '#железо', '#беременность', '#2_триместр'],
    type: 'analysis',
  },
  {
    id: 'd3',
    title: 'УЗИ плода (I скрининг)',
    date: '2026-03-12',
    doctor: 'Орлова Е.В.',
    specialty: 'УЗИ-диагностика',
    clinic: 'Диагностический центр «Медика»',
    summary: 'Беременность 11 нед. Воротниковое пространство 1.5 мм — норма. Патологий не выявлено.',
    fullText: `УЗИ ПЛОДА — I СКРИНИНГ
Дата: 12.03.2026
Срок: 11 нед. 3 дня (по данным УЗИ)

Плод 1: положение — продольное
КТР: 52 мм (соответствует 11 нед. 3 дня)
ТВП (воротниковое пространство): 1.5 мм (норма < 2.5 мм) ✓
Носовая кость: визуализируется ✓
ЧСС плода: 162 уд/мин ✓

Хорион: по передней стенке, без отслойки
Амниотическая жидкость: нормальное количество

Заключение: Беременность 11–12 недель. Данных за хромосомную
патологию при ультразвуковом исследовании не получено.
Рекомендован биохимический скрининг (PAPP-A, ХГЧ).`,
    tags: ['#УЗИ', '#плод', '#беременность', '#скрининг', '#1_триместр'],
    type: 'imaging',
  },
  {
    id: 'd4',
    title: 'Анализ ТТГ и гормонов щитовидной железы',
    date: '2026-02-20',
    doctor: 'Лаборатория Инвитро',
    specialty: 'Эндокринология',
    clinic: 'Инвитро',
    summary: 'ТТГ 1.8 мМЕ/л — норма для I триместра. Функция щитовидной железы не нарушена.',
    fullText: `ГОРМОНЫ ЩИТОВИДНОЙ ЖЕЛЕЗЫ
Дата: 20.02.2026

ТТГ:           1.8 мМЕ/л  (норма I трим.: 0.1–2.5)   ✓ норма
Т4 свободный:  14.2 пмоль/л (норма 9.0–22.0)          ✓ норма
АТ к ТПО:      < 5 МЕ/мл  (норма < 35)               ✓ норма

Заключение: Функция щитовидной железы в норме.
Аутоиммунный тиреоидит не выявлен.
Дополнительного обследования не требуется.
Рекомендован контроль ТТГ в III триместре.`,
    tags: ['#щитовидная_железа', '#ТТГ', '#гормоны', '#эндокринология', '#беременность'],
    type: 'analysis',
  },
]

export const DEMO_RECORDS_FEMALE = [
  // Latest CBC (pregnancy, 14 weeks — anemia detected)
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
  // Earlier CBC (before pregnancy — normal hemoglobin)
  {
    id: 'r1b', type: 'analysis', title: 'Общий анализ крови', date: '2025-11-15',
    source: 'Поликлиника №7', summary: 'Все показатели в норме.',
    indicators: [
      { name: 'Гемоглобин', value: 128, unit: 'г/л', ref_min: 120, ref_max: 160, status: 'normal' },
      { name: 'Лейкоциты', value: 5.9, unit: '10⁹/л', ref_min: 4.0, ref_max: 9.0, status: 'normal' },
      { name: 'Тромбоциты', value: 245, unit: '10⁹/л', ref_min: 150, ref_max: 400, status: 'normal' },
      { name: 'Ферритин', value: 18, unit: 'нг/мл', ref_min: 12, ref_max: 150, status: 'normal' },
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

// ─── Demo account: Анна Соколова — female, no pregnancy, cycle tracking ───────

export const DEMO_CYCLES_FEMALE2 = [
  { id: 'c1', start_date: '2026-04-15', end_date: '2026-04-19', symptoms: [], notes: null },
  { id: 'c2', start_date: '2026-03-17', end_date: '2026-03-21', symptoms: ['cramps'], notes: 'Умеренно болезненные' },
  { id: 'c3', start_date: '2026-02-16', end_date: '2026-02-20', symptoms: [], notes: null },
  { id: 'c4', start_date: '2026-01-18', end_date: '2026-01-22', symptoms: ['fatigue', 'headache'], notes: null },
  { id: 'c5', start_date: '2025-12-20', end_date: '2025-12-24', symptoms: [], notes: null },
]

export const DEMO_WOMEN_STATUS_FEMALE2 = {
  is_pregnant: false,
  active_pregnancy: null,
  last_cycle: DEMO_CYCLES_FEMALE2[0],
  avg_cycle_length: 29,
}

export const DEMO_VACCINATIONS_FEMALE2 = [
  { id: 'v1', vaccine_key: 'flu',     vaccine_name: 'Грипп',    dose_number: 'ежегодно', date_given: '2025-10-05', clinic: 'Поликлиника №5' },
  { id: 'v2', vaccine_key: 'hpv',     vaccine_name: 'ВПЧ',      dose_number: '1',        date_given: '2023-05-15', clinic: 'Частная клиника' },
  { id: 'v3', vaccine_key: 'hpv',     vaccine_name: 'ВПЧ',      dose_number: '2',        date_given: '2023-11-18', clinic: 'Частная клиника' },
  { id: 'v4', vaccine_key: 'hpv',     vaccine_name: 'ВПЧ',      dose_number: '3',        date_given: '2024-05-20', clinic: 'Частная клиника' },
  { id: 'v5', vaccine_key: 'dtp',     vaccine_name: 'АДС-М (столбняк/дифтерия)', dose_number: 'взр. (АДС-М)', date_given: '2021-03-12', clinic: 'Поликлиника №5' },
]

export const DEMO_APPOINTMENTS_FEMALE2 = [
  {
    id: 'a1', date: '2026-05-30', time: '10:00',
    doctor_name: 'Кузнецова Ирина Владимировна',
    specialty: 'Гинеколог', clinic: 'Женская консультация №5',
    notes: 'Плановый осмотр, ПАП-тест', is_done: false, reminder_sent: false,
  },
  {
    id: 'a2', date: '2026-06-10', time: '14:30',
    doctor_name: 'Попова Светлана Геннадьевна',
    specialty: 'Терапевт', clinic: 'Поликлиника №5',
    notes: 'Общий осмотр, анализы', is_done: false, reminder_sent: false,
  },
  {
    id: 'a3', date: '2026-01-20', time: '11:00',
    doctor_name: 'Кузнецова Ирина Владимировна',
    specialty: 'Гинеколог', clinic: 'Женская консультация №5',
    notes: null, is_done: true, reminder_sent: true,
  },
]

export const DEMO_RECORDS_FEMALE2 = [
  // Latest CBC — normal
  {
    id: 'r1', type: 'analysis', title: 'Общий анализ крови', date: '2026-03-20',
    source: 'Лаборатория Гемотест', summary: 'Все показатели в норме.',
    indicators: [
      { name: 'Гемоглобин', value: 131, unit: 'г/л', ref_min: 120, ref_max: 160, status: 'normal' },
      { name: 'Лейкоциты', value: 5.6, unit: '10⁹/л', ref_min: 4.0, ref_max: 9.0, status: 'normal' },
      { name: 'Тромбоциты', value: 230, unit: '10⁹/л', ref_min: 150, ref_max: 400, status: 'normal' },
      { name: 'Ферритин', value: 22, unit: 'нг/мл', ref_min: 12, ref_max: 150, status: 'normal' },
    ],
  },
  // CBC 6 months ago — slightly low ferritin
  {
    id: 'r1b', type: 'analysis', title: 'Общий анализ крови', date: '2025-09-10',
    source: 'Лаборатория Гемотест', summary: 'Ферритин снижен, рекомендовано наблюдение.',
    indicators: [
      { name: 'Гемоглобин', value: 124, unit: 'г/л', ref_min: 120, ref_max: 160, status: 'normal' },
      { name: 'Лейкоциты', value: 6.0, unit: '10⁹/л', ref_min: 4.0, ref_max: 9.0, status: 'normal' },
      { name: 'Тромбоциты', value: 218, unit: '10⁹/л', ref_min: 150, ref_max: 400, status: 'normal' },
      { name: 'Ферритин', value: 10, unit: 'нг/мл', ref_min: 12, ref_max: 150, status: 'low' },
    ],
  },
  // Hormones
  {
    id: 'r2', type: 'analysis', title: 'Гормоны (ФСГ, ЛГ, эстрадиол)', date: '2026-01-20',
    source: 'Женская консультация №5', summary: 'Гормональный фон в норме.',
    indicators: [
      { name: 'ФСГ', value: 6.8, unit: 'мМЕ/мл', ref_min: 3.5, ref_max: 12.5, status: 'normal' },
      { name: 'ЛГ', value: 4.2, unit: 'мМЕ/мл', ref_min: 2.4, ref_max: 12.6, status: 'normal' },
      { name: 'Эстрадиол', value: 210, unit: 'пмоль/л', ref_min: 77, ref_max: 921, status: 'normal' },
    ],
  },
]

export const DEMO_DOCUMENTS_FEMALE2: DemoDocument[] = [
  {
    id: 'd1',
    title: 'Заключение гинеколога',
    date: '2026-01-20',
    doctor: 'Кузнецова И.В.',
    specialty: 'Гинекология',
    clinic: 'Женская консультация №5',
    summary: 'Плановый осмотр. Патологий не выявлено. Рекомендован контроль ферритина.',
    fullText: `ЗАКЛЮЧЕНИЕ ГИНЕКОЛОГА
Дата: 20.01.2026
Пациентка: Соколова А.М., 28 лет

Жалобы: умеренно болезненные менструации, нерегулярность цикла (28–30 дней).

Осмотр: без патологических изменений.
УЗИ ОМТ: матка нормальных размеров, эндометрий 8 мм (фаза)
Яичники: без кист и структурных изменений.

Мазок на флору: 1-я степень чистоты.
ПАП-тест: рекомендован при следующем визите.

Рекомендации:
1. Продолжать вести менструальный дневник
2. Контроль ферритина через 3 мес. (был 10 нг/мл → лёгкий дефицит)
3. Приём железосодержащих продуктов в пищу
4. Повторный осмотр через 6 месяцев`,
    tags: ['#гинекология', '#цикл', '#УЗИ', '#женское_здоровье'],
    type: 'conclusion',
  },
  {
    id: 'd2',
    title: 'Гормональная панель',
    date: '2026-01-20',
    doctor: 'Лаборатория',
    specialty: 'Гормональная диагностика',
    clinic: 'Женская консультация №5',
    summary: 'ФСГ, ЛГ и эстрадиол в пределах нормы. Цикл регулярный.',
    fullText: `ГОРМОНАЛЬНАЯ ПАНЕЛЬ
Дата: 20.01.2026 (3-й день цикла)

ФСГ:        6.8 мМЕ/мл  (норма 3.5–12.5)  ✓ норма
ЛГ:         4.2 мМЕ/мл  (норма 2.4–12.6)  ✓ норма
Эстрадиол: 210 пмоль/л  (норма 77–921)    ✓ норма
Пролактин:  320 мМЕ/л   (норма 102–496)   ✓ норма
АМГ:        3.4 нг/мл   (норма 1.0–3.5)   ✓ норма

Заключение: Гормональный фон соответствует норме для фолликулярной
фазы цикла. Овариальный резерв хороший (АМГ).
Структурных изменений, требующих коррекции, нет.`,
    tags: ['#гормоны', '#ФСГ', '#эстрадиол', '#гинекология', '#цикл'],
    type: 'analysis',
  },
]
