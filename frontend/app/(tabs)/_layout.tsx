import { Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/src/lib/theme'
import WebLayout from '@/components/WebLayout'

const tabs = [
  { name: 'index',       title: 'Дашборд',       icon: 'grid-outline',      iconActive: 'grid' },
  { name: 'records',     title: 'Медкарта',       icon: 'folder-outline',    iconActive: 'folder' },
  { name: 'upload',      title: 'Загрузка',       icon: 'cloud-upload-outline', iconActive: 'cloud-upload' },
  { name: 'ai',          title: 'ИИ',             icon: 'chatbubble-outline', iconActive: 'chatbubble' },
  { name: 'access',      title: 'QR',             icon: 'qr-code-outline',   iconActive: 'qr-code' },
  { name: 'marketplace', title: 'Маркетплейс',    icon: 'storefront-outline', iconActive: 'storefront' },
]

// Web uses a sidebar layout; native uses a bottom tab bar
export default function TabsLayout() {
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
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={(focused ? t.iconActive : t.icon) as any}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
