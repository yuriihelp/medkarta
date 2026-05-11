import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Slot, useRouter, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize } from '@/src/lib/theme'
import { storage } from '@/src/lib/storage'

const baseNav = [
  { href: '/(tabs)/',            label: 'Дашборд',      icon: 'grid-outline',         iconActive: 'grid',         female: false },
  { href: '/(tabs)/records',     label: 'Медкарта',     icon: 'folder-outline',       iconActive: 'folder',       female: false },
  { href: '/(tabs)/upload',      label: 'Загрузка',     icon: 'cloud-upload-outline', iconActive: 'cloud-upload', female: false },
  { href: '/(tabs)/ai',          label: 'ИИ-ассистент', icon: 'chatbubble-outline',   iconActive: 'chatbubble',   female: false },
  { href: '/(tabs)/analytics',   label: 'Аналитика',    icon: 'bar-chart-outline',    iconActive: 'bar-chart',    female: false },
  { href: '/(tabs)/vaccines',    label: 'Прививки',     icon: 'shield-outline',       iconActive: 'shield',       female: false },
  { href: '/(tabs)/calendar',    label: 'Календарь',    icon: 'calendar-outline',     iconActive: 'calendar',     female: false },
  { href: '/(tabs)/health',      label: 'Здоровье',     icon: 'heart-outline',        iconActive: 'heart',        female: true },
  { href: '/(tabs)/access',      label: 'QR-доступ',    icon: 'qr-code-outline',      iconActive: 'qr-code',      female: false },
  { href: '/(tabs)/marketplace', label: 'Маркетплейс',  icon: 'storefront-outline',   iconActive: 'storefront',   female: false },
]

export default function WebLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const [gender, setGender] = useState<string | null>(null)

  useEffect(() => {
    storage.getItem('user_gender').then(g => setGender(g))
  }, [])

  const nav = baseNav.filter(item => !item.female || gender === 'female')

  async function logout() {
    await storage.deleteItem('access_token')
    router.replace('/login')
  }

  return (
    <View style={styles.root}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.logoBlock}>
          <Text style={styles.logo}>ПУЛЬС</Text>
          <Text style={styles.logoSub}>Медицинская книжка</Text>
        </View>

        {/* Nav */}
        <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/(tabs)/' && pathname.startsWith(item.href))
            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => router.push(item.href as any)}
                style={[styles.navItem, active && styles.navItemActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={(active ? item.iconActive : item.icon) as any}
                  size={18}
                  color={active ? colors.white : 'rgba(255,255,255,0.5)'}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.4)" />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Slot />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },

  sidebar: {
    width: 220,
    backgroundColor: colors.navy,
    flexDirection: 'column',
  },
  logoBlock: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: fontSize.xs,
    color: colors.teal,
    marginTop: 2,
  },

  nav: { flex: 1, paddingVertical: spacing.sm },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 2,
  },
  navItemActive: { backgroundColor: colors.teal },
  navLabel: { fontSize: fontSize.sm, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  navLabelActive: { color: colors.white, fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  logoutText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.4)' },

  content: { flex: 1 },
  contentInner: { padding: spacing.xl, maxWidth: 900, width: '100%', alignSelf: 'center' },
})
