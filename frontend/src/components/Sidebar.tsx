import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderHeart,
  Upload,
  Bot,
  QrCode,
  ShoppingBag,
  LogOut,
  User,
} from 'lucide-react'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд', end: true },
  { to: '/records', icon: FolderHeart, label: 'Медкарта' },
  { to: '/upload', icon: Upload, label: 'Загрузка' },
  { to: '/ai', icon: Bot, label: 'ИИ-ассистент' },
  { to: '/access', icon: QrCode, label: 'QR-доступ' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Маркетплейс' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  return (
    <aside className="w-56 bg-navy-900 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-2xl font-extrabold text-white tracking-tight">ПУЛЬС</div>
        <div className="text-xs text-teal-400 mt-0.5">Медицинская книжка</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-1">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2">
            Меню
          </span>
        </div>
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all">
          <User size={16} />
          Профиль
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </aside>
  )
}
