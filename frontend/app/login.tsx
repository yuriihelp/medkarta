import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { authApi } from '@/src/api/client'
import { storage } from '@/src/lib/storage'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'

type Mode = 'login' | 'register'

export default function LoginScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!phone || !password) return
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login(phone, password)
        : await authApi.register(phone, password, fullName, gender ?? undefined)
      await storage.setItem('access_token', res.data.access_token)
      if (mode === 'register' && gender) {
        await storage.setItem('user_gender', gender)
      }
      if (mode === 'login') {
        try {
          const me = await authApi.me()
          if (me.data.gender) await storage.setItem('user_gender', me.data.gender)
          if (me.data.birth_date) await storage.setItem('user_birth_date', me.data.birth_date)
        } catch { /* ignore */ }
      }
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

        {/* Card */}
        <View style={styles.card}>

          {/* Mode toggle — регистрация временно отключена */}
          <View style={styles.toggle}>
            {(['login'] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                style={[styles.toggleBtn, mode === m && styles.toggleActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                  {m === 'login' ? 'Войти' : 'Регистрация'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fields */}
          {mode === 'register' && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Имя</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Иван Иванов"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Пол</Text>
                <View style={styles.genderRow}>
                  {([['male', 'Мужской'], ['female', 'Женский']] as const).map(([val, label]) => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.genderBtn, gender === val && styles.genderBtnActive]}
                      onPress={() => setGender(val)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.genderText, gender === val && styles.genderTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

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

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </Text>
          </TouchableOpacity>

          {/* Gosuslugi */}
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
  },
  logoBlock: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
  },
  logoSub: {
    fontSize: fontSize.sm,
    color: colors.teal,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  toggleTextActive: { color: colors.text },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
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
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  genderBtnActive: { borderColor: colors.teal, backgroundColor: colors.teal + '15' },
  genderText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  genderTextActive: { color: colors.teal },
})
