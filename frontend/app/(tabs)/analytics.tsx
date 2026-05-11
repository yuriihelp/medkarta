import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Modal,
} from 'react-native'
import { theme } from '../../src/lib/theme'
import { storage } from '../../src/lib/storage'
import { isDemoMode, getDemoGender } from '../../src/data/demo'
import {
  DEMO_RECORDS_MALE, DEMO_RECORDS_FEMALE,
  DEMO_DOCUMENTS_MALE, DEMO_DOCUMENTS_FEMALE,
  DemoDocument,
} from '../../src/data/demo'

type TabKey = 'indicators' | 'documents'

interface IndicatorRecord {
  name: string
  value: number
  unit: string
  ref_min: number | null
  ref_max: number | null
  status: 'normal' | 'low' | 'high'
}

interface MedRecord {
  id: string
  title: string
  date: string
  source: string
  summary: string
  indicators: IndicatorRecord[]
}

const STATUS_COLOR: Record<string, string> = {
  normal: '#16a34a',
  low: '#2563eb',
  high: '#dc2626',
}
const STATUS_LABEL: Record<string, string> = { normal: 'норма', low: 'понижен', high: 'повышен' }
const STATUS_BG: Record<string, string> = { normal: '#dcfce7', low: '#dbeafe', high: '#fee2e2' }

const TAG_COLORS = [
  '#0891b2', '#7c3aed', '#dc2626', '#d97706', '#16a34a',
  '#db2777', '#0d9488', '#9f1239', '#6366f1', '#059669',
]
function tagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export default function AnalyticsScreen() {
  const [tab, setTab] = useState<TabKey>('indicators')
  const [records, setRecords] = useState<MedRecord[]>([])
  const [documents, setDocuments] = useState<DemoDocument[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DemoDocument | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const demo = await isDemoMode(storage)
      if (demo) {
        const gender = await getDemoGender(storage)
        setRecords(gender === 'female' ? DEMO_RECORDS_FEMALE : DEMO_RECORDS_MALE)
        setDocuments(gender === 'female' ? DEMO_DOCUMENTS_FEMALE : DEMO_DOCUMENTS_MALE)
      }
    })()
  }, [])

  // Collect all unique tags
  const allTags = [...new Set(documents.flatMap(d => d.tags))].sort()
  const filteredDocs = filterTag ? documents.filter(d => d.tags.includes(filterTag)) : documents

  // Group all indicators across records for charting
  const indicatorMap = new Map<string, Array<{ date: string; value: number; status: string; unit: string; ref_min: number | null; ref_max: number | null }>>()
  records.forEach(rec => {
    rec.indicators.forEach(ind => {
      if (!indicatorMap.has(ind.name)) indicatorMap.set(ind.name, [])
      indicatorMap.get(ind.name)!.push({
        date: rec.date,
        value: ind.value,
        status: ind.status,
        unit: ind.unit,
        ref_min: ind.ref_min,
        ref_max: ind.ref_max,
      })
    })
  })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Аналитика</Text>
        <Text style={styles.headerSub}>Графики показателей и документы</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {([['indicators', 'Показатели'], ['documents', 'Документы']] as [TabKey, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, tab === key && styles.tabBtnActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {tab === 'indicators' ? (
          <IndicatorsTab records={records} indicatorMap={indicatorMap} />
        ) : (
          <DocumentsTab
            documents={filteredDocs}
            allTags={allTags}
            filterTag={filterTag}
            onFilterTag={tag => setFilterTag(prev => prev === tag ? null : tag)}
            onOpen={setSelectedDoc}
          />
        )}
      </ScrollView>

      {/* Document viewer modal */}
      {selectedDoc && (
        <DocumentModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </View>
  )
}

// ─── Indicators Tab ───────────────────────────────────────────────────────────

function IndicatorsTab({ records, indicatorMap }: {
  records: MedRecord[]
  indicatorMap: Map<string, Array<{ date: string; value: number; status: string; unit: string; ref_min: number | null; ref_max: number | null }>>
}) {
  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>Нет данных</Text>
        <Text style={styles.emptyText}>Войдите под демо-аккаунтом или загрузите анализы</Text>
      </View>
    )
  }

  // Summary counts
  const allIndicators = Array.from(indicatorMap.values()).flatMap(a => a)
  const countNormal = allIndicators.filter(i => i.status === 'normal').length
  const countHigh = allIndicators.filter(i => i.status === 'high').length
  const countLow = allIndicators.filter(i => i.status === 'low').length

  return (
    <View style={{ padding: 16 }}>
      {/* Summary row */}
      <View style={styles.summaryRow}>
        <SummaryCard count={countNormal} label="В норме" color="#16a34a" bg="#dcfce7" />
        <SummaryCard count={countHigh} label="Повышено" color="#dc2626" bg="#fee2e2" />
        <SummaryCard count={countLow} label="Понижено" color="#2563eb" bg="#dbeafe" />
      </View>

      {/* Records list */}
      {records.map(rec => (
        <View key={rec.id} style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>{rec.title}</Text>
            <Text style={styles.recordDate}>{formatDate(rec.date)}</Text>
          </View>
          <Text style={styles.recordSource}>{rec.source}</Text>
          {rec.summary ? <Text style={styles.recordSummary}>{rec.summary}</Text> : null}

          {rec.indicators.length > 0 && (
            <View style={styles.indicatorList}>
              {rec.indicators.map((ind, i) => (
                <IndicatorRow key={i} indicator={ind} />
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Chart section */}
      {indicatorMap.size > 0 && (
        <>
          <Text style={styles.sectionTitle}>Динамика показателей</Text>
          {Array.from(indicatorMap.entries()).map(([name, points]) => (
            <IndicatorChart key={name} name={name} points={points} />
          ))}
        </>
      )}
    </View>
  )
}

function SummaryCard({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <Text style={[styles.summaryNum, { color }]}>{count}</Text>
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
    </View>
  )
}

function IndicatorRow({ indicator }: { indicator: IndicatorRecord }) {
  const color = STATUS_COLOR[indicator.status]
  const bg = STATUS_BG[indicator.status]
  const barWidth = getBarPercent(indicator.value, indicator.ref_min, indicator.ref_max)

  return (
    <View style={styles.indicatorRow}>
      <View style={styles.indicatorTop}>
        <Text style={styles.indicatorName}>{indicator.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
          <Text style={[styles.statusText, { color }]}>
            {indicator.value} {indicator.unit}
          </Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: color }]} />
        {/* Normal zone markers */}
        {indicator.ref_min != null && indicator.ref_max != null && (
          <View style={styles.normalZone} />
        )}
      </View>
      <View style={styles.rangeRow}>
        {indicator.ref_min != null && <Text style={styles.rangeText}>Мин: {indicator.ref_min}</Text>}
        <Text style={[styles.statusLabel2, { color }]}>{STATUS_LABEL[indicator.status]}</Text>
        {indicator.ref_max != null && <Text style={styles.rangeText}>Макс: {indicator.ref_max}</Text>}
      </View>
    </View>
  )
}

function IndicatorChart({ name, points }: {
  name: string
  points: Array<{ date: string; value: number; status: string; unit: string; ref_min: number | null; ref_max: number | null }>
}) {
  if (points.length < 2) return null // no trend to show
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const values = sorted.map(p => p.value)
  const min = Math.min(...values) * 0.9
  const max = Math.max(...values) * 1.1 || min + 1
  const BAR_H = 60

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{name} ({sorted[0].unit})</Text>
      <View style={styles.chartBars}>
        {sorted.map((p, i) => {
          const pct = ((p.value - min) / (max - min)) * 100
          const color = STATUS_COLOR[p.status]
          return (
            <View key={i} style={styles.chartBarCol}>
              <Text style={[styles.chartValue, { color }]}>{p.value}</Text>
              <View style={[styles.chartBarBg, { height: BAR_H }]}>
                <View style={[styles.chartBarFill, { height: `${Math.max(pct, 5)}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.chartDate}>{p.date.slice(5)}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({ documents, allTags, filterTag, onFilterTag, onOpen }: {
  documents: DemoDocument[]
  allTags: string[]
  filterTag: string | null
  onFilterTag: (t: string) => void
  onOpen: (d: DemoDocument) => void
}) {
  const typeIcon: Record<string, string> = {
    conclusion: '📋',
    analysis: '🧪',
    imaging: '🔬',
    prescription: '💊',
  }

  return (
    <View style={{ padding: 16 }}>
      {/* Tag filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
        {allTags.map(tag => {
          const active = filterTag === tag
          const color = tagColor(tag)
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => onFilterTag(tag)}
              style={[styles.filterTag, { borderColor: color, backgroundColor: active ? color : 'transparent' }]}
            >
              <Text style={[styles.filterTagText, { color: active ? '#fff' : color }]}>{tag}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Document cards */}
      {documents.map(doc => (
        <TouchableOpacity key={doc.id} style={styles.docCard} onPress={() => onOpen(doc)} activeOpacity={0.85}>
          <View style={styles.docHeader}>
            <Text style={styles.docIcon}>{typeIcon[doc.type]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.docMeta}>{doc.doctor} · {formatDate(doc.date)}</Text>
              <Text style={styles.docClinic}>{doc.clinic}</Text>
            </View>
          </View>
          <Text style={styles.docSummary}>{doc.summary}</Text>
          <View style={styles.docTags}>
            {doc.tags.map(tag => {
              const color = tagColor(tag)
              return (
                <View key={tag} style={[styles.docTag, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.docTagText, { color }]}>{tag}</Text>
                </View>
              )
            })}
          </View>
          <Text style={styles.docOpenHint}>Нажмите, чтобы открыть →</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

// ─── Document Modal ───────────────────────────────────────────────────────────

function DocumentModal({ doc, onClose }: { doc: DemoDocument; onClose: () => void }) {
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalTitleRow}>
            <Text style={styles.modalTitle}>{doc.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalMeta}>{doc.doctor} · {formatDate(doc.date)} · {doc.clinic}</Text>

          <View style={styles.docTags} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {doc.tags.map(tag => {
              const color = tagColor(tag)
              return (
                <View key={tag} style={[styles.docTag, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.docTagText, { color }]}>{tag}</Text>
                </View>
              )
            })}
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>{doc.fullText}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

function getBarPercent(value: number, min: number | null, max: number | null): number {
  if (min == null || max == null) return 50
  const range = max - min
  if (range <= 0) return 50
  const pct = ((value - min) / range) * 100
  return Math.min(Math.max(pct, 2), 100)
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: '#1e3a5f',
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 14, color: theme.colors.textMuted },
  tabTextActive: { color: theme.colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '800' },
  summaryLabel: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  recordCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recordTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, flex: 1 },
  recordDate: { fontSize: 12, color: theme.colors.primary, marginLeft: 8 },
  recordSource: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  recordSummary: { fontSize: 13, color: theme.colors.text, marginTop: 8, lineHeight: 18, fontStyle: 'italic' },
  indicatorList: { marginTop: 10, gap: 10 },
  indicatorRow: { gap: 4 },
  indicatorTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  indicatorName: { fontSize: 13, color: theme.colors.text, fontWeight: '500', flex: 1 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  barFill: { height: '100%', borderRadius: 3 },
  normalZone: {},
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rangeText: { fontSize: 10, color: theme.colors.textMuted },
  statusLabel2: { fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 10 },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, justifyContent: 'flex-start' },
  chartBarCol: { alignItems: 'center', gap: 4, minWidth: 48 },
  chartValue: { fontSize: 11, fontWeight: '700' },
  chartBarBg: { width: 32, backgroundColor: '#f1f5f9', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  chartBarFill: { width: '100%', borderRadius: 4 },
  chartDate: { fontSize: 10, color: theme.colors.textMuted },
  tagScroll: { marginBottom: 14 },
  filterTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  filterTagText: { fontSize: 12, fontWeight: '600' },
  docCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  docHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  docIcon: { fontSize: 28 },
  docTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  docMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  docClinic: { fontSize: 12, color: theme.colors.primary, marginTop: 1 },
  docSummary: { fontSize: 13, color: theme.colors.text, lineHeight: 18, marginBottom: 10 },
  docTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  docTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  docTagText: { fontSize: 11, fontWeight: '600' },
  docOpenHint: { fontSize: 11, color: theme.colors.textMuted, textAlign: 'right' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '88%',
  },
  modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text, flex: 1, paddingRight: 12 },
  modalClose: { padding: 4 },
  modalCloseText: { fontSize: 18, color: theme.colors.textMuted },
  modalMeta: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 12 },
  modalBody: { flex: 1 },
  modalText: { fontSize: 13, color: theme.colors.text, lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
})
