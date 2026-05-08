import { useState } from 'react'
import { QrCode, Plus, Trash2, Clock, Infinity, Shield, Eye } from 'lucide-react'

type Mode = 'single' | 'permanent' | 'partial'

const modeConfig: Record<Mode, { label: string; desc: string; icon: React.ElementType; color: string }> = {
  single: {
    label: 'Один визит',
    desc: 'QR действует 24 часа для одного врача',
    icon: Clock,
    color: 'text-amber-600',
  },
  permanent: {
    label: 'Постоянный',
    desc: 'Лечащий врач видит карту всегда',
    icon: Infinity,
    color: 'text-teal-600',
  },
  partial: {
    label: 'Выборочный',
    desc: 'Только определённые данные',
    icon: Eye,
    color: 'text-blue-600',
  },
}

export default function QRAccess() {
  const [creating, setCreating] = useState(false)
  const [selectedMode, setSelectedMode] = useState<Mode>('single')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR-доступ</h1>
          <p className="text-sm text-slate-500 mt-1">Управляйте тем, кто видит вашу медкарту</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> Создать QR
        </button>
      </div>

      {/* How it works */}
      <div className="card bg-teal-50 border-teal-200">
        <div className="flex items-start gap-3">
          <QrCode size={20} className="text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-teal-800">
            <p className="font-semibold mb-1">Как это работает</p>
            <p>
              Покажите QR-код врачу на приёме. Он откроет вашу карту в браузере без установки
              приложения. Вы контролируете срок действия и объём данных.
            </p>
          </div>
        </div>
      </div>

      {/* Create modal */}
      {creating && (
        <div className="card border-2 border-teal-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Новый QR-код</h2>
            <button
              onClick={() => setCreating(false)}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Отмена
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(modeConfig) as Mode[]).map((mode) => {
              const { label, desc, icon: Icon, color } = modeConfig[mode]
              const active = selectedMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    active ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon size={18} className={`${color} mb-2`} />
                  <div className="font-semibold text-sm text-slate-800">{label}</div>
                  <div className="text-xs text-slate-500 mt-1">{desc}</div>
                </button>
              )
            })}
          </div>

          <button className="btn-primary w-full">
            Сгенерировать QR-код
          </button>
        </div>
      )}

      {/* Active tokens */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Активные доступы
        </h2>
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Shield size={32} className="text-slate-200 mb-3" />
          <p className="text-sm text-slate-400">Нет активных доступов</p>
          <p className="text-xs text-slate-400 mt-1">Создайте QR-код для врача</p>
        </div>
      </div>
    </div>
  )
}
