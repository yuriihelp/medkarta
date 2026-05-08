import { useState } from 'react'
import { FlaskConical, FileText, Syringe, Scan, Pill, FileQuestion, Search, Filter, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RecordType } from '../types'

const typeConfig: Record<RecordType | 'all', { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'Все', icon: FileText, color: 'text-slate-600' },
  analysis: { label: 'Анализы', icon: FlaskConical, color: 'text-teal-600' },
  prescription: { label: 'Рецепты', icon: Pill, color: 'text-amber-600' },
  discharge: { label: 'Выписки', icon: FileText, color: 'text-blue-600' },
  vaccination: { label: 'Прививки', icon: Syringe, color: 'text-green-600' },
  imaging: { label: 'Снимки', icon: Scan, color: 'text-purple-600' },
  other: { label: 'Прочее', icon: FileQuestion, color: 'text-slate-500' },
}

type FilterType = RecordType | 'all'

export default function Records() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Медкарта</h1>
          <p className="text-sm text-slate-500 mt-1">Вся история вашего здоровья в одном месте</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 text-sm">
          + Добавить
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по документам..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm">
          <Filter size={14} /> Фильтры
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(Object.keys(typeConfig) as FilterType[]).map((type) => {
          const { label, icon: Icon } = typeConfig[type]
          const active = filter === type
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen size={40} className="text-slate-200 mb-4" />
        <p className="text-slate-500 font-medium">Документов пока нет</p>
        <p className="text-sm text-slate-400 mt-1 mb-5">
          Загрузите анализы, выписки или рецепты — ИИ всё структурирует
        </p>
        <Link to="/upload" className="btn-primary text-sm">
          Загрузить первый документ
        </Link>
      </div>
    </div>
  )
}
