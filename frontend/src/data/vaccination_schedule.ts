export interface VaccineScheduleItem {
  key: string
  name: string
  shortName: string
  description: string
  doses: VaccineDose[]
  category: 'mandatory' | 'recommended'
  color: string
}

export interface VaccineDose {
  dose: string          // "1", "2", "ревакц. 1" и т.д.
  ageLabel: string      // "3 месяца", "6 лет" и т.д.
  ageMonths: number     // возраст в месяцах для расчётов
  notes?: string
}

export const VACCINATION_SCHEDULE: VaccineScheduleItem[] = [
  {
    key: "hepatitis_b",
    name: "Вирусный гепатит B",
    shortName: "Гепатит B",
    description: "Защищает от вирусного гепатита B — опасного заболевания печени.",
    color: "#0891b2",
    category: "mandatory",
    doses: [
      { dose: "1", ageLabel: "При рождении (первые 24 часа)", ageMonths: 0 },
      { dose: "2", ageLabel: "1 месяц", ageMonths: 1 },
      { dose: "3", ageLabel: "6 месяцев", ageMonths: 6 },
    ],
  },
  {
    key: "bcg",
    name: "Туберкулёз (БЦЖ)",
    shortName: "БЦЖ",
    description: "Защищает от туберкулёза — инфекционного заболевания лёгких.",
    color: "#7c3aed",
    category: "mandatory",
    doses: [
      { dose: "1", ageLabel: "3–7 день жизни", ageMonths: 0 },
      { dose: "ревакц.", ageLabel: "6–7 лет (при отрицательной Манту)", ageMonths: 78, notes: "При отрицательной пробе Манту" },
    ],
  },
  {
    key: "pneumococcal",
    name: "Пневмококковая инфекция",
    shortName: "Пневмококк",
    description: "Защищает от пневмонии, менингита и других тяжёлых инфекций.",
    color: "#d97706",
    category: "mandatory",
    doses: [
      { dose: "1", ageLabel: "2 месяца", ageMonths: 2 },
      { dose: "2", ageLabel: "4,5 месяца", ageMonths: 4 },
      { dose: "ревакц.", ageLabel: "15 месяцев", ageMonths: 15 },
    ],
  },
  {
    key: "dtp",
    name: "Дифтерия, коклюш, столбняк (АКДС)",
    shortName: "АКДС",
    description: "Комбинированная вакцина от трёх опасных инфекций.",
    color: "#dc2626",
    category: "mandatory",
    doses: [
      { dose: "1", ageLabel: "3 месяца", ageMonths: 3 },
      { dose: "2", ageLabel: "4,5 месяца", ageMonths: 4 },
      { dose: "3", ageLabel: "6 месяцев", ageMonths: 6 },
      { dose: "ревакц. 1", ageLabel: "18 месяцев", ageMonths: 18 },
      { dose: "ревакц. 2 (АДС-М)", ageLabel: "6–7 лет", ageMonths: 78 },
      { dose: "ревакц. 3 (АДС-М)", ageLabel: "14 лет", ageMonths: 168 },
      { dose: "взр. (АДС-М)", ageLabel: "Каждые 10 лет", ageMonths: 0, notes: "Взрослым каждые 10 лет" },
    ],
  },
  {
    key: "polio",
    name: "Полиомиелит",
    shortName: "Полио",
    description: "Защищает от полиомиелита — вирусной инфекции, вызывающей паралич.",
    color: "#16a34a",
    category: "mandatory",
    doses: [
      { dose: "1 (ИПВ)", ageLabel: "3 месяца", ageMonths: 3 },
      { dose: "2 (ИПВ)", ageLabel: "4,5 месяца", ageMonths: 4 },
      { dose: "3 (ОПВ)", ageLabel: "6 месяцев", ageMonths: 6 },
      { dose: "ревакц. 1 (ОПВ)", ageLabel: "18 месяцев", ageMonths: 18 },
      { dose: "ревакц. 2 (ОПВ)", ageLabel: "20 месяцев", ageMonths: 20 },
      { dose: "ревакц. 3 (ОПВ)", ageLabel: "14 лет", ageMonths: 168 },
    ],
  },
  {
    key: "hib",
    name: "Гемофильная инфекция (Хиб)",
    shortName: "ХИБ",
    description: "Для детей из групп риска. Защищает от менингита и пневмонии.",
    color: "#0d9488",
    category: "mandatory",
    doses: [
      { dose: "1", ageLabel: "3 месяца", ageMonths: 3, notes: "Группы риска" },
      { dose: "2", ageLabel: "4,5 месяца", ageMonths: 4, notes: "Группы риска" },
      { dose: "3", ageLabel: "6 месяцев", ageMonths: 6, notes: "Группы риска" },
      { dose: "ревакц.", ageLabel: "18 месяцев", ageMonths: 18, notes: "Группы риска" },
    ],
  },
  {
    key: "mmr",
    name: "Корь, краснуха, паротит (КПК)",
    shortName: "КПК",
    description: "Комбинированная вакцина от кори, паротита (свинки) и краснухи.",
    color: "#ec4899",
    category: "mandatory",
    doses: [
      { dose: "1", ageLabel: "12 месяцев", ageMonths: 12 },
      { dose: "ревакц.", ageLabel: "6 лет", ageMonths: 72 },
    ],
  },
  {
    key: "flu",
    name: "Грипп",
    shortName: "Грипп",
    description: "Ежегодная вакцинация. Защищает от актуальных штаммов гриппа сезона.",
    color: "#f59e0b",
    category: "mandatory",
    doses: [
      { dose: "ежегодно", ageLabel: "Ежегодно с 6 месяцев (сентябрь–ноябрь)", ageMonths: 6 },
    ],
  },
  {
    key: "covid19",
    name: "COVID-19",
    shortName: "COVID-19",
    description: "Вакцинация от коронавирусной инфекции. Рекомендована взрослым.",
    color: "#6366f1",
    category: "recommended",
    doses: [
      { dose: "1", ageLabel: "Взрослые (18+)", ageMonths: 216 },
      { dose: "2", ageLabel: "Через 21 день после 1-й дозы", ageMonths: 216 },
      { dose: "ревакц.", ageLabel: "Каждые 6–12 месяцев", ageMonths: 216, notes: "По рекомендации врача" },
    ],
  },
  {
    key: "hpv",
    name: "Вирус папилломы человека (ВПЧ)",
    shortName: "ВПЧ",
    description: "Защищает от рака шейки матки и других онкологических заболеваний, связанных с ВПЧ.",
    color: "#db2777",
    category: "recommended",
    doses: [
      { dose: "1", ageLabel: "12–13 лет (девочки)", ageMonths: 144, notes: "Рекомендована девочкам" },
      { dose: "2", ageLabel: "Через 6 месяцев после 1-й", ageMonths: 150, notes: "Рекомендована девочкам" },
    ],
  },
  {
    key: "hepatitis_a",
    name: "Вирусный гепатит A",
    shortName: "Гепатит A",
    description: "Защищает от гепатита А — инфекции, передающейся через воду и пищу.",
    color: "#0891b2",
    category: "recommended",
    doses: [
      { dose: "1", ageLabel: "С 1 года", ageMonths: 12 },
      { dose: "2", ageLabel: "Через 6–12 месяцев после 1-й", ageMonths: 18 },
    ],
  },
  {
    key: "meningococcal",
    name: "Менингококковая инфекция",
    shortName: "Менингококк",
    description: "Защищает от бактериального менингита — опасного воспаления оболочек мозга.",
    color: "#9f1239",
    category: "recommended",
    doses: [
      { dose: "1", ageLabel: "С 9 месяцев", ageMonths: 9 },
      { dose: "ревакц.", ageLabel: "Перед поступлением в школу", ageMonths: 72 },
    ],
  },
]

/** Get vaccines due in next N months based on birth date and existing records */
export function getUpcomingVaccines(
  birthDate: Date,
  doneKeys: Set<string>,
  monthsAhead = 3,
): { vaccine: VaccineScheduleItem; dose: VaccineDose; dueDate: Date }[] {
  const now = new Date()
  const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth())
  const upcoming: { vaccine: VaccineScheduleItem; dose: VaccineDose; dueDate: Date }[] = []

  for (const vaccine of VACCINATION_SCHEDULE) {
    for (const dose of vaccine.doses) {
      const doseKey = `${vaccine.key}_${dose.dose}`
      if (doneKeys.has(doseKey)) continue
      if (dose.ageMonths === 0) continue // взрослые/особые случаи

      const monthsUntilDue = dose.ageMonths - ageMonths
      if (monthsUntilDue >= 0 && monthsUntilDue <= monthsAhead) {
        const dueDate = new Date(birthDate)
        dueDate.setMonth(dueDate.getMonth() + dose.ageMonths)
        upcoming.push({ vaccine, dose, dueDate })
      }
    }
  }
  return upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}
