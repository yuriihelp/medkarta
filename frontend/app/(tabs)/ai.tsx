import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/src/lib/theme'
import { aiApi } from '@/src/api/client'

interface Message { role: 'user' | 'ai'; text: string }

const suggestions = [
  'Что значит пониженный гемоглобин при беременности?',
  'Расшифруй общий анализ крови',
  'Норма триглицеридов для мужчины 35 лет?',
  'Когда нужно обратиться к кардиологу?',
  'Что такое ферритин и зачем его проверять?',
  'Как повысить гемоглобин без таблеток?',
]

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  async function send(text: string) {
    const t = text.trim()
    if (!t || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: t }])
    setLoading(true)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
    try {
      const res = await aiApi.chat(t)
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Произошла ошибка. Попробуйте позже.' }])
    } finally {
      setLoading(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.root}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>ИИ-ассистент</Text>
            <Text style={styles.headerSub}>Объясняет анализы · Не заменяет врача</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>Задайте вопрос о здоровье</Text>
              <Text style={styles.emptySub}>Помогу расшифровать анализы и показатели</Text>

              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.suggestionChip}
                    onPress={() => send(s)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((m, i) => (
              <View
                key={i}
                style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}
              >
                <Text style={[styles.bubbleText, m.role === 'user' && styles.bubbleTextUser]}>
                  {m.text}
                </Text>
              </View>
            ))
          )}

          {loading && (
            <View style={[styles.bubble, styles.bubbleAI]}>
              <Text style={styles.bubbleText}>•••</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Введите вопрос..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Справочная информация. Для диагностики обратитесь к врачу.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted },

  messageList: { flex: 1 },
  messageContent: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.xxl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textSecondary },
  emptySub: { fontSize: fontSize.sm, color: colors.textMuted },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.md },
  suggestionChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  suggestionText: { fontSize: fontSize.sm, color: colors.textSecondary },

  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.teal,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  bubbleTextUser: { color: colors.white },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
})
