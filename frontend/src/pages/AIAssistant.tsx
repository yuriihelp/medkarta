import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react'
import { aiApi } from '../api/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: Date
}

const suggestions = [
  'Что означает повышенный гемоглобин?',
  'Объясни результаты общего анализа крови',
  'Норма холестерина для взрослого человека?',
  'Когда стоит обратиться к эндокринологу?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text, ts: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await aiApi.chat(text)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply, ts: new Date() },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Произошла ошибка. Попробуйте позже.',
          ts: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 rounded-xl p-2">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">ИИ-ассистент</h1>
            <p className="text-xs text-slate-500">Объясняет анализы простым языком · Не заменяет врача</p>
          </div>
          <div className="ml-auto badge badge-teal flex items-center gap-1">
            <Sparkles size={11} /> GigaChat RAG
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="bg-teal-50 rounded-2xl p-6">
              <Bot size={40} className="text-teal-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">Задайте вопрос о здоровье</p>
              <p className="text-sm text-slate-400 mt-1">
                Я помогу расшифровать анализы и объяснить показатели
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all text-slate-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="bg-teal-600 rounded-xl p-2 h-fit flex-shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="bg-slate-200 rounded-xl p-2 h-fit flex-shrink-0">
                  <User size={15} className="text-slate-600" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="bg-teal-600 rounded-xl p-2 h-fit">
              <Bot size={15} className="text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={16} className="text-teal-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-3 border-t border-slate-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Введите вопрос... (Enter — отправить)"
            rows={2}
            className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          ИИ-ассистент предоставляет справочную информацию. Для диагностики обратитесь к врачу.
        </p>
      </div>
    </div>
  )
}
