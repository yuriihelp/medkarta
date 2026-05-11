import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Alert, Modal, Platform,
} from 'react-native'
import { theme } from '../../src/lib/theme'
import { vaccinationsApi } from '../../src/api/client'
import { VACCINATION_SCHEDULE, VaccineScheduleItem, VaccineDose } from '../../src/data/vaccination_schedule'
import { storage } from '../../src/lib/storage'
import { isDemoMode, getDemoGender, DEMO_VACCINATIONS_MALE, DEMO_VACCINATIONS_FEMALE } from '../../src/data/demo'

interface VaccinationRecord {
  id: string
  vaccine_key: string
  dose_number: string
  date_given: string
  clinic: string | null
}

type TabKey = 'schedule' | 'done'

export default function VaccinesScreen() {
  const [records, setRecords] = useState<VaccinationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('schedule')
  const [birthDate, setBirthDate] = useState<Date | null>(null)

  // Add form modal
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineScheduleItem | null>(null)
  const [selectedDose, setSelectedDose] = useState<VaccineDose | null>(null)
  const [dateInput, setDateInput] = useState('')
  const [clinicInput, setClinicInput] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const storedBirth = await storage.getItem('user_birth_date')
      if (storedBirth) setBirthDate(new Date(storedBirth))
      const demo = await isDemoMode(storage)
      if (demo) {
        const gender = await getDemoGender(storage)
        setRecords(gender === 'female' ? DEMO_VACCINATIONS_FEMALE : DEMO_VACCINATIONS_MALE)
      } else {
        const res = await vaccinationsApi.list()
        setRecords(res.data)
      }
    } catch {
      // not authenticated or network error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const doneKeys = new Set(records.map(r => `${r.vaccine_key}_${r.dose_number}`))

  function isDone(vaccineKey: string, dose: string) {
    return doneKeys.has(`${vaccineKey}_${dose}`)
  }

  function getAgeMonths() {
    if (!birthDate) return null
    const now = new Date()
    return (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth())
  }

  function getDoseStatus(vaccine: VaccineScheduleItem, dose: VaccineDose): 'done' | 'overdue' | 'upcoming' | 'future' | 'na' {
    if (isDone(vaccine.key, dose.dose)) return 'done'
    if (dose.ageMonths === 0) return 'na'
    const ageMonths = getAgeMonths()
    if (ageMonths === null) return 'na'
    if (dose.ageMonths <= ageMonths) return 'overdue'
    if (dose.ageMonths <= ageMonths + 3) return 'upcoming'
    return 'future'
  }

  function openAddModal(vaccine: VaccineScheduleItem, dose: VaccineDose) {
    setSelectedVaccine(vaccine)
    setSelectedDose(dose)
    const today = new Date()
    setDateInput(`${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`)
    setClinicInput('')
    setModalVisible(true)
  }

  async function saveRecord() {
    if (!selectedVaccine || !selectedDose) return
    const parts = dateInput.split('.')
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
      const demo = await isDemoMode(storage)
      if (demo) {
        const newRecord: VaccinationRecord = {
          id: String(Date.now()),
          vaccine_key: selectedVaccine.key,
          dose_number: selectedDose.dose,
          date_given: isoDate,
          clinic: clinicInput || null,
        }
        setRecords(prev => [...prev, newRecord])
        setModalVisible(false)
      } else {
        await vaccinationsApi.add({
          vaccine_key: selectedVaccine.key,
          vaccine_name: selectedVaccine.name,
          dose_number: selectedDose.dose,
          date_given: isoDate,
          clinic: clinicInput || undefined,
        })
        setModalVisible(false)
        await loadData()
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить запись')
    } finally {
      setSaving(false)
    }
  }

  async function deleteRecord(id: string) {
    try {
      await vaccinationsApi.delete(id)
      setRecords(prev => prev.filter(r => r.id !== id))
    } catch {
      Alert.alert('Ошибка', 'Не удалось удалить запись')
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    )
  }

  const mandatoryVaccines = VACCINATION_SCHEDULE.filter(v => v.category === 'mandatory')
  const recommendedVaccines = VACCINATION_SCHEDULE.filter(v => v.category === 'recommended')
  const overdueCount = VACCINATION_SCHEDULE.flatMap(v =>
    v.doses.filter(d => getDoseStatus(v, d) === 'overdue')
  ).length
  const upcomingCount = VACCINATION_SCHEDULE.flatMap(v =>
    v.doses.filter(d => getDoseStatus(v, d) === 'upcoming')
  ).length
  const doneCount = records.length

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Прививочная книжка</Text>
        <Text style={styles.headerSub}>Национальный календарь прививок РФ</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.statNum, { color: '#dc2626' }]}>{overdueCount}</Text>
          <Text style={styles.statLabel}>Просрочено</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.statNum, { color: '#d97706' }]}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Скоро</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.statNum, { color: '#16a34a' }]}>{doneCount}</Text>
          <Text style={styles.statLabel}>Сделано</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['schedule', 'done'] as TabKey[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'schedule' ? 'Календарь' : 'Мои прививки'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {tab === 'schedule' ? (
          <>
            <VaccineSection
              title="Обязательные"
              vaccines={mandatoryVaccines}
              getDoseStatus={getDoseStatus}
              isDone={isDone}
              onAdd={openAddModal}
            />
            <VaccineSection
              title="Рекомендованные"
              vaccines={recommendedVaccines}
              getDoseStatus={getDoseStatus}
              isDone={isDone}
              onAdd={openAddModal}
            />
          </>
        ) : (
          <DoneList records={records} onDelete={deleteRecord} />
        )}
      </ScrollView>

      {/* Add Record Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Добавить прививку</Text>
            {selectedVaccine && selectedDose && (
              <View style={[styles.modalVaccineTag, { backgroundColor: selectedVaccine.color + '20' }]}>
                <Text style={[styles.modalVaccineName, { color: selectedVaccine.color }]}>
                  {selectedVaccine.shortName} — доза {selectedDose.dose}
                </Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>Дата прививки</Text>
            <TextInput
              style={styles.input}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="ДД.ММ.ГГГГ"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Медицинское учреждение (необяз.)</Text>
            <TextInput
              style={styles.input}
              value={clinicInput}
              onChangeText={setClinicInput}
              placeholder="Название поликлиники"
              placeholderTextColor={theme.colors.textMuted}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveRecord}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Сохранить</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function VaccineSection({
  title,
  vaccines,
  getDoseStatus,
  isDone,
  onAdd,
}: {
  title: string
  vaccines: VaccineScheduleItem[]
  getDoseStatus: (v: VaccineScheduleItem, d: VaccineDose) => string
  isDone: (key: string, dose: string) => boolean
  onAdd: (v: VaccineScheduleItem, d: VaccineDose) => void
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {vaccines.map(vaccine => (
        <VaccineCard
          key={vaccine.key}
          vaccine={vaccine}
          getDoseStatus={getDoseStatus}
          isDone={isDone}
          onAdd={onAdd}
        />
      ))}
    </View>
  )
}

function VaccineCard({
  vaccine,
  getDoseStatus,
  isDone,
  onAdd,
}: {
  vaccine: VaccineScheduleItem
  getDoseStatus: (v: VaccineScheduleItem, d: VaccineDose) => string
  isDone: (key: string, dose: string) => boolean
  onAdd: (v: VaccineScheduleItem, d: VaccineDose) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasOverdue = vaccine.doses.some(d => getDoseStatus(vaccine, d) === 'overdue')
  const hasUpcoming = vaccine.doses.some(d => getDoseStatus(vaccine, d) === 'upcoming')
  const allDone = vaccine.doses.filter(d => getDoseStatus(vaccine, d) !== 'na').every(d => isDone(vaccine.key, d.dose))

  return (
    <View style={styles.vaccineCard}>
      <TouchableOpacity style={styles.vaccineHeader} onPress={() => setExpanded(!expanded)}>
        <View style={[styles.vaccineDot, { backgroundColor: vaccine.color }]} />
        <View style={styles.vaccineInfo}>
          <Text style={styles.vaccineName}>{vaccine.shortName}</Text>
          {hasOverdue && <Text style={styles.badgeOverdue}>Просрочено</Text>}
          {!hasOverdue && hasUpcoming && <Text style={styles.badgeUpcoming}>Скоро</Text>}
          {allDone && <Text style={styles.badgeDone}>✓ Завершено</Text>}
        </View>
        <Text style={styles.expandArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.doseList}>
          <Text style={styles.vaccineDesc}>{vaccine.description}</Text>
          {vaccine.doses.map((dose, i) => {
            const status = getDoseStatus(vaccine, dose)
            return (
              <View key={i} style={styles.doseRow}>
                <View style={styles.doseLeft}>
                  <StatusDot status={status} />
                  <View>
                    <Text style={styles.doseLabel}>Доза {dose.dose}</Text>
                    <Text style={styles.doseAge}>{dose.ageLabel}</Text>
                    {dose.notes && <Text style={styles.doseNotes}>{dose.notes}</Text>}
                  </View>
                </View>
                {status !== 'done' && status !== 'na' && (
                  <TouchableOpacity
                    style={[styles.addDoseBtn, { backgroundColor: vaccine.color }]}
                    onPress={() => onAdd(vaccine, dose)}
                  >
                    <Text style={styles.addDoseBtnText}>+ Добавить</Text>
                  </TouchableOpacity>
                )}
                {status === 'done' && (
                  <Text style={styles.doneCheck}>✓</Text>
                )}
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    done: '#16a34a',
    overdue: '#dc2626',
    upcoming: '#d97706',
    future: '#94a3b8',
    na: '#cbd5e1',
  }
  return (
    <View style={[styles.statusDot, { backgroundColor: colors[status] ?? '#cbd5e1' }]} />
  )
}

function DoneList({
  records,
  onDelete,
}: {
  records: VaccinationRecord[]
  onDelete: (id: string) => void
}) {
  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>💉</Text>
        <Text style={styles.emptyTitle}>Нет записей</Text>
        <Text style={styles.emptyText}>
          Перейдите на вкладку «Календарь» и отметьте сделанные прививки
        </Text>
      </View>
    )
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
  }

  function getColor(key: string) {
    return VACCINATION_SCHEDULE.find(v => v.key === key)?.color ?? theme.colors.primary
  }

  return (
    <View style={styles.section}>
      {records.map(rec => (
        <View key={rec.id} style={styles.doneCard}>
          <View style={[styles.doneColorBar, { backgroundColor: getColor(rec.vaccine_key) }]} />
          <View style={styles.doneContent}>
            <Text style={styles.doneVaccineName}>{rec.vaccine_key.replace(/_/g, ' ')}</Text>
            <Text style={styles.doneDose}>Доза: {rec.dose_number}</Text>
            <Text style={styles.doneDate}>{formatDate(rec.date_given)}</Text>
            {rec.clinic && <Text style={styles.doneClinic}>{rec.clinic}</Text>}
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDelete(rec.id)}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center',
  },
  statNum: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 14, color: theme.colors.textMuted },
  tabTextActive: { color: theme.colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  vaccineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  vaccineHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
  },
  vaccineDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  vaccineInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  vaccineName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  badgeOverdue: { fontSize: 11, color: '#dc2626', backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeUpcoming: { fontSize: 11, color: '#d97706', backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeDone: { fontSize: 11, color: '#16a34a', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  expandArrow: { fontSize: 10, color: theme.colors.textMuted },
  doseList: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.colors.border },
  vaccineDesc: { fontSize: 13, color: theme.colors.textMuted, paddingTop: 10, paddingBottom: 8 },
  doseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  doseLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  doseLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  doseAge: { fontSize: 12, color: theme.colors.textMuted },
  doseNotes: { fontSize: 11, color: theme.colors.textMuted, fontStyle: 'italic' },
  addDoseBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  addDoseBtnText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  doneCheck: { fontSize: 16, color: '#16a34a', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 20 },
  doneCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10,
    overflow: 'hidden', ...theme.shadow.sm,
  },
  doneColorBar: { width: 4 },
  doneContent: { flex: 1, padding: 12 },
  doneVaccineName: { fontSize: 14, fontWeight: '600', color: theme.colors.text, textTransform: 'capitalize' },
  doneDose: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  doneDate: { fontSize: 13, color: theme.colors.primary, marginTop: 2 },
  doneClinic: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 14, justifyContent: 'center' },
  deleteBtnText: { fontSize: 16, color: '#ef4444' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
  modalVaccineTag: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16, alignSelf: 'flex-start' },
  modalVaccineName: { fontSize: 14, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: theme.colors.text,
    marginBottom: 12,
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  cancelBtnText: { fontSize: 15, color: theme.colors.text, fontWeight: '600' },
  saveBtn: { backgroundColor: theme.colors.primary },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
})
