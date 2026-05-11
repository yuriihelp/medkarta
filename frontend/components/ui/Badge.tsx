import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, fontSize } from '@/src/lib/theme'

type Variant = 'teal' | 'red' | 'amber' | 'blue' | 'green' | 'gray'

const variants: Record<Variant, { bg: string; text: string }> = {
  teal:  { bg: colors.tealLight, text: colors.tealDark },
  red:   { bg: colors.dangerBg, text: colors.danger },
  amber: { bg: colors.warningBg, text: colors.warning },
  blue:  { bg: colors.infoBg, text: colors.info },
  green: { bg: colors.successBg, text: colors.success },
  gray:  { bg: colors.borderLight, text: colors.textSecondary },
}

interface BadgeProps {
  label: string
  variant?: Variant
}

export function Badge({ label, variant = 'gray' }: BadgeProps) {
  const v = variants[variant]
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
})
