import { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, ActivityIndicator, Modal, Platform, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'
import { aiApi } from '@/src/api/client'
import { storage } from '@/src/lib/storage'
import { getDemoType } from '@/src/data/demo'

type TabKey = 'encyclopedia' | 'doctor'

// ─── Encyclopedia data ────────────────────────────────────────────────────────

interface Topic {
  id: string; icon: string; label: string; category: string; prompt: string
}

const TOPICS: Topic[] = [
  { id: 't1',  icon: '❤️',  label: 'Гипертония',          category: 'кардиология',       prompt: 'Объясни простым языком что такое артериальная гипертония, каковы причины, симптомы, риски и основные рекомендации по лечению и профилактике.' },
  { id: 't2',  icon: '🫀',  label: 'Аритмия',              category: 'кардиология',       prompt: 'Объясни простым языком что такое аритмия сердца, какие бывают виды, симптомы, когда опасна и когда нужно обратиться к врачу.' },
  { id: 't3',  icon: '🩸',  label: 'Анемия',               category: 'анемия',            prompt: 'Объясни простым языком что такое анемия, причины (нехватка железа, В12 и др.), симптомы и методы лечения.' },
  { id: 't4',  icon: '🍬',  label: 'Сахарный диабет',      category: 'диабет',            prompt: 'Объясни простым языком что такое сахарный диабет 1 и 2 типа, чем отличаются, симптомы и управление болезнью.' },
  { id: 't5',  icon: '🦋',  label: 'Щитовидная железа',    category: 'эндокринология',    prompt: 'Объясни простым языком что делает щитовидная железа, что такое гипотиреоз и гипертиреоз, симптомы и лечение.' },
  { id: 't6',  icon: '🫁',  label: 'Астма',                category: 'пульмонология',     prompt: 'Объясни простым языком что такое бронхиальная астма, причины приступов, симптомы, принципы лечения.' },
  { id: 't7',  icon: '🧠',  label: 'Мигрень',              category: 'неврология',        prompt: 'Объясни простым языком что такое мигрень, чем отличается от обычной головной боли, триггеры, симптомы и лечение.' },
  { id: 't8',  icon: '🦴',  label: 'Остеопороз',           category: 'ортопедия',         prompt: 'Объясни простым языком что такое остеопороз, факторы риска, диагностика и как укрепить кости.' },
  { id: 't9',  icon: '🫃',  label: 'Гастрит',              category: 'гастроэнтерология', prompt: 'Объясни простым языком что такое гастрит, виды, симптомы и лечение.' },
  { id: 't10', icon: '👁️', label: 'Близорукость',         category: 'офтальмология',     prompt: 'Объясни простым языком что такое близорукость, почему развивается, как корректируется и можно ли предотвратить.' },
  { id: 't11', icon: '🤰',  label: 'ГРЗ при беременности', category: 'акушерство',        prompt: 'Объясни простым языком какие ОРВИ опасны при беременности, как лечить безопасно и чего избегать.' },
  { id: 't12', icon: '💊',  label: 'Холестерин',           category: 'кардиология',       prompt: 'Объясни простым языком что такое холестерин, разница между «хорошим» и «плохим», нормы и как снизить без лекарств.' },
]

const CATEGORIES = ['все', 'кардиология', 'анемия', 'диабет', 'эндокринология', 'пульмонология', 'неврология', 'ортопедия', 'гастроэнтерология', 'офтальмология', 'акушерство']

// ─── Doctor link data ─────────────────────────────────────────────────────────

const DOCTOR_LINKS: Record<string, { tokenId: string; label: string; desc: string }> = {
  male:            { tokenId: 'demo-male',    label: 'Иван Петров',   desc: 'Мужской кабинет' },
  female_pregnant: { tokenId: 'demo-female',  label: 'Мария Иванова', desc: 'Беременность 18 нед.' },
  female_cycle:    { tokenId: 'demo-female2', label: 'Анна Соколова', desc: 'Менструальный цикл' },
}

const MODES = [
  { key: 'full',    label: 'Полный доступ',    desc: 'Все анализы и документы', icon: 'documents-outline' },
  { key: 'limited', label: 'Ограниченный',     desc: 'Только последние анализы', icon: 'eye-outline' },
  { key: 'single',  label: 'Один визит',       desc: 'Действует 24 часа', icon: 'time-outline' },
]

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AccessScreen() {
  const [tab, setTab] = useState<TabKey>('encyclopedia')

  return (
    <View style={styles.root}>
      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'encyclopedia' && styles.tabBtnActive]}
          onPress={() => setTab('encyclopedia')}
        >
          <Ionicons name={tab === 'encyclopedia' ? 'book' : 'book-outline'} size={15} color={tab === 'encyclopedia' ? colors.teal : colors.textMuted} />
          <Text style={[styles.tabText, tab === 'encyclopedia' && styles.tabTextActive]}>Справочник</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'doctor' && styles.tabBtnActive]}
          onPress={() => setTab('doctor')}
        >
          <Ionicons name={tab === 'doctor' ? 'share' : 'share-outline'} size={15} color={tab === 'doctor' ? colors.teal : colors.textMuted} />
          <Text style={[styles.tabText, tab === 'doctor' && styles.tabTextActive]}>Ссылка для врача</Text>
        </TouchableOpacity>
      </View>

      {tab === 'encyclopedia' ? <EncyclopediaTab /> : <DoctorLinkTab />}
    </View>
  )
}

// ─── Encyclopedia tab ─────────────────────────────────────────────────────────

function EncyclopediaTab() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('все')
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState('')
  const [customQuery, setCustomQuery] = useState('')

  const filteredTopics = TOPICS.filter(t => {
    const matchCat = activeCategory === 'все' || t.category === activeCategory
    const matchSearch = !search || t.label.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const askAI = useCallback(async (prompt: string, title: string) => {
    setModalTitle(title)
    setModalContent('')
    setModalVisible(true)
    setLoading(true)
    try {
      const res = await aiApi.chat(prompt)
      setModalContent(res.data?.reply || res.data?.message || 'Нет ответа от ИИ.')
    } catch {
      setModalContent('Не удалось получить ответ. Проверьте подключение.')
    } finally {
      setLoading(false)
    }
  }, [])

  const askCustom = useCallback(() => {
    if (!customQuery.trim()) return
    const q = customQuery.trim()
    setCustomQuery('')
    askAI(`Объясни простым языком на русском: ${q}. Дай краткое медицинское объяснение с причинами, симптомами и рекомендациями.`, q)
  }, [customQuery, askAI])

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.askCard}>
          <View style={styles.askRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.teal} />
            <Text style={styles.askTitle}>Спросить ИИ</Text>
          </View>
          <Text style={styles.askHint}>Задайте вопрос о любом диагнозе, анализе или симптоме</Text>
          <View style={styles.askInputRow}>
            <TextInput
              style={styles.askInput}
              placeholder="Что значит повышенный АЛТ?"
              placeholderTextColor={colors.textMuted}
              value={customQuery}
              onChangeText={setCustomQuery}
              returnKeyType="send"
              onSubmitEditing={askCustom}
            />
            <TouchableOpacity
              style={[styles.askBtn, !customQuery.trim() && styles.askBtnDisabled]}
              onPress={askCustom}
              disabled={!customQuery.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>#{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по справочнику..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.grid}>
          {filteredTopics.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyText}>Ничего не найдено</Text></View>
          ) : filteredTopics.map(topic => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() => askAI(topic.prompt, topic.label)}
              activeOpacity={0.8}
            >
              <Text style={styles.topicIcon}>{topic.icon}</Text>
              <Text style={styles.topicLabel}>{topic.label}</Text>
              <Text style={styles.topicCategory}>#{topic.category}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={2}>{modalTitle}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="large" color={colors.teal} />
                <Text style={styles.loadingText}>ИИ готовит объяснение...</Text>
              </View>
            ) : (
              <>
                <View style={styles.aiBadge}>
                  <Ionicons name="sparkles" size={13} color={colors.teal} />
                  <Text style={styles.aiBadgeText}>Объяснение от ИИ-ассистента</Text>
                </View>
                <Text style={styles.modalContent}>{modalContent}</Text>
                <View style={styles.disclaimer}>
                  <Ionicons name="information-circle-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.disclaimerText}>Информация носит ознакомительный характер. Для постановки диагноза обратитесь к врачу.</Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

// ─── Doctor link tab ──────────────────────────────────────────────────────────

function DoctorLinkTab() {
  const [selectedMode, setSelectedMode] = useState('full')
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [demoType, setDemoType] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Detect demo type once on mount
  useState(() => {
    getDemoType(storage).then(t => setDemoType(t))
  })

  function getBaseUrl() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.origin
    }
    return 'http://45.80.130.211:3000'
  }

  function generateLink() {
    setLoading(true)
    setTimeout(() => {
      const profile = DOCTOR_LINKS[demoType ?? 'male'] ?? DOCTOR_LINKS['male']
      const baseUrl = getBaseUrl()
      setGeneratedLink(`${baseUrl}/doctor/${profile.tokenId}`)
      setLoading(false)
    }, 600)
  }

  function copyLink() {
    if (!generatedLink) return
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedLink).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const profile = DOCTOR_LINKS[demoType ?? 'male'] ?? DOCTOR_LINKS['male']

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Info */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="share-social-outline" size={22} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Ссылка для врача</Text>
            <Text style={styles.infoText}>
              Сгенерируйте ссылку и отправьте врачу. Он откроет медицинскую карту в браузере без регистрации.
              Вы контролируете срок и объём данных.
            </Text>
          </View>
        </View>
      </Card>

      {/* Mode selector */}
      <Text style={styles.sectionLabel}>Режим доступа</Text>
      <View style={styles.modesGrid}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeCard, selectedMode === m.key && styles.modeCardActive]}
            onPress={() => setSelectedMode(m.key)}
            activeOpacity={0.8}
          >
            <Ionicons name={m.icon as any} size={20} color={selectedMode === m.key ? colors.teal : colors.textMuted} />
            <Text style={[styles.modeLabel, selectedMode === m.key && styles.modeLabelActive]}>{m.label}</Text>
            <Text style={styles.modeDesc}>{m.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview of patient */}
      <Text style={styles.sectionLabel}>Данные пациента</Text>
      <Card style={styles.patientPreview}>
        <View style={styles.patientRow}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientAvatarText}>{profile.label.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{profile.label}</Text>
            <Text style={styles.patientDesc}>{profile.desc} · Демо-аккаунт</Text>
          </View>
        </View>
      </Card>

      {/* Generate button */}
      {!generatedLink ? (
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={generateLink}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
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
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.linkTitle}>Ссылка готова!</Text>
          </View>

          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={2} selectable>{generatedLink}</Text>
          </View>

          <View style={styles.linkActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={copyLink} activeOpacity={0.85}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={colors.white} />
              <Text style={styles.copyBtnText}>{copied ? 'Скопировано!' : 'Копировать'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => setGeneratedLink(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>Новая ссылка</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkHint}>
            <Ionicons name="information-circle-outline" size={13} color={colors.textMuted} />
            <Text style={styles.linkHintText}>
              Отправьте ссылку врачу в мессенджере или покажите QR-код.
              В демо-режиме ссылка показывает тестовые данные.
            </Text>
          </View>
        </Card>
      )}

      {/* What doctor sees */}
      <Text style={styles.sectionLabel}>Что увидит врач</Text>
      <Card style={styles.previewList}>
        {[
          { icon: 'person-outline', text: 'ФИО, возраст, пол' },
          { icon: 'flask-outline', text: 'Последние анализы с расшифровкой' },
          { icon: 'alert-circle-outline', text: 'Отклонения от нормы выделены' },
          { icon: 'medical-outline', text: 'Диагнозы и текущие препараты' },
          { icon: 'calendar-outline', text: 'Предстоящие визиты к врачам' },
        ].map(item => (
          <View key={item.icon} style={styles.previewRow}>
            <Ionicons name={item.icon as any} size={16} color={colors.teal} />
            <Text style={styles.previewText}>{item.text}</Text>
          </View>
        ))}
      </Card>

    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.teal },
  tabText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: colors.teal, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md },

  // Ask AI
  askCard: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, gap: spacing.sm,
  },
  askRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  askTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  askHint: { fontSize: fontSize.sm, color: colors.textMuted },
  askInputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  askInput: {
    flex: 1, height: 44, paddingHorizontal: spacing.md,
    backgroundColor: colors.bg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    fontSize: fontSize.sm, color: colors.text,
  },
  askBtn: { width: 44, height: 44, backgroundColor: colors.teal, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  askBtnDisabled: { backgroundColor: colors.border },

  chips: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.white },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    height: 40, paddingHorizontal: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  topicCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6,
  },
  topicIcon: { fontSize: 26 },
  topicLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  topicCategory: { fontSize: fontSize.xs, color: colors.teal },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },

  // Modal
  modal: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: spacing.xl,
  },
  modalTitle: { flex: 1, fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginRight: spacing.sm },
  modalClose: { padding: 4 },
  modalBody: { flex: 1, padding: spacing.lg },
  loadingBlock: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  loadingText: { fontSize: fontSize.md, color: colors.textMuted },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.md, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.tealLight, borderRadius: radius.full, alignSelf: 'flex-start' },
  aiBadgeText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.teal },
  modalContent: { fontSize: fontSize.md, color: colors.text, lineHeight: 26 },
  disclaimer: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: spacing.xl, padding: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md },
  disclaimerText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },

  // Doctor link tab
  infoCard: { backgroundColor: colors.tealLight, borderColor: colors.tealBorder },
  infoRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  infoTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.tealDark, marginBottom: 4 },
  infoText: { fontSize: fontSize.sm, color: colors.tealDark, lineHeight: 20 },

  sectionLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  modesGrid: { flexDirection: 'row', gap: spacing.sm },
  modeCard: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, gap: 5, alignItems: 'center' },
  modeCardActive: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  modeLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text, textAlign: 'center' },
  modeLabelActive: { color: colors.teal },
  modeDesc: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },

  patientPreview: {},
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  patientAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  patientAvatarText: { fontSize: fontSize.lg, fontWeight: '800', color: colors.white },
  patientName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  patientDesc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, height: 52, backgroundColor: colors.teal, borderRadius: radius.md,
  },
  generateBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },

  linkCard: { gap: spacing.md },
  linkHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.success },
  linkBox: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  linkText: { fontSize: fontSize.xs, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  linkActions: { flexDirection: 'row', gap: spacing.sm },
  copyBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, backgroundColor: colors.teal, borderRadius: radius.md },
  copyBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
  resetBtn: { flex: 1, height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  resetBtnText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
  linkHint: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  linkHintText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },

  previewList: { gap: spacing.sm },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewText: { fontSize: fontSize.sm, color: colors.text },
})
