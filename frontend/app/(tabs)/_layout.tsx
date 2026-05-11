import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/src/lib/theme'
import WebLayout from '@/components/WebLayout'
import { storage } from '@/src/lib/storage'

const coreTabs = [
  { name: 'index',       title: 'Дашборд',    icon: 'grid-outline',            iconActive: 'grid' },
  { name: 'records',     title: 'Медкарта',   icon: 'folder-outline',          iconActive: 'folder' },
  { name: 'analytics',  title: 'Аналитика',  icon: 'bar-chart-outline',       iconActive: 'bar-chart' },
  { name: 'vaccines',    title: 'Прививки',   icon: 'shield-outline',          iconActive: 'shield' },
  { name: 'calendar',   title: 'Календарь',  icon: 'calendar-outline',        iconActive: 'calendar' },
  { name: 'health',      title: 'Здоровье',   icon: 'heart-outline',           iconActive: 'heart' },
  { name: 'ai',          title: 'ИИ',         icon: 'chatbubble-outline',      iconActive: 'chatbubble' },
  { name: 'upload',      title: 'Загрузка',   icon: 'cloud-upload-outline',    iconActive: 'cloud-upload' },
  { name: 'access',      title: 'QR',         icon: 'qr-code-outline',         iconActive: 'qr-code' },
  { name: 'marketplace', title: 'Маркет',     icon: 'storefront-outline',      iconActive: 'storefront' },
]

export default function TabsLayout() {
  const [gender, setGender] = useState<string | null>(null)

  useEffect(() => {
    storage.getItem('user_gender').then(g => setGender(g))
  }, [])

  if (Platform.OS === 'web') {
    return <WebLayout />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      {coreTabs.map((t) => {
        const mobileHidden = ['upload', 'ai', 'access', 'marketplace'].includes(t.name)
        const hiddenOnMobile = mobileHidden || (t.name === 'health' && gender !== 'female')
        return (
          <Tabs.Screen
            key={t.name}
            name={t.name}
            options={{
              title: t.title,
              tabBarItemStyle: hiddenOnMobile ? { display: 'none' } : undefined,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name={(focused ? t.iconActive : t.icon) as any}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        )
      })}
    </Tabs>
  )
}
