import { useLocalSearchParams } from 'expo-router'
import {
  View, Text, ScrollView, StyleSheet, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import {
  DEMO_RECORDS_MALE, DEMO_RECORDS_FEMALE, DEMO_RECORDS_FEMALE2,
  DEMO_APPOINTMENTS_MALE, DEMO_APPOINTMENTS_FEMALE, DEMO_APPOINTMENTS_FEMALE2,
} from '@/src/data/demo'

// ─── Demo profiles ────────────────────────────────────────────────────────────

const DEMO_PROFILES: Record<string, {
  name: string; age: number; gender: string; birth_date: string
  conditions: string[]; medications: string[]
  records: typeof DEMO_RECORDS_MALE
  appointments: typeof DEMO_APPOINTMENTS_MALE
}> = {
  'demo-male': {
    name: 'Петров Иван Сергеевич',
    age: 35,
    gender: 'Мужской',
    birth_date: '15.05.1990',
    conditions: ['Функциональная кардиалгия', 'Миопия слабой степени OU', 'Дислипидемия (лёгкая)'],
    medications: ['Омега-3 1000 мг/сут', 'Витамин D 2000 МЕ/сут'],
    records: DEMO_RECORDS_MALE,
    appointments: DEMO_APPOINTMENTS_MALE,
  },
  'demo-female': {
    name: 'Иванова Мария Александровна',
    age: 30,
    gender: 'Женский',
    birth_date: '22.08.1995',
    conditions: ['Беременность 18 недель (II триместр)', 'Железодефицитная анемия лёгкой степени'],
    medications: ['Сорбифер Дурулес 100 мг 2р/д', 'Фолиевая кислота 400 мкг/сут', 'Йодомарин 200 мкг/сут', 'Витамин D3 2000 МЕ/сут'],
    records: DEMO_RECORDS_FEMALE,
    appointments: DEMO_APPOINTMENTS_FEMALE,
  },
  'demo-female2': {
    name: 'Соколова Анна Михайловна',
    age: 28,
    gender: 'Женский',
    birth_date: '10.07.1997',
    conditions: ['Ранее: сниженный ферритин (в норме на контроле)'],
    medications: [],
    records: DEMO_RECORDS_FEMALE2,
    appointments: DEMO_APPOINTMENTS_FEMALE2,
  },
}

const STATUS_COLOR = { normal: '#16a34a', low: '#2563eb', high: '#dc2626' }
const STATUS_BG = { normal: '#dcfce7', low: '#dbeafe', high: '#fee2e2' }
const STATUS_LABEL = { normal: 'норма', low: 'понижен', high: 'повышен' }

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

export default function DoctorView() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const profile = DEMO_PROFILES[token ?? '']

  if (!profile) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.notFoundTitle}>Ссылка недействительна</Text>
        <Text style={styles.notFoundText}>
          Срок действия ссылки истёк или она была отозвана пациентом.
        </Text>
      </View>
    )
  }

  const upcoming = profile.appointments
    .filter(a => !a.is_done && new Date(a.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  // Collect latest indicators with anomalies
  const latestIndicators: Array<{ name: string; value: number; unit: string; status: string }> = []
  const seen = new Set<string>()
  const sortedRecs = [...profile.records].sort((a, b) => b.date.localeCompare(a.date))
  sortedRecs.forEach(rec => {
    rec.indicators.forEach(ind => {
      if (!seen.has(ind.name)) {
        seen.add(ind.name)
        latestIndicators.push(ind)
      }
    })
  })

  const anomalies = latestIndicators.filter(i => i.status !== 'normal')

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          <Text style={styles.logoText}>ПУЛЬС</Text>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>ДЕМО</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Медицинская карта пациента</Text>
      </View>

      {/* Patient card */}
      <View style={styles.patientCard}>
        <View style={styles.patientAvatar}>
          <Text style={styles.patientAvatarText}>
            {profile.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{profile.name}</Text>
          <Text style={styles.patientMeta}>{profile.gender} · {profile.birth_date} ({profile.age} лет)</Text>
        </View>
      </View>

      {/* Anomalies alert */}
      {anomalies.length > 0 && (
        <View style={styles.alertCard}>
          <Ionicons name="warning-outline" size={18} color="#d97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Отклонения от нормы</Text>
            {anomalies.map(ind => (
              <Text key={ind.name} style={styles.alertItem}>
                • {ind.name}: {ind.value} {ind.unit} ({STATUS_LABEL[ind.status as keyof typeof STATUS_LABEL]})
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Diagnoses */}
      {profile.conditions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Диагнозы / состояния</Text>
          <View style={styles.card}>
            {profile.conditions.map((c, i) => (
              <View key={i} style={styles.conditionRow}>
                <Ionicons name="medical-outline" size={14} color={colors.teal} />
                <Text style={styles.conditionText}>{c}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Medications */}
      {profile.medications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Текущие препараты</Text>
          <View style={styles.card}>
            {profile.medications.map((m, i) => (
              <View key={i} style={styles.conditionRow}>
                <Ionicons name="bag-outline" size={14} color="#7c3aed" />
                <Text style={styles.conditionText}>{m}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Latest indicators */}
      <Text style={styles.sectionTitle}>Последние анализы</Text>
      <View style={styles.card}>
        {latestIndicators.length === 0 ? (
          <Text style={styles.emptyText}>Нет данных</Text>
        ) : (
          latestIndicators.map((ind, i) => {
            const color = STATUS_COLOR[ind.status as keyof typeof STATUS_COLOR] ?? colors.textMuted
            const bg = STATUS_BG[ind.status as keyof typeof STATUS_BG] ?? colors.bg
            return (
              <View key={i} style={styles.indicatorRow}>
                <Text style={styles.indicatorName}>{ind.name}</Text>
                <View style={[styles.indBadge, { backgroundColor: bg }]}>
                  <Text style={[styles.indValue, { color }]}>
                    {ind.value} {ind.unit}
                  </Text>
                </View>
              </View>
            )
          })
        )}
      </View>

      {/* Records */}
      <Text style={styles.sectionTitle}>История обследований</Text>
      {sortedRecs.map(rec => (
        <View key={rec.id} style={styles.recCard}>
          <View style={styles.recHeader}>
            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recDate}>{fmtDate(rec.date)}</Text>
          </View>
          <Text style={styles.recSource}>{rec.source}</Text>
          {rec.summary ? <Text style={styles.recSummary}>{rec.summary}</Text> : null}
        </View>
      ))}

      {/* Upcoming appointments */}
      {upcoming.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Предстоящие записи</Text>
          {upcoming.map(a => (
            <View key={a.id} style={styles.apptCard}>
              <Ionicons name="calendar-outline" size={16} color={colors.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.apptDoctor}>{a.doctor_name}</Text>
                <Text style={styles.apptMeta}>{a.specialty} · {fmtDate(a.date)}{a.time ? ` в ${a.time}` : ''}</Text>
                {a.clinic ? <Text style={styles.apptClinic}>{a.clinic}</Text> : null}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={styles.footerText}>
          Ссылка предоставлена пациентом для просмотра медицинских данных. Данные носят информационный характер.
          Это демонстрационная версия приложения ПУЛЬС.
        </Text>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },

  notFound: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  notFoundTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  notFoundText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

  header: {
    backgroundColor: colors.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoText: { fontSize: 24, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  demoBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.warning,
    borderRadius: radius.full,
  },
  demoBadgeText: { fontSize: 10, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },
  headerSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.55)' },

  patientCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginBottom: 0,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  patientAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  patientAvatarText: { fontSize: fontSize.lg, fontWeight: '800', color: colors.white },
  patientName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  patientMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },

  alertCard: {
    flexDirection: 'row', gap: spacing.sm,
    backgroundColor: '#fffbeb', borderColor: '#fde68a',
    borderWidth: 1, borderRadius: radius.md,
    margin: spacing.lg, marginBottom: 0,
    padding: spacing.md,
  },
  alertTitle: { fontSize: fontSize.sm, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  alertItem: { fontSize: fontSize.xs, color: '#78350f', lineHeight: 20 },

  sectionTitle: {
    fontSize: fontSize.xs, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm,
  },

  card: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginHorizontal: spacing.lg,
    padding: spacing.md, gap: spacing.sm,
  },
  conditionRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  conditionText: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },

  emptyText: { fontSize: fontSize.sm, color: colors.textMuted },

  indicatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  indicatorName: { fontSize: fontSize.sm, color: colors.text, flex: 1 },
  indBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  indValue: { fontSize: fontSize.sm, fontWeight: '700' },

  recCard: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    padding: spacing.md,
  },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, flex: 1 },
  recDate: { fontSize: fontSize.xs, color: colors.teal, marginLeft: 8 },
  recSource: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  recSummary: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4, lineHeight: 18, fontStyle: 'italic' },

  apptCard: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start',
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    padding: spacing.md,
  },
  apptDoctor: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  apptMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  apptClinic: { fontSize: fontSize.xs, color: colors.teal, marginTop: 1 },

  footer: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.borderLight,
    borderRadius: radius.md,
  },
  footerText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },
})
