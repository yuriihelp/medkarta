import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { storage } from '@/src/lib/storage'
import { colors } from '@/src/lib/theme'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    storage.getItem('access_token').then((token) => {
      setAuthed(!!token)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    const inAuthGroup = segments[0] === 'login'
    if (!authed && !inAuthGroup) {
      router.replace('/login')
    } else if (authed && inAuthGroup) {
      router.replace('/(tabs)/')
    }
  }, [authed, ready, segments])

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
