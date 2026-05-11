import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Alert, Modal, Platform,
} from 'react-native'
import { theme } from '../../src/lib/theme'
import { appointmentsApi, womenApi, vaccinationsApi } from '../../src/api/client'
import { VACCINATION_SCHEDULE } from '../../src/data/vaccination_schedule'
import { storage } from '../../src/lib/storage'

interface Appointment {
  id: string
  date: string
  time: string | null
  doctor_name: string
  specialty: string | null
  clinic: string | null
  notes: string | null
  is_done: boolean
}

interface VaccinationRecord {
  id: string
  vaccine_key: string
  vaccine_name: string
  dose_number: string
  date_given: string
  clinic: string | null
}

interface MenstrualCycle {
  id: string
  start_date: string
  end_date: string | null
}

interface Pregnancy {
  lmp_date: string
  due_date: string
}

interface DayEvent {
  type: 'period' | 'period_predicted' | 'fertile' | 'pregnancy' | 'vaccination' | 'appointment' | 'due'
  label: string
  color: string
  id?: string
}

type ViewMode = 'month' | 'list'

const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function CalendarScreen() {
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([])
  const [cycles, setCycles] = useState<MenstrualCycle[]>([])
  const [pregnancy, setPregnancy] = useState<Pregnancy | null>(null)
  const [gender, setGender] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Add appointment modal
  const [addModal, setAddModal] = useState(false)
  const [apptDate, setApptDate] = useState('')
  const [apptTime, setApptTime] = useState('')
  const [apptDoctor, setApptDoctor] = useState('')
  const [apptSpecialty, setApptSpecialty] = useState('')
  const [apptClinic, setApptClinic] = useState('')
  const [apptNotes, setApptNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const storedGender = await storage.getItem('user_gender')
      setGender(storedGender)
      const [apptRes, vaccRes] = await Promise.all([
        appointmentsApi.list(),
        vaccinationsApi.list(),
      ])
      setAppointments(apptRes.data)
      setVaccinations(vaccRes.data)
      if (storedGender === 'female') {
        const wRes = await womenApi.getStatus()
        setCycles(wRes.data.cycles ?? [])
        setPregnancy(wRes.data.pregnancy)
      }
    } catch {
      // not authenticated or network error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Build event map: key = 'YYYY-MM-DD', value = DayEvent[]
  const eventMap = buildEventMap(cycles, pregnancy, vaccinations, appointments)

  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  function openAddAppt(dateStr?: string) {
    if (dateStr) {
      const parts = dateStr.split('-')
      setApptDate(`${parts[2]}.${parts[1]}.${parts[0]}`)
    } else {
      const t = new Date()
      setApptDate(`${t.getDate().toString().padStart(2, '0')}.${(t.getMonth() + 1).toString().padStart(2, '0')}.${t.getFullYear()}`)
    }
    setApptTime('')
    setApptDoctor('')
    setApptSpecialty('')
    setApptClinic('')
    setApptNotes('')
    setAddModal(true)
  }

  async function saveAppointment() {
    if (!apptDoctor.trim()) {
      Alert.alert('Ошибка', 'Укажите врача')
      return
    }
    const parts = apptDate.split('.')
    if (parts.length !== 3) {
      Alert.alert('Ошибка', 'Введите дату в формате ДД.ММ.ГГГГ')
      return
    }
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`
    if (isNaN(Date.parse(isoDate))) {
      Alert.alert('Ошибка', 'Неверная дата')
      return
    }
    setSaving(true)
    try {
      await appointmentsApi.create({
        date: isoDate,
        time: apptTime || undefined,
        doctor_name: apptDoctor,
        specialty: apptSpecialty || undefined,
        clinic: apptClinic || undefined,
        notes: apptNotes || undefined,
      })
      setAddModal(false)
      await loadData()
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить запись')
    } finally {
      setSaving(false)
    }
  }

  async function toggleApptDone(appt: Appointment) {
    try {
      await appointmentsApi.update(appt.id, { is_done: !appt.is_done })
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, is_done: !a.is_done } : a))
    } catch { /* ignore */ }
  }

  async function deleteAppt(id: string) {
    try {
      await appointmentsApi.delete(id)
      setAppointments(prev => prev.filter(a => a.id !== id))
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Календарь</Text>
        <TouchableOpacity style={styles.addApptBtn} onPress={() => openAddAppt()}>
          <Text style={styles.addApptBtnText}>+ Запись к врачу</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        {(['month', 'list'] as ViewMode[]).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewBtn, viewMode === mode && styles.viewBtnActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.viewBtnText, viewMode === mode && styles.viewBtnTextActive]}>
              {mode === 'month' ? 'Месяц' : 'Список'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Legend */}
        <Legend gender={gender} />

        {viewMode === 'month' ? (
          <>
            {/* Month nav */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES_RU[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>▶</Text>
              </TouchableOpacity>
            </View>
            <MonthGrid
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              eventMap={eventMap}
              onDayPress={(dateStr) => openAddAppt(dateStr)}
            />
          </>
        ) : (
          <ListView
            appointments={appointments}
            vaccinations={vaccinations}
            gender={gender}
            pregnancy={pregnancy}
            onToggleDone={toggleApptDone}
            onDeleteAppt={deleteAppt}
          />
        )}
      </ScrollView>

      {/* Add Appointment Modal */}
      <Modal
        visible={addModal}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Запись к врачу</Text>

              <Text style={styles.fieldLabel}>Дата *</Text>
              <TextInput
                style={styles.input}
                value={apptDate}
                onChangeText={setApptDate}
                placeholder="ДД.ММ.ГГГГ"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Время</Text>
              <TextInput
                style={styles.input}
                value={apptTime}
                onChangeText={setApptTime}
                placeholder="09:30"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Врач *</Text>
              <TextInput
                style={styles.input}
                value={apptDoctor}
                onChangeText={setApptDoctor}
                placeholder="Иванова Мария Петровна"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Специальность</Text>
              <TextInput
                style={styles.input}
                value={apptSpecialty}
                onChangeText={setApptSpecialty}
                placeholder="Терапевт, педиатр..."
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Клиника</Text>
              <TextInput
                style={styles.input}
                value={apptClinic}
                onChangeText={setApptClinic}
                placeholder="Название клиники"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Заметки</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                value={apptNotes}
                onChangeText={setApptNotes}
                placeholder="Подготовка, вопросы..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setAddModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={saveAppointment}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.saveBtnText}>Сохранить</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

// ─── Month Grid ──────────────────────────────────────────────────────────────

function MonthGrid({
  year, month, eventMap, onDayPress,
}: {
  year: number
  month: number
  eventMap: Map<string, DayEvent[]>
  onDayPress: (dateStr: string) => void
}) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <View style={styles.gridContainer}>
      {/* Day headers */}
      <View style={styles.gridRow}>
        {DAY_NAMES_SHORT.map(d => (
          <View key={d} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>
      {/* Weeks */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.gridRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={styles.dayCell} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const events = eventMap.get(dateStr) ?? []
            const isToday = dateStr === todayStr
            const dotColors = [...new Set(events.map(e => e.color))].slice(0, 3)

            return (
              <TouchableOpacity
                key={di}
                style={[styles.dayCell, isToday && styles.dayCellToday]}
                onPress={() => onDayPress(dateStr)}
              >
                <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{day}</Text>
                <View style={styles.dotRow}>
                  {dotColors.map((c, i) => (
                    <View key={i} style={[styles.eventDot, { backgroundColor: c }]} />
                  ))}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

// ─── List View ───────────────────────────────────────────────────────────────

function ListView({
  appointments, vaccinations, gender, pregnancy, onToggleDone, onDeleteAppt,
}: {
  appointments: Appointment[]
  vaccinations: VaccinationRecord[]
  gender: string | null
  pregnancy: Pregnancy | null
  onToggleDone: (a: Appointment) => void
  onDeleteAppt: (id: string) => void
}) {
  const now = new Date()
  const upcoming = appointments.filter(a => new Date(a.date) >= now && !a.is_done)
    .sort((a, b) => a.date.localeCompare(b.date))
  const past = appointments.filter(a => new Date(a.date) < now || a.is_done)
    .sort((a, b) => b.date.localeCompare(a.date))

  function formatDate(iso: string) {
    const d = new Date(iso)
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
  }

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Upcoming appointments */}
      <Text style={styles.listSectionTitle}>Предстоящие визиты</Text>
      {upcoming.length === 0 ? (
        <View style={styles.emptySmall}>
          <Text style={styles.emptySmallText}>Нет запланированных визитов</Text>
        </View>
      ) : (
        upcoming.map(a => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            onToggle={onToggleDone}
            onDelete={onDeleteAppt}
            formatDate={formatDate}
          />
        ))
      )}

      {/* Recent vaccinations */}
      {vaccinations.length > 0 && (
        <>
          <Text style={[styles.listSectionTitle, { marginTop: 20 }]}>Последние прививки</Text>
          {vaccinations.slice(0, 5).map(v => {
            const vInfo = VACCINATION_SCHEDULE.find(s => s.key === v.vaccine_key)
            return (
              <View key={v.id} style={styles.vaccineListItem}>
                <View style={[styles.vaccineListDot, { backgroundColor: vInfo?.color ?? theme.colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.vaccineListName}>{v.vaccine_name}</Text>
                  <Text style={styles.vaccineListDose}>Доза {v.dose_number} · {formatDate(v.date_given)}</Text>
                </View>
              </View>
            )
          })}
        </>
      )}

      {/* Pregnancy due date */}
      {gender === 'female' && pregnancy && (
        <>
          <Text style={[styles.listSectionTitle, { marginTop: 20 }]}>Беременность</Text>
          <View style={styles.pregnancyListCard}>
            <Text style={styles.pregnancyListLabel}>Предполагаемая дата родов</Text>
            <Text style={styles.pregnancyListDate}>{formatDate(pregnancy.due_date)}</Text>
            <Text style={styles.pregnancyListSub}>Дата последних месячных: {formatDate(pregnancy.lmp_date)}</Text>
          </View>
        </>
      )}

      {/* Past appointments */}
      {past.length > 0 && (
        <>
          <Text style={[styles.listSectionTitle, { marginTop: 20 }]}>Прошедшие</Text>
          {past.map(a => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onToggle={onToggleDone}
              onDelete={onDeleteAppt}
              formatDate={formatDate}
              dim
            />
          ))}
        </>
      )}
    </View>
  )
}

function AppointmentCard({
  appointment, onToggle, onDelete, formatDate, dim,
}: {
  appointment: Appointment
  onToggle: (a: Appointment) => void
  onDelete: (id: string) => void
  formatDate: (s: string) => string
  dim?: boolean
}) {
  return (
    <View style={[styles.apptCard, dim && styles.apptCardDim]}>
      <TouchableOpacity style={styles.apptCheck} onPress={() => onToggle(appointment)}>
        <View style={[styles.checkBox, appointment.is_done && styles.checkBoxDone]}>
          {appointment.is_done && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.apptDoctor, appointment.is_done && styles.apptDone]}>
          {appointment.doctor_name}
        </Text>
        {appointment.specialty && (
          <Text style={styles.apptSpecialty}>{appointment.specialty}</Text>
        )}
        <Text style={styles.apptDate}>
          {formatDate(appointment.date)}{appointment.time ? ` в ${appointment.time}` : ''}
        </Text>
        {appointment.clinic && <Text style={styles.apptClinic}>{appointment.clinic}</Text>}
        {appointment.notes && <Text style={styles.apptNotes}>{appointment.notes}</Text>}
      </View>
      <TouchableOpacity onPress={() => onDelete(appointment.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function Legend({ gender }: { gender: string | null }) {
  const items = [
    { color: '#f87171', label: 'Менструация' },
    { color: '#fca5a5', label: 'Прогноз' },
    { color: '#86efac', label: 'Овуляция' },
    { color: '#c084fc', label: 'Беременность' },
    { color: '#fb923c', label: 'Прививки' },
    { color: '#2dd4bf', label: 'Приёмы' },
  ]
  const filtered = gender === 'female' ? items : items.filter(i => !['Менструация', 'Прогноз', 'Овуляция', 'Беременность'].includes(i.label))

  return (
    <View style={styles.legend}>
      {filtered.map(item => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Event Map Builder ───────────────────────────────────────────────────────

function buildEventMap(
  cycles: MenstrualCycle[],
  pregnancy: Pregnancy | null,
  vaccinations: VaccinationRecord[],
  appointments: Appointment[],
): Map<string, DayEvent[]> {
  const map = new Map<string, DayEvent[]>()

  function add(dateStr: string, event: DayEvent) {
    const arr = map.get(dateStr) ?? []
    arr.push(event)
    map.set(dateStr, arr)
  }

  function dateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = []
    const cur = new Date(start)
    while (cur <= end) {
      dates.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    return dates
  }

  function toStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Menstrual cycles
  cycles.forEach(cycle => {
    const start = new Date(cycle.start_date)
    const end = cycle.end_date ? new Date(cycle.end_date) : new Date(start.getTime() + 5 * 86400000)
    dateRange(start, end).forEach(d => {
      add(toStr(d), { type: 'period', label: 'Менструация', color: '#f87171' })
    })
    // Fertile window: ovulation ~14 days before next period (assume 28d cycle), days 10-16
    const ovulation = new Date(start)
    ovulation.setDate(ovulation.getDate() + 14)
    dateRange(
      new Date(ovulation.getTime() - 3 * 86400000),
      new Date(ovulation.getTime() + 3 * 86400000),
    ).forEach(d => {
      add(toStr(d), { type: 'fertile', label: 'Фертильный день', color: '#86efac' })
    })
  })

  // Predicted next cycle
  if (cycles.length > 0) {
    const sorted = [...cycles].sort((a, b) => b.start_date.localeCompare(a.start_date))
    const last = sorted[0]
    const avgLength = cycles.length > 1
      ? Math.round(
          sorted.slice(0, -1).reduce((sum, _, i) => {
            const diff = (new Date(sorted[i].start_date).getTime() - new Date(sorted[i + 1].start_date).getTime()) / 86400000
            return sum + diff
          }, 0) / (sorted.length - 1)
        )
      : 28
    const predictedStart = new Date(last.start_date)
    predictedStart.setDate(predictedStart.getDate() + avgLength)
    dateRange(predictedStart, new Date(predictedStart.getTime() + 5 * 86400000)).forEach(d => {
      add(toStr(d), { type: 'period_predicted', label: 'Прогноз', color: '#fca5a5' })
    })
  }

  // Pregnancy milestones
  if (pregnancy) {
    const lmp = new Date(pregnancy.lmp_date)
    const due = new Date(pregnancy.due_date)
    add(toStr(due), { type: 'due', label: 'ПДР', color: '#c084fc' })
    // Mark each Monday as pregnancy week start
    const cur = new Date(lmp)
    while (cur <= due) {
      add(toStr(cur), { type: 'pregnancy', label: 'Беременность', color: '#c084fc' })
      cur.setDate(cur.getDate() + 7)
    }
  }

  // Vaccinations
  vaccinations.forEach(v => {
    add(v.date_given, { type: 'vaccination', label: v.vaccine_name, color: '#fb923c', id: v.id })
  })

  // Appointments
  appointments.forEach(a => {
    add(a.date, { type: 'appointment', label: a.doctor_name, color: '#2dd4bf', id: a.id })
  })

  return map
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  addApptBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addApptBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  viewToggle: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: 16 },
  viewBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  viewBtnActive: { borderBottomColor: theme.colors.primary },
  viewBtnText: { fontSize: 14, color: theme.colors.textMuted },
  viewBtnTextActive: { color: theme.colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: theme.colors.textMuted },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  navBtn: { padding: 8 },
  navBtnText: { fontSize: 16, color: theme.colors.primary },
  monthTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  gridContainer: { paddingHorizontal: 8 },
  gridRow: { flexDirection: 'row' },
  dayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  dayHeaderText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600' },
  dayCell: { flex: 1, minHeight: 52, alignItems: 'center', paddingVertical: 6, borderRadius: 8, margin: 1 },
  dayCellToday: { backgroundColor: theme.colors.primary + '15' },
  dayNum: { fontSize: 14, color: theme.colors.text },
  dayNumToday: { color: theme.colors.primary, fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2, flexWrap: 'wrap', justifyContent: 'center' },
  eventDot: { width: 5, height: 5, borderRadius: 3 },
  listSectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
  emptySmall: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 16, alignItems: 'center' },
  emptySmallText: { fontSize: 14, color: theme.colors.textMuted },
  apptCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff',
    borderRadius: 12, padding: 12, marginBottom: 10, ...theme.shadow.sm,
  },
  apptCardDim: { opacity: 0.6 },
  apptCheck: { marginRight: 10, paddingTop: 2 },
  checkBox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2dd4bf', justifyContent: 'center', alignItems: 'center' },
  checkBoxDone: { backgroundColor: '#2dd4bf' },
  checkMark: { fontSize: 11, color: '#fff', fontWeight: '700' },
  apptDoctor: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  apptDone: { textDecorationLine: 'line-through', color: theme.colors.textMuted },
  apptSpecialty: { fontSize: 13, color: theme.colors.textMuted },
  apptDate: { fontSize: 13, color: theme.colors.primary, marginTop: 2 },
  apptClinic: { fontSize: 12, color: theme.colors.textMuted },
  apptNotes: { fontSize: 12, color: theme.colors.textMuted, fontStyle: 'italic' },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 16, color: '#ef4444' },
  vaccineListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 },
  vaccineListDot: { width: 8, height: 8, borderRadius: 4 },
  vaccineListName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  vaccineListDose: { fontSize: 12, color: theme.colors.textMuted },
  pregnancyListCard: { backgroundColor: '#faf5ff', borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#c084fc' },
  pregnancyListLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4 },
  pregnancyListDate: { fontSize: 18, fontWeight: '700', color: '#7c3aed' },
  pregnancyListSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: theme.colors.text,
    marginBottom: 12,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  cancelBtnText: { fontSize: 15, color: theme.colors.text, fontWeight: '600' },
  saveBtn: { backgroundColor: theme.colors.primary },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
})
