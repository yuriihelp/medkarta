import { useState } from 'react'
import { Pill, FlaskConical, Stethoscope, MapPin, Star, Search } from 'lucide-react'

type Tab = 'pharmacies' | 'labs' | 'doctors'

const tabConfig: Record<Tab, { label: string; icon: React.ElementType }> = {
  pharmacies: { label: 'Аптеки', icon: Pill },
  labs: { label: 'Лаборатории', icon: FlaskConical },
  doctors: { label: 'Врачи', icon: Stethoscope },
}

const mockPharmacies = [
  { id: 1, name: 'Аптека №1', address: 'ул. Ленина, 12', distance: 0.3, price: 245, rating: 4.8 },
  { id: 2, name: 'Планета Здоровья', address: 'пр. Мира, 45', distance: 0.7, price: 289, rating: 4.5 },
  { id: 3, name: 'Горздрав', address: 'ул. Садовая, 8', distance: 1.2, price: 210, rating: 4.3 },
]

const mockLabs = [
  { id: 1, name: 'Helix', address: 'ул. Арбат, 5', distance: 0.5, price: 1800, rating: 4.9 },
  { id: 2, name: 'Инвитро', address: 'пр. Победы, 22', distance: 0.9, price: 2100, rating: 4.7 },
  { id: 3, name: 'CMD', address: 'ул. Кирова, 15', distance: 1.5, price: 1650, rating: 4.6 },
]

const mockDoctors = [
  { id: 1, name: 'Иванова А.В.', specialty: 'Терапевт', address: 'Клиника Медси', distance: 0.4, price: 2500, rating: 4.9 },
  { id: 2, name: 'Петров С.Н.', specialty: 'Кардиолог', address: 'Клиника К+31', distance: 1.1, price: 3500, rating: 4.8 },
]

export default function Marketplace() {
  const [tab, setTab] = useState<Tab>('pharmacies')
  const [query, setQuery] = useState('')

  const items =
    tab === 'pharmacies' ? mockPharmacies
    : tab === 'labs' ? mockLabs
    : mockDoctors

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Маркетплейс</h1>
        <p className="text-sm text-slate-500 mt-1">Лучшие цены на лекарства, анализы и врачей рядом с вами</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(Object.keys(tabConfig) as Tab[]).map((t) => {
          const { label, icon: Icon } = tabConfig[t]
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            tab === 'pharmacies' ? 'Название препарата...'
            : tab === 'labs' ? 'Тип анализа...'
            : 'Специальность или имя...'
          }
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        />
      </div>

      {/* Geo banner */}
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 rounded-lg px-4 py-2.5">
        <MapPin size={14} className="text-teal-600" />
        <span>Результаты отсортированы по расстоянию от вас · Данные демонстрационные</span>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card flex items-center gap-4 hover:border-teal-200 transition-colors">
            <div className="bg-teal-50 rounded-xl p-3 flex-shrink-0">
              {tab === 'pharmacies' && <Pill size={20} className="text-teal-600" />}
              {tab === 'labs' && <FlaskConical size={20} className="text-teal-600" />}
              {tab === 'doctors' && <Stethoscope size={20} className="text-teal-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
              {'specialty' in item && (
                <div className="text-xs text-teal-600 font-medium">{item.specialty}</div>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {item.address}
                </span>
                <span>{item.distance} км</span>
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" /> {item.rating}
                </span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="font-bold text-slate-800">
                {item.price ? `₽${item.price.toLocaleString()}` : '—'}
              </div>
              <button className="mt-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                {tab === 'doctors' ? 'Записаться' : 'Заказать'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
