import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, radius, fontSize } from '@/src/lib/theme'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  style?: object
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.teal} size="small" />
        : <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles]]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.teal },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  label: { fontSize: fontSize.md, fontWeight: '600' },
  primaryLabel: { color: colors.white },
  secondaryLabel: { color: colors.text },
  ghostLabel: { color: colors.teal },
})
