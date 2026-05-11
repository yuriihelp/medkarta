import { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, ActivityIndicator, Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { aiApi } from '@/src/api/client'

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

export default function EncyclopediaScreen() {
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
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View>
          <Text style={styles.title}>Справочник</Text>
          <Text style={styles.subtitle}>Объяснения болезней и анализов от ИИ</Text>
        </View>

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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },

  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },

  askCard: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  askRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  askTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  askHint: { fontSize: fontSize.sm, color: colors.textMuted },
  askInputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  askInput: { flex: 1, height: 44, paddingHorizontal: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, fontSize: fontSize.sm, color: colors.text },
  askBtn: { width: 44, height: 44, backgroundColor: colors.teal, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  askBtnDisabled: { backgroundColor: colors.border },

  chips: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.white },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 40, paddingHorizontal: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  topicCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6 },
  topicIcon: { fontSize: 26 },
  topicLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  topicCategory: { fontSize: fontSize.xs, color: colors.teal },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },

  modal: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: spacing.xl },
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
})
