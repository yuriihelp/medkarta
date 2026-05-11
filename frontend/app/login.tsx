import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { authApi } from '@/src/api/client'
import { storage } from '@/src/lib/storage'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'

const DEMO_ACCOUNTS = [
  {
    label: 'Демо: Мужской кабинет',
    icon: '👨',
    gender: 'male',
    name: 'Иван Петров',
    birth_date: '1990-05-15',
    token: 'demo_male_token',
  },
  {
    label: 'Демо: Женский кабинет',
    icon: '👩',
    gender: 'female',
    name: 'Мария Иванова',
    birth_date: '1995-08-22',
    token: 'demo_female_token',
  },
]

type Mode = 'login' | 'register'

export default function LoginScreen() {
  const router = useRouter()
  const [mode] = useState<Mode>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function loginDemo(account: typeof DEMO_ACCOUNTS[number]) {
    await storage.setItem('access_token', account.token)
    await storage.setItem('user_gender', account.gender)
    await storage.setItem('user_birth_date', account.birth_date)
    await storage.setItem('user_name', account.name)
    router.replace('/(tabs)/')
  }

  async function submit() {
    if (!phone || !password) return
    setLoading(true)
    try {
      const res = await authApi.login(phone, password)
      await storage.setItem('access_token', res.data.access_token)
      try {
        const me = await authApi.me()
        if (me.data.gender) await storage.setItem('user_gender', me.data.gender)
        if (me.data.birth_date) await storage.setItem('user_birth_date', me.data.birth_date)
        if (me.data.full_name) await storage.setItem('user_name', me.data.full_name)
      } catch { /* ignore */ }
      router.replace('/(tabs)/')
    } catch {
      Alert.alert('Ошибка', 'Неверный телефон или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoBlock}>
          <Text style={styles.logo}>ПУЛЬС</Text>
          <Text style={styles.logoSub}>Единая медицинская книжка</Text>
        </View>

        {/* Demo accounts */}
        <View style={styles.demoBlock}>
          <Text style={styles.demoTitle}>Быстрый вход для тестирования</Text>
          <View style={styles.demoRow}>
            {DEMO_ACCOUNTS.map(acc => (
              <TouchableOpacity
                key={acc.gender}
                style={[
                  styles.demoBtn,
                  acc.gender === 'female' && styles.demoBtnFemale,
                ]}
                onPress={() => loginDemo(acc)}
                activeOpacity={0.85}
              >
                <Text style={styles.demoIcon}>{acc.icon}</Text>
                <Text style={styles.demoBtnText}>{acc.name}</Text>
                <Text style={styles.demoBtnSub}>
                  {acc.gender === 'male' ? 'Мужской' : 'Женский'} кабинет
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Войти по номеру</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+7 999 000 00 00"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {loading ? 'Загрузка...' : 'Войти'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.altBtn} activeOpacity={0.7}>
            <Text style={styles.altText}>Войти через Госуслуги</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: 16,
  },
  logoBlock: { alignItems: 'center', marginBottom: 4 },
  logo: { fontSize: 40, fontWeight: '800', color: colors.white, letterSpacing: -1 },
  logoSub: { fontSize: fontSize.sm, color: colors.teal, marginTop: 4 },

  demoBlock: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  demoTitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoRow: { flexDirection: 'row', gap: 10 },
  demoBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  demoBtnFemale: { backgroundColor: 'rgba(236,72,153,0.2)' },
  demoIcon: { fontSize: 28, marginBottom: 2 },
  demoBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
  demoBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  submit: {
    height: 52,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },
  altBtn: { marginTop: spacing.md, alignItems: 'center' },
  altText: { fontSize: fontSize.sm, color: colors.teal, fontWeight: '600' },
})
