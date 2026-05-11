import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'
import type { RecordType } from '@/src/types'

type Filter = RecordType | 'all'

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'analysis', label: 'Анализы' },
  { key: 'discharge', label: 'Выписки' },
  { key: 'prescription', label: 'Рецепты' },
  { key: 'vaccination', label: 'Прививки' },
  { key: 'imaging', label: 'Снимки' },
]

export default function RecordsScreen() {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Медкарта</Text>
          <Text style={styles.subtitle}>Вся история здоровья</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(tabs)/upload')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>Добавить</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск по документам..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty */}
      <Card style={styles.emptyCard}>
        <Ionicons name="folder-open-outline" size={40} color={colors.border} />
        <Text style={styles.emptyTitle}>Документов пока нет</Text>
        <Text style={styles.emptyDesc}>
          Загрузите анализы, выписки или рецепты — ИИ всё структурирует
        </Text>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => router.push('/(tabs)/upload')}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadBtnText}>Загрузить первый документ</Text>
        </TouchableOpacity>
      </Card>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  addBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: fontSize.sm, color: colors.text },

  chips: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },

  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    marginTop: spacing.sm,
  },
  emptyTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.textSecondary },
  emptyDesc: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
  uploadBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  uploadBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
})
