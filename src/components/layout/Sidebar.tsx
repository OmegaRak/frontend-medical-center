import { NavLink, useNavigate } from 'react-router-dom'
import { LuLayoutDashboard, LuPlus, LuUser, LuStethoscope, LuClipboardList, LuLogOut } from 'react-icons/lu'
import { today } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: LuLayoutDashboard, end: true },
  { to: '/nouvelle-visite', label: 'Nouvelle visite', icon: LuPlus, highlight: true },
  { to: '/patients', label: 'Patients', icon: LuUser },
  { to: '/medecins', label: 'Médecins', icon: LuStethoscope },
  { to: '/historique', label: 'Historique', icon: LuClipboardList },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-52 shrink-0 bg-dark flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white font-bold text-sm">MC</div>
          <div>
            <div className="text-white text-sm font-bold leading-tight">Centre Médical</div>
            <div className="text-white/40 text-xs">Accueil</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer text-left
              ${item.highlight
                ? isActive
                  ? 'bg-teal text-white'
                  : 'bg-teal/20 text-teal hover:bg-teal/30'
                : isActive
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white/90 transition-all cursor-pointer text-left"
        >
          <LuLogOut className="w-4 h-4 shrink-0" />
          <span className="truncate">{user?.email ?? 'Déconnexion'}</span>
        </button>
      </div>
      <div className="px-4 py-3 border-t border-white/10">
        <div className="text-xs text-white/30">v1.0.0 · {today}</div>
      </div>
    </aside>
  )
}
