import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { Card } from '@/components/ui/Card'

type QRMode = 'single' | 'permanent' | 'partial'

const modes: { key: QRMode; label: string; desc: string; icon: string }[] = [
  { key: 'single', label: 'Один визит', desc: 'Действует 24 часа', icon: 'time-outline' },
  { key: 'permanent', label: 'Постоянный', desc: 'Лечащий врач', icon: 'infinite-outline' },
  { key: 'partial', label: 'Выборочный', desc: 'Только часть данных', icon: 'eye-outline' },
]

export default function AccessScreen() {
  const [creating, setCreating] = useState(false)
  const [selectedMode, setSelectedMode] = useState<QRMode>('single')

  function generateQR() {
    setCreating(false)
    Alert.alert('QR создан', 'Покажите врачу — он откроет карту в браузере без установки приложения')
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View>
        <Text style={styles.title}>QR-доступ</Text>
        <Text style={styles.subtitle}>Управляйте тем, кто видит вашу карту</Text>
      </View>

      {/* How it works */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="qr-code" size={24} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Как это работает</Text>
            <Text style={styles.infoText}>
              Покажите QR-код врачу на приёме. Он открывает карту в браузере без приложения.
              Вы контролируете срок и объём данных.
            </Text>
          </View>
        </View>
      </Card>

      {/* Create button */}
      {!creating && (
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreating(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>Создать QR-код</Text>
        </TouchableOpacity>
      )}

      {/* Mode selector */}
      {creating && (
        <Card style={styles.createCard}>
          <Text style={styles.createTitle}>Режим доступа</Text>
          <View style={styles.modesGrid}>
            {modes.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeCard, selectedMode === m.key && styles.modeCardActive]}
                onPress={() => setSelectedMode(m.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={m.icon as any}
                  size={22}
                  color={selectedMode === m.key ? colors.teal : colors.textMuted}
                />
                <Text style={[styles.modeLabel, selectedMode === m.key && styles.modeLabelActive]}>
                  {m.label}
                </Text>
                <Text style={styles.modeDesc}>{m.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.createActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setCreating(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={generateQR}
              activeOpacity={0.85}
            >
              <Text style={styles.generateText}>Сгенерировать QR</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Active tokens */}
      <Text style={styles.sectionTitle}>Активные доступы</Text>
      <Card style={styles.emptyCard}>
        <Ionicons name="shield-checkmark-outline" size={36} color={colors.border} />
        <Text style={styles.emptyText}>Нет активных доступов</Text>
        <Text style={styles.emptyHint}>Создайте QR-код для врача</Text>
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

  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
  },
  createBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },

  createCard: { gap: spacing.md },
  createTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  modesGrid: { flexDirection: 'row', gap: spacing.sm },
  modeCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 6,
    alignItems: 'center',
  },
  modeCardActive: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  modeLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, textAlign: 'center' },
  modeLabelActive: { color: colors.teal },
  modeDesc: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },

  createActions: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  generateBtn: {
    flex: 2,
    height: 48,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },

  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyCard: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  emptyText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  emptyHint: { fontSize: fontSize.sm, color: colors.textMuted },
})
