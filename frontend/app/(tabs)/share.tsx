import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'
import { storage } from '@/src/lib/storage'
import { getDemoType } from '@/src/data/demo'

const DOCTOR_LINKS: Record<string, { tokenId: string; label: string; desc: string; icon: string }> = {
  male:            { tokenId: 'demo-male',    label: 'Иван Петров',   desc: 'Мужской кабинет',       icon: '👨' },
  female_pregnant: { tokenId: 'demo-female',  label: 'Мария Иванова', desc: 'Беременность 18 нед.',  icon: '🤰' },
  female_cycle:    { tokenId: 'demo-female2', label: 'Анна Соколова', desc: 'Менструальный цикл',    icon: '👩' },
}

const MODES = [
  { key: 'full',    label: 'Полный доступ',  desc: 'Все анализы и документы',   icon: 'documents-outline' as const },
  { key: 'limited', label: 'Ограниченный',   desc: 'Только последние анализы',  icon: 'eye-outline' as const },
  { key: 'single',  label: 'Один визит',     desc: 'Действует 24 часа',         icon: 'time-outline' as const },
]

function getBaseUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://45.80.130.211:3000'
}

export default function ShareScreen() {
  const [selectedMode, setSelectedMode] = useState('full')
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [demoType, setDemoType] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useState(() => {
    getDemoType(storage).then(t => setDemoType(t))
  })

  const profile = DOCTOR_LINKS[demoType ?? 'male'] ?? DOCTOR_LINKS['male']

  function generateLink() {
    setGenerating(true)
    setTimeout(() => {
      setGeneratedLink(`${getBaseUrl()}/doctor/${profile.tokenId}`)
      setGenerating(false)
    }, 700)
  }

  function copyLink() {
    if (!generatedLink) return
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedLink).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View>
        <Text style={styles.title}>Ссылка для врача</Text>
        <Text style={styles.subtitle}>Откройте доступ к карте без регистрации</Text>
      </View>

      {/* Info banner */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="share-social-outline" size={22} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Как это работает</Text>
            <Text style={styles.infoText}>
              Сгенерируйте ссылку и отправьте врачу в мессенджере или покажите на экране.
              Врач откроет вашу карту в браузере без установки приложения.
            </Text>
          </View>
        </View>
      </Card>

      {/* Patient */}
      <Text style={styles.sectionLabel}>Пациент</Text>
      <Card style={styles.patientCard}>
        <View style={styles.patientRow}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientAvatarIcon}>{profile.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{profile.label}</Text>
            <Text style={styles.patientDesc}>{profile.desc}</Text>
          </View>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>ДЕМО</Text>
          </View>
        </View>
      </Card>

      {/* Mode */}
      <Text style={styles.sectionLabel}>Режим доступа</Text>
      <View style={styles.modesGrid}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeCard, selectedMode === m.key && styles.modeCardActive]}
            onPress={() => { setSelectedMode(m.key); setGeneratedLink(null) }}
            activeOpacity={0.8}
          >
            <Ionicons name={m.icon} size={20} color={selectedMode === m.key ? colors.teal : colors.textMuted} />
            <Text style={[styles.modeLabel, selectedMode === m.key && styles.modeLabelActive]}>{m.label}</Text>
            <Text style={styles.modeDesc}>{m.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate / Result */}
      {!generatedLink ? (
        <TouchableOpacity style={styles.generateBtn} onPress={generateLink} disabled={generating} activeOpacity={0.85}>
          {generating
            ? <ActivityIndicator color={colors.white} size="small" />
            : <>
                <Ionicons name="link-outline" size={20} color={colors.white} />
                <Text style={styles.generateBtnText}>Создать ссылку</Text>
              </>
          }
        </TouchableOpacity>
      ) : (
        <Card style={styles.linkCard}>
          <View style={styles.linkHeader}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.linkHeaderText}>Ссылка готова</Text>
          </View>

          <View style={styles.linkBox}>
            <Text style={styles.linkText} selectable numberOfLines={3}>{generatedLink}</Text>
          </View>

          <View style={styles.linkActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={copyLink} activeOpacity={0.85}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={colors.white} />
              <Text style={styles.copyBtnText}>{copied ? 'Скопировано!' : 'Копировать ссылку'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={() => setGeneratedLink(null)} activeOpacity={0.8}>
            <Text style={styles.resetBtnText}>Создать новую ссылку</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* What doctor sees */}
      <Text style={styles.sectionLabel}>Что увидит врач</Text>
      <Card style={styles.previewCard}>
        {[
          { icon: 'person-outline' as const,           text: 'ФИО, возраст, пол' },
          { icon: 'flask-outline' as const,             text: 'Последние анализы с расшифровкой' },
          { icon: 'alert-circle-outline' as const,      text: 'Отклонения от нормы выделены цветом' },
          { icon: 'medical-outline' as const,           text: 'Диагнозы и текущие препараты' },
          { icon: 'calendar-outline' as const,          text: 'Предстоящие записи к врачам' },
        ].map(item => (
          <View key={item.icon} style={styles.previewRow}>
            <Ionicons name={item.icon} size={15} color={colors.teal} />
            <Text style={styles.previewText}>{item.text}</Text>
          </View>
        ))}
      </Card>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },

  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },

  infoCard: { backgroundColor: colors.tealLight, borderColor: colors.tealBorder },
  infoRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  infoTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.tealDark, marginBottom: 4 },
  infoText: { fontSize: fontSize.sm, color: colors.tealDark, lineHeight: 20 },

  sectionLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  patientCard: {},
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  patientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.tealLight, alignItems: 'center', justifyContent: 'center' },
  patientAvatarIcon: { fontSize: 24 },
  patientName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  patientDesc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  demoBadge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.warning, borderRadius: radius.full },
  demoBadgeText: { fontSize: 10, fontWeight: '800', color: colors.white },

  modesGrid: { flexDirection: 'row', gap: spacing.sm },
  modeCard: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, gap: 5, alignItems: 'center' },
  modeCardActive: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  modeLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text, textAlign: 'center' },
  modeLabelActive: { color: colors.teal },
  modeDesc: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },

  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 52, backgroundColor: colors.teal, borderRadius: radius.md },
  generateBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },

  linkCard: { gap: spacing.md },
  linkHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkHeaderText: { fontSize: fontSize.md, fontWeight: '700', color: colors.success },
  linkBox: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  linkText: { fontSize: 12, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 18 },
  linkActions: { flexDirection: 'row' },
  copyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, backgroundColor: colors.teal, borderRadius: radius.md },
  copyBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
  resetBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  resetBtnText: { fontSize: fontSize.sm, color: colors.textMuted },

  previewCard: { gap: spacing.sm },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewText: { fontSize: fontSize.sm, color: colors.text },
})
