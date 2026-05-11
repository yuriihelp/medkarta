import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'
import { storage } from '@/src/lib/storage'
import {
  isDemoMode, getDemoGender,
  DEMO_RECORDS_MALE, DEMO_RECORDS_FEMALE,
  DEMO_APPOINTMENTS_MALE, DEMO_APPOINTMENTS_FEMALE,
} from '@/src/data/demo'

const actions = [
  { label: 'Загрузить анализы', desc: 'PDF или фото', href: '/(tabs)/upload', color: colors.teal },
  { label: 'Спросить ИИ', desc: 'Расшифровка', href: '/(tabs)/ai', color: colors.info },
  { label: 'QR для врача', desc: 'Быстрый доступ', href: '/(tabs)/access', color: colors.navyLight },
  { label: 'Найти аптеку', desc: 'Лучшие цены', href: '/(tabs)/marketplace', color: colors.warning },
]

interface StatItem {
  label: string
  value: string
  icon: string
  color: string
}

interface RecentEvent {
  id: string
  type: 'appointment' | 'record'
  title: string
  subtitle: string
  date: string
  color: string
}

function formatDateRu(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

export default function DashboardScreen() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Записей', value: '0', icon: 'document-text-outline', color: colors.teal },
    { label: 'Последний анализ', value: '—', icon: 'flask-outline', color: colors.info },
    { label: 'Назначений', value: '0', icon: 'calendar-outline', color: colors.warning },
    { label: 'Показателей', value: '0', icon: 'trending-up-outline', color: '#7c3aed' },
  ])
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])

  useEffect(() => {
    async function loadDashboard() {
      const name = await storage.getItem('user_name')
      setUserName(name)

      const demo = await isDemoMode(storage)
      if (!demo) return

      const gender = await getDemoGender(storage)
      const records = gender === 'female' ? DEMO_RECORDS_FEMALE : DEMO_RECORDS_MALE
      const appointments = gender === 'female' ? DEMO_APPOINTMENTS_FEMALE : DEMO_APPOINTMENTS_MALE

      const now = new Date()
      const upcoming = appointments.filter(a => new Date(a.date) >= now && !a.is_done)
        .sort((a, b) => a.date.localeCompare(b.date))

      const analysisRecords = records.filter(r => r.type === 'analysis')
        .sort((a, b) => b.date.localeCompare(a.date))

      const lastAnalysisDate = analysisRecords.length > 0
        ? formatDateRu(analysisRecords[0].date)
        : '—'

      const indicatorsCount = records.reduce((sum, r) => sum + (r.indicators?.length ?? 0), 0)

      setStats([
        { label: 'Записей', value: String(records.length), icon: 'document-text-outline', color: colors.teal },
        { label: 'Последний анализ', value: lastAnalysisDate, icon: 'flask-outline', color: colors.info },
        { label: 'Назначений', value: String(upcoming.length), icon: 'calendar-outline', color: colors.warning },
        { label: 'Показателей', value: String(indicatorsCount), icon: 'trending-up-outline', color: '#7c3aed' },
      ])

      const events: RecentEvent[] = [
        ...upcoming.slice(0, 3).map(a => ({
          id: a.id,
          type: 'appointment' as const,
          title: a.doctor_name,
          subtitle: [a.specialty, a.clinic].filter(Boolean).join(' · '),
          date: formatDateRu(a.date) + (a.time ? ` в ${a.time}` : ''),
          color: '#2dd4bf',
        })),
        ...analysisRecords.slice(0, 2).map(r => ({
          id: r.id,
          type: 'record' as const,
          title: r.title,
          subtitle: r.source ?? '',
          date: formatDateRu(r.date),
          color: colors.teal,
        })),
      ]
      setRecentEvents(events)
    }
    loadDashboard()
  }, [])

  const greeting = userName
    ? `Добро пожаловать, ${userName}`
    : 'Добро пожаловать'

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{greeting}</Text>
        <Text style={styles.subtitle}>Ваша медицинская книжка</Text>
      </View>

      {/* Onboarding banner */}
      <TouchableOpacity
        style={styles.banner}
        onPress={() => router.push('/(tabs)/upload')}
        activeOpacity={0.9}
      >
        <View style={styles.bannerIcon}>
          <Ionicons name="add-circle" size={24} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Начните заполнять медкарту</Text>
          <Text style={styles.bannerDesc}>
            Загрузите первый документ — ИИ разберёт показатели автоматически
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={20} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Быстрые действия</Text>
      <View style={styles.actionsGrid}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.href}
            style={[styles.actionCard, { backgroundColor: a.color }]}
            onPress={() => router.push(a.href as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.actionLabel}>{a.label}</Text>
            <Text style={styles.actionDesc}>{a.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent */}
      <Text style={styles.sectionTitle}>Последние события</Text>
      {recentEvents.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="time-outline" size={32} color={colors.border} />
          <Text style={styles.emptyText}>Пока ничего нет</Text>
          <Text style={styles.emptyHint}>Загрузите первый документ, чтобы начать</Text>
        </Card>
      ) : (
        <Card style={styles.recentCard}>
          {recentEvents.map((e, i) => (
            <View key={e.id} style={[styles.recentItem, i < recentEvents.length - 1 && styles.recentItemBorder]}>
              <View style={[styles.recentDot, { backgroundColor: e.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentTitle}>{e.title}</Text>
                {!!e.subtitle && <Text style={styles.recentSub}>{e.subtitle}</Text>}
                <Text style={styles.recentDate}>{e.date}</Text>
              </View>
              <View style={[styles.recentTypeBadge, { backgroundColor: e.color + '20' }]}>
                <Text style={[styles.recentTypeText, { color: e.color }]}>
                  {e.type === 'appointment' ? 'Приём' : 'Анализ'}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },

  header: { marginBottom: spacing.xs },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },

  banner: {
    backgroundColor: colors.teal,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },
  bannerDesc: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { flex: 1, minWidth: 130, gap: 6 },
  statValue: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted },

  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionCard: {
    flex: 1,
    minWidth: 130,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  actionLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
  actionDesc: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)' },

  emptyCard: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  emptyText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  emptyHint: { fontSize: fontSize.sm, color: colors.textMuted },

  recentCard: { gap: 0, paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  recentItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  recentDot: { width: 8, height: 8, borderRadius: 4 },
  recentTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  recentSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  recentDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  recentTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  recentTypeText: { fontSize: fontSize.xs, fontWeight: '600' },
})
