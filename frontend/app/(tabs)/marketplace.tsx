import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'

type Tab = 'pharmacies' | 'labs' | 'doctors'

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'pharmacies', label: 'Аптеки', icon: 'medkit-outline' },
  { key: 'labs', label: 'Лаборатории', icon: 'flask-outline' },
  { key: 'doctors', label: 'Врачи', icon: 'person-outline' },
]

const STUB: Record<Tab, { id: string; name: string; sub?: string; address: string; dist: number; price: number; rating: number }[]> = {
  pharmacies: [
    { id: '1', name: 'Аптека №1',         address: 'ул. Ленина, 12',     dist: 0.3, price: 245, rating: 4.8 },
    { id: '2', name: 'Планета Здоровья',  address: 'пр. Мира, 45',       dist: 0.7, price: 289, rating: 4.5 },
    { id: '3', name: 'Горздрав',          address: 'ул. Садовая, 8',      dist: 1.2, price: 210, rating: 4.3 },
  ],
  labs: [
    { id: '1', name: 'Helix',   address: 'ул. Арбат, 5',       dist: 0.5, price: 1800, rating: 4.9 },
    { id: '2', name: 'Инвитро', address: 'пр. Победы, 22',     dist: 0.9, price: 2100, rating: 4.7 },
    { id: '3', name: 'CMD',     address: 'ул. Кирова, 15',     dist: 1.5, price: 1650, rating: 4.6 },
  ],
  doctors: [
    { id: '1', name: 'Иванова А.В.', sub: 'Терапевт',    address: 'Клиника Медси', dist: 0.4, price: 2500, rating: 4.9 },
    { id: '2', name: 'Петров С.Н.',  sub: 'Кардиолог',   address: 'Клиника К+31',  dist: 1.1, price: 3500, rating: 4.8 },
  ],
}

const actionLabel: Record<Tab, string> = {
  pharmacies: 'Заказать',
  labs: 'Записаться',
  doctors: 'Записаться',
}

export default function MarketplaceScreen() {
  const [tab, setTab] = useState<Tab>('pharmacies')
  const [search, setSearch] = useState('')

  const items = STUB[tab].filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View>
        <Text style={styles.title}>Маркетплейс</Text>
        <Text style={styles.subtitle}>Лучшие цены рядом с вами</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={t.icon as any}
              size={15}
              color={tab === t.key ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={tab === 'doctors' ? 'Специальность или имя...' : 'Название...'}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Geo note */}
      <View style={styles.geoNote}>
        <Ionicons name="location-outline" size={13} color={colors.teal} />
        <Text style={styles.geoText}>Сортировка по расстоянию · Данные демонстрационные</Text>
      </View>

      {/* Results */}
      {items.map((item) => (
        <Card key={item.id} style={styles.item}>
          <View style={styles.itemIcon}>
            <Ionicons
              name={tab === 'doctors' ? 'person' : tab === 'labs' ? 'flask' : 'medkit'}
              size={22}
              color={colors.teal}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.sub && <Text style={styles.itemSub}>{item.sub}</Text>}
            <View style={styles.itemMeta}>
              <Ionicons name="location-outline" size={11} color={colors.textMuted} />
              <Text style={styles.itemMetaText}>{item.address}</Text>
              <Text style={styles.itemMetaText}>· {item.dist} км</Text>
              <Ionicons name="star" size={11} color="#f59e0b" />
              <Text style={styles.itemMetaText}>{item.rating}</Text>
            </View>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemPrice}>₽{item.price.toLocaleString()}</Text>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
              <Text style={styles.actionBtnText}>{actionLabel[tab]}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },

  tabRow: { flexDirection: 'row', gap: spacing.sm },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tabLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  tabLabelActive: { color: colors.white },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text },

  geoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg,
    paddingVertical: 6,
  },
  geoText: { fontSize: fontSize.xs, color: colors.textMuted },

  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  itemSub: { fontSize: fontSize.xs, color: colors.teal, fontWeight: '600', marginTop: 1 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  itemMetaText: { fontSize: fontSize.xs, color: colors.textMuted },
  itemRight: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  itemPrice: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  actionBtn: {
    backgroundColor: colors.teal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  actionBtnText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.white },
})
