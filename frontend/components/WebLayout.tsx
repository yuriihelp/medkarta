import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  useWindowDimensions, Pressable,
} from 'react-native'
import { Slot, useRouter, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize } from '@/src/lib/theme'
import { storage } from '@/src/lib/storage'

const SIDEBAR_WIDTH = 220
const MOBILE_BREAKPOINT = 768

const baseNav = [
  { href: '/(tabs)/',            label: 'Дашборд',      icon: 'grid-outline',         iconActive: 'grid',         female: false },
  { href: '/(tabs)/records',     label: 'Медкарта',     icon: 'folder-outline',       iconActive: 'folder',       female: false },
  { href: '/(tabs)/analytics',   label: 'Аналитика',    icon: 'bar-chart-outline',    iconActive: 'bar-chart',    female: false },
  { href: '/(tabs)/vaccines',    label: 'Прививки',     icon: 'shield-outline',       iconActive: 'shield',       female: false },
  { href: '/(tabs)/calendar',    label: 'Календарь',    icon: 'calendar-outline',     iconActive: 'calendar',     female: false },
  { href: '/(tabs)/health',      label: 'Здоровье',     icon: 'heart-outline',        iconActive: 'heart',        female: true },
  { href: '/(tabs)/ai',          label: 'ИИ-ассистент', icon: 'chatbubble-outline',   iconActive: 'chatbubble',   female: false },
  { href: '/(tabs)/upload',      label: 'Загрузка',     icon: 'cloud-upload-outline', iconActive: 'cloud-upload', female: false },
  { href: '/(tabs)/access',      label: 'Справочник',   icon: 'book-outline',         iconActive: 'book',         female: false },
  { href: '/(tabs)/marketplace', label: 'Маркетплейс',  icon: 'storefront-outline',   iconActive: 'storefront',   female: false },
]

export default function WebLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { width } = useWindowDimensions()
  const isMobile = width < MOBILE_BREAKPOINT

  const [gender, setGender] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    storage.getItem('user_gender').then(g => setGender(g))
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const nav = baseNav.filter(item => !item.female || gender === 'female')

  async function logout() {
    await storage.deleteItem('access_token')
    await storage.deleteItem('user_gender')
    await storage.deleteItem('user_birth_date')
    await storage.deleteItem('user_name')
    router.replace('/login')
  }

  function navigate(href: string) {
    router.push(href as any)
    setSidebarOpen(false)
  }

  const showSidebar = !isMobile || sidebarOpen

  return (
    <View style={styles.root}>

      {/* Backdrop (mobile overlay) */}
      {isMobile && sidebarOpen && (
        <Pressable style={styles.backdrop} onPress={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
          {/* Logo */}
          <View style={styles.logoBlock}>
            <View style={styles.logoRow}>
              <View>
                <Text style={styles.logo}>ПУЛЬС</Text>
                <Text style={styles.logoSub}>Медицинская книжка</Text>
              </View>
              {isMobile && (
                <TouchableOpacity onPress={() => setSidebarOpen(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Nav */}
          <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
            {nav.map((item) => {
              const active = pathname === item.href ||
                (item.href !== '/(tabs)/' && pathname.startsWith(item.href))
              return (
                <TouchableOpacity
                  key={item.href}
                  onPress={() => navigate(item.href)}
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
      )}

      {/* Content */}
      <View style={styles.contentWrap}>
        {/* Mobile top bar */}
        {isMobile && (
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.hamburger}>
              <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>ПУЛЬС</Text>
            <View style={{ width: 40 }} />
          </View>
        )}

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentInner,
            isMobile && styles.contentInnerMobile,
          ]}
        >
          <Slot />
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },

  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 10,
  },

  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.navy,
    flexDirection: 'column',
  },
  sidebarMobile: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },

  logoBlock: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingTop: 52,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: { fontSize: 22, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  logoSub: { fontSize: fontSize.xs, color: colors.teal, marginTop: 2 },
  closeBtn: { padding: 4, marginTop: -2 },

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

  contentWrap: { flex: 1, flexDirection: 'column' },

  topBar: {
    height: 52,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  hamburger: { padding: 8 },
  topBarTitle: { fontSize: 17, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },

  content: { flex: 1 },
  contentInner: {
    padding: spacing.xl,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  contentInnerMobile: {
    padding: spacing.md,
  },
})
