import { Activity, FlaskConical, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'Записей в архиве', value: '0', icon: FlaskConical, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Последний анализ', value: '—', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Активных назначений', value: '0', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Показателей отслеж.', value: '0', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const quickActions = [
  { to: '/upload', label: 'Загрузить анализы', desc: 'PDF или фото бланка', color: 'bg-teal-600 hover:bg-teal-700' },
  { to: '/ai', label: 'Спросить ИИ', desc: 'Объяснение показателей', color: 'bg-blue-600 hover:bg-blue-700' },
  { to: '/access', label: 'Показать QR врачу', desc: 'Быстрый доступ к карте', color: 'bg-slate-700 hover:bg-slate-800' },
  { to: '/marketplace', label: 'Найти аптеку', desc: 'Лучшие цены рядом', color: 'bg-amber-600 hover:bg-amber-700' },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Добро пожаловать</h1>
        <p className="text-sm text-slate-500 mt-1">Ваша медицинская книжка всегда под рукой</p>
      </div>

      {/* Onboarding banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-lg p-2 mt-0.5">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1">
            <div className="font-semibold mb-1">Начните заполнять медкарту</div>
            <p className="text-sm text-teal-100">
              Загрузите первый документ — ИИ автоматически разберёт показатели и занесёт их в архив.
            </p>
            <Link
              to="/upload"
              className="inline-block mt-3 bg-white text-teal-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
            >
              Загрузить документ
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ to, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className={`${color} text-white rounded-xl p-4 transition-colors`}
            >
              <div className="font-semibold text-sm mb-1">{label}</div>
              <div className="text-xs text-white/70">{desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Последние события
        </h2>
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle size={32} className="text-slate-300 mb-3" />
          <p className="text-sm text-slate-400">Пока нет событий</p>
          <p className="text-xs text-slate-400 mt-1">Загрузите первый документ, чтобы начать</p>
        </div>
      </div>
    </div>
  )
}
