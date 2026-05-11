import { View, StyleSheet } from 'react-native'
import { colors, radius, shadow } from '@/src/lib/theme'

interface CardProps {
  children: React.ReactNode
  style?: object
  padded?: boolean
}

export function Card({ children, style, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  padded: {
    padding: 16,
  },
})
