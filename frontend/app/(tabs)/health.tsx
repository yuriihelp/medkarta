import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'
import { womenApi } from '@/src/api/client'
import { PREGNANCY_WEEKS, calcPregnancyWeek, getWeekData } from '@/src/data/pregnancy_weeks'
import { getDemoType, DEMO_WOMEN_STATUS_FEMALE, DEMO_WOMEN_STATUS_FEMALE2 } from '@/src/data/demo'
import { storage } from '@/src/lib/storage'
import type { WomenStatus } from '@/src/types'

// ─── Pregnancy tracker ───────────────────────────────────────────────────────

function PregnancyTracker({ status, onEnd }: { status: WomenStatus; onEnd: () => void }) {
  const preg = status.active_pregnancy!
  const lmp = new Date(preg.lmp_date)
  const due = new Date(preg.due_date)
  const { week, day } = calcPregnancyWeek(lmp)
  const weekData = getWeekData(week)
  const daysLeft = Math.max(0, Math.ceil((due.getTime() - Date.now()) / 86400000))
  const progress = Math.min(week / 40, 1)

  const trimesterLabel = weekData.trimester === 1 ? 'I триместр' :
    weekData.trimester === 2 ? 'II триместр' : 'III триместр'
  const trimesterColor = weekData.trimester === 1 ? colors.info :
    weekData.trimester === 2 ? colors.teal : '#7c3aed'

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Hero card */}
      <View style={[styles.heroCard, { backgroundColor: trimesterColor }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroWeek}>{week} неделя, {day + 1} день</Text>
            <Text style={styles.heroTrimester}>{trimesterLabel}</Text>
          </View>
          <View style={styles.heroDays}>
            <Text style={styles.heroDaysNum}>{daysLeft}</Text>
            <Text style={styles.heroDaysLabel}>дней до ПДР</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>1 нед</Text>
          <Text style={styles.progressLabel}>10    </Text>
          <Text style={styles.progressLabel}>20    </Text>
          <Text style={styles.progressLabel}>30    </Text>
          <Text style={styles.progressLabel}>40 нед</Text>
        </View>

        {/* Due date */}
        <Text style={styles.heroDue}>
          ПДР: {due.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Baby size */}
      <Card style={styles.sizeCard}>
        <View style={styles.sizeRow}>
          <View style={styles.sizeIconWrap}>
            <Text style={styles.sizeEmoji}>🍼</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sizeTitle}>Размер малыша</Text>
            <Text style={styles.sizeFruit}>{weekData.fruit}</Text>
            <View style={styles.sizeMeta}>
              <Text style={styles.sizeMetaText}>{weekData.length_cm} см</Text>
              <Text style={styles.sizeMetaDot}>·</Text>
              {weekData.weight_g > 0
                ? <Text style={styles.sizeMetaText}>{weekData.weight_g} г</Text>
                : <Text style={styles.sizeMetaText}>формируется</Text>
              }
            </View>
          </View>
          {weekData.milestone && (
            <View style={styles.milestoneBadge}>
              <Ionicons name="star" size={11} color="#f59e0b" />
              <Text style={styles.milestoneText}>{weekData.milestone}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Baby development */}
      <Card>
        <View style={styles.devHeader}>
          <Ionicons name="heart" size={18} color={colors.danger} />
          <Text style={styles.devTitle}>Малыш на этой неделе</Text>
        </View>
        <Text style={styles.devText}>{weekData.baby}</Text>
      </Card>

      {/* Mom wellbeing */}
      <Card>
        <View style={styles.devHeader}>
          <Ionicons name="person" size={18} color={colors.teal} />
          <Text style={styles.devTitle}>Самочувствие мамы</Text>
        </View>
        <Text style={styles.devText}>{weekData.mom}</Text>
      </Card>

      {/* Week navigation */}
      <View style={styles.weekNav}>
        <Text style={styles.weekNavTitle}>Все недели беременности</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.weekChips}>
            {PREGNANCY_WEEKS.map(w => (
              <View
                key={w.week}
                style={[
                  styles.weekChip,
                  w.week === week && styles.weekChipActive,
                  w.week < week && styles.weekChipDone,
                ]}
              >
                <Text style={[
                  styles.weekChipText,
                  w.week === week && styles.weekChipTextActive,
                ]}>
                  {w.week}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Child info */}
      {(preg.child_name || preg.child_gender !== 'unknown') && (
        <Card>
          <Text style={styles.devTitle}>Карточка малыша</Text>
          {preg.child_name && <Text style={styles.devText}>Имя: {preg.child_name}</Text>}
          {preg.child_gender && preg.child_gender !== 'unknown' && (
            <Text style={styles.devText}>
              Пол: {preg.child_gender === 'boy' ? '👦 Мальчик' : '👧 Девочка'}
            </Text>
          )}
        </Card>
      )}

      <TouchableOpacity style={styles.endBtn} onPress={onEnd} activeOpacity={0.8}>
        <Text style={styles.endBtnText}>Завершить ведение беременности</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

// ─── Menstrual calendar ───────────────────────────────────────────────────────

function MenstrualSection({
  status,
  onPregnant,
}: {
  status: WomenStatus
  onPregnant: () => void
}) {
  const [showAddCycle, setShowAddCycle] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  const avgLen = status.avg_cycle_length
  const last = status.last_cycle

  // Predict next period
  let nextPeriod: Date | null = null
  if (last) {
    nextPeriod = new Date(last.start_date)
    nextPeriod.setDate(nextPeriod.getDate() + avgLen)
  }
  const daysToNext = nextPeriod
    ? Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000)
    : null

  async function saveCycle() {
    if (!startDate) { Alert.alert('Укажите дату начала'); return }
    setSaving(true)
    try {
      await womenApi.createCycle({ start_date: startDate, end_date: endDate || undefined })
      setShowAddCycle(false)
      setStartDate('')
      setEndDate('')
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View>
        <Text style={styles.title}>Женское здоровье</Text>
        <Text style={styles.subtitle}>Менструальный календарь и цикл</Text>
      </View>

      {/* Cycle stats */}
      <View style={styles.statsRow}>
        <Card style={styles.cycleStat}>
          <Ionicons name="repeat" size={20} color={colors.teal} />
          <Text style={styles.cycleStatNum}>{avgLen}</Text>
          <Text style={styles.cycleStatLabel}>дней цикл</Text>
        </Card>
        <Card style={styles.cycleStat}>
          <Ionicons name="calendar" size={20} color="#ec4899" />
          <Text style={styles.cycleStatNum}>
            {daysToNext !== null
              ? daysToNext <= 0 ? 'Сегодня' : `${daysToNext}д`
              : '—'}
          </Text>
          <Text style={styles.cycleStatLabel}>до месячных</Text>
        </Card>
        <Card style={styles.cycleStat}>
          <Ionicons name="leaf" size={20} color={colors.success} />
          <Text style={styles.cycleStatNum}>
            {nextPeriod
              ? (() => {
                  const ov = new Date(nextPeriod); ov.setDate(ov.getDate() - 14)
                  const d = Math.ceil((ov.getTime() - Date.now()) / 86400000)
                  return d <= 0 ? 'Сейчас' : `${d}д`
                })()
              : '—'}
          </Text>
          <Text style={styles.cycleStatLabel}>до овуляции</Text>
        </Card>
      </View>

      {/* Predicted next period */}
      {nextPeriod && (
        <Card style={styles.predCard}>
          <Ionicons name="time-outline" size={18} color="#ec4899" />
          <View style={{ flex: 1 }}>
            <Text style={styles.predTitle}>Следующие месячные</Text>
            <Text style={styles.predDate}>
              ~{nextPeriod.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </Text>
          </View>
        </Card>
      )}

      {/* Add cycle */}
      {!showAddCycle ? (
        <TouchableOpacity style={styles.addCycleBtn} onPress={() => setShowAddCycle(true)} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.addCycleBtnText}>Отметить начало цикла</Text>
        </TouchableOpacity>
      ) : (
        <Card style={styles.addCycleCard}>
          <Text style={styles.addCycleTitle}>Новый цикл</Text>

          <Text style={styles.fieldLabel}>Дата начала *</Text>
          <TextInput
            style={styles.fieldInput}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2024-06-01"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Дата окончания (необязательно)</Text>
          <TextInput
            style={styles.fieldInput}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="2024-06-05"
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.addCycleActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddCycle(false)}>
              <Text style={styles.cancelBtnText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveCycle} disabled={saving}>
              {saving
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.saveBtnText}>Сохранить</Text>}
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Last cycles */}
      {last && (
        <>
          <Text style={styles.sectionTitle}>История циклов</Text>
          <Card style={styles.cycleHistoryItem}>
            <Ionicons name="ellipse" size={10} color="#ec4899" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cycleHistDate}>
                {new Date(last.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              {last.end_date && (
                <Text style={styles.cycleHistSub}>
                  Окончание: {new Date(last.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </Text>
              )}
            </View>
          </Card>
        </>
      )}

      {/* I'm pregnant button */}
      <TouchableOpacity style={styles.pregnantBtn} onPress={onPregnant} activeOpacity={0.85}>
        <Text style={styles.pregnantBtnText}>Я беременна</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.teal} />
      </TouchableOpacity>

    </ScrollView>
  )
}

// ─── Start pregnancy form ─────────────────────────────────────────────────────

function StartPregnancyForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [lmpDate, setLmpDate] = useState('')
  const [childName, setChildName] = useState('')
  const [childGender, setChildGender] = useState<'unknown' | 'boy' | 'girl'>('unknown')
  const [loading, setLoading] = useState(false)

  // Preview due date
  let duePreview = ''
  if (lmpDate.length === 10) {
    const d = new Date(lmpDate); d.setDate(d.getDate() + 280)
    if (!isNaN(d.getTime())) {
      duePreview = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }

  async function submit() {
    if (!lmpDate) { Alert.alert('Укажите дату последней менструации'); return }
    setLoading(true)
    try {
      await womenApi.startPregnancy(lmpDate, childName || undefined, childGender)
      onSuccess()
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={18} color={colors.teal} />
        <Text style={styles.backBtnText}>Назад</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Начало беременности</Text>
      <Text style={styles.subtitle}>Введите дату первого дня последней менструации</Text>

      <Card style={styles.formCard}>
        <Text style={styles.fieldLabel}>Дата последней менструации (ПДМ) *</Text>
        <TextInput
          style={styles.fieldInput}
          value={lmpDate}
          onChangeText={setLmpDate}
          placeholder="2024-05-01"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
        <Text style={styles.fieldHint}>Формат: ГГГГ-ММ-ДД</Text>

        {duePreview !== '' && (
          <View style={styles.dueDatePreview}>
            <Ionicons name="calendar" size={16} color={colors.teal} />
            <Text style={styles.dueDateText}>Предполагаемая дата родов: {duePreview}</Text>
          </View>
        )}

        <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Имя малыша (если уже знаете)</Text>
        <TextInput
          style={styles.fieldInput}
          value={childName}
          onChangeText={setChildName}
          placeholder="Необязательно"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Пол малыша</Text>
        <View style={styles.genderRow}>
          {([['unknown', 'Не знаю'], ['boy', '👦 Мальчик'], ['girl', '👧 Девочка']] as const).map(([v, l]) => (
            <TouchableOpacity
              key={v}
              style={[styles.genderBtn, childGender === v && styles.genderBtnActive]}
              onPress={() => setChildGender(v)}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderBtnText, childGender === v && styles.genderBtnTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={submit} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>Начать ведение беременности</Text>}
        </TouchableOpacity>
      </Card>
    </ScrollView>
  )
}

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function HealthScreen() {
  const [status, setStatus] = useState<WomenStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStartForm, setShowStartForm] = useState(false)

  async function load() {
    try {
      const demoType = await getDemoType(storage)
      if (demoType === 'female_pregnant') {
        setStatus(DEMO_WOMEN_STATUS_FEMALE as unknown as WomenStatus)
      } else if (demoType === 'female_cycle') {
        setStatus(DEMO_WOMEN_STATUS_FEMALE2 as unknown as WomenStatus)
      } else if (demoType === null) {
        const res = await womenApi.getStatus()
        setStatus(res.data)
      }
      // demoType === 'male' → no women's health screen shown
    } catch {
      // not female or not authenticated — handled by layout
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { load() }, []))

  async function handleEndPregnancy() {
    if (!status?.active_pregnancy) return
    Alert.alert(
      'Завершить беременность',
      'Данные беременности будут сохранены в архиве.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Завершить', style: 'destructive',
          onPress: async () => {
            await womenApi.endPregnancy(status.active_pregnancy!.id)
            load()
          },
        },
      ],
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    )
  }

  if (showStartForm) {
    return (
      <StartPregnancyForm
        onSuccess={() => { setShowStartForm(false); load() }}
        onCancel={() => setShowStartForm(false)}
      />
    )
  }

  if (status?.is_pregnant) {
    return <PregnancyTracker status={status} onEnd={handleEndPregnancy} />
  }

  return (
    <MenstrualSection
      status={status ?? { is_pregnant: false, active_pregnancy: null, last_cycle: null, avg_cycle_length: 28 }}
      onPregnant={() => setShowStartForm(true)}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Hero pregnancy card
  heroCard: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroWeek: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white },
  heroTrimester: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroDays: { alignItems: 'center' },
  heroDaysNum: { fontSize: 32, fontWeight: '800', color: colors.white },
  heroDaysLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: colors.white, borderRadius: 3 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)' },
  heroDue: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  // Size card
  sizeCard: { gap: spacing.sm },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sizeIconWrap: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  sizeEmoji: { fontSize: 28 },
  sizeTitle: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  sizeFruit: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: 2 },
  sizeMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  sizeMetaText: { fontSize: fontSize.sm, color: colors.textSecondary },
  sizeMetaDot: { color: colors.textMuted },
  milestoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fffbeb', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  milestoneText: { fontSize: 10, color: '#92400e', fontWeight: '600' },

  // Development
  devHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  devTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  devText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },

  // Week nav
  weekNav: { gap: spacing.sm },
  weekNavTitle: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  weekChips: { flexDirection: 'row', gap: 6 },
  weekChip: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  weekChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  weekChipDone: { backgroundColor: colors.tealLight, borderColor: colors.tealBorder },
  weekChipText: { fontSize: 10, fontWeight: '600', color: colors.textSecondary },
  weekChipTextActive: { color: colors.white },

  // End button
  endBtn: { alignItems: 'center', paddingVertical: spacing.md },
  endBtnText: { fontSize: fontSize.sm, color: colors.danger },

  // Stats row (menstrual)
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  cycleStat: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: spacing.md },
  cycleStatNum: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  cycleStatLabel: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },

  // Prediction card
  predCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' },
  predTitle: { fontSize: fontSize.sm, fontWeight: '600', color: '#831843' },
  predDate: { fontSize: fontSize.md, fontWeight: '700', color: '#ec4899', marginTop: 2 },

  // Add cycle
  addCycleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 52, backgroundColor: '#ec4899', borderRadius: radius.md },
  addCycleBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },
  addCycleCard: { gap: spacing.sm },
  addCycleTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  addCycleActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },

  // Cycle history
  cycleHistoryItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cycleHistDate: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  cycleHistSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  // Pregnant button
  pregnantBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderWidth: 1.5, borderColor: colors.teal, borderRadius: radius.md },
  pregnantBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.teal },

  // Form
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  backBtnText: { fontSize: fontSize.sm, color: colors.teal, fontWeight: '600' },
  formCard: { gap: spacing.sm },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  fieldHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: -4 },
  fieldInput: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: fontSize.sm, color: colors.text },
  dueDatePreview: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.tealLight, borderRadius: radius.md, padding: spacing.sm },
  dueDateText: { fontSize: fontSize.sm, color: colors.tealDark, fontWeight: '600' },
  genderRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  genderBtn: { flex: 1, height: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  genderBtnActive: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  genderBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  genderBtnTextActive: { color: colors.tealDark },

  // Shared buttons
  cancelBtn: { flex: 1, height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  saveBtn: { flex: 2, height: 48, backgroundColor: colors.teal, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },
})
