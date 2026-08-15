import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useAppData } from '../context/AppDataContext'
import { today, formatDateFR } from '../lib/utils'

export function DashboardPage() {
  const { patients, medecins, visites } = useAppData()
  const navigate = useNavigate()

  const visitesToday = visites.filter(v => v.date === today)
  const recentVisites = [...visites].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const stats = [
    { label: "Visites aujourd'hui", value: visitesToday.length, color: 'text-primary', bg: 'bg-primary-light', icon: '📋' },
    { label: 'Patients enregistrés', value: patients.length, color: 'text-teal', bg: 'bg-teal-light', icon: '👤' },
    { label: 'Médecins actifs', value: medecins.length, color: 'text-purple', bg: 'bg-purple-light', icon: '⚕' },
    { label: 'Total visites', value: visites.length, color: 'text-warning', bg: 'bg-warning-light', icon: '📊' },
  ]

  const quickActions = [
    { label: 'Nouvelle visite', to: '/nouvelle-visite', icon: '＋', variant: 'teal' as const },
    { label: 'Ajouter un patient', to: '/patients', icon: '👤', variant: 'outline' as const },
    { label: 'Ajouter un médecin', to: '/medecins', icon: '⚕', variant: 'outline' as const },
  ]

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bienvenue — ${formatDateFR(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        action={
          <Button size="lg" variant="teal" onClick={() => navigate('/nouvelle-visite')}>
            <span>＋</span> Nouvelle visite
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-line px-5 py-4">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${stat.bg} text-lg mb-3`}>{stat.icon}</div>
            <div className={`text-3xl font-bold ${stat.color} mb-0.5`}>{stat.value}</div>
            <div className="text-xs text-muted font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white rounded-xl border border-line">
          <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
            <span className="text-sm font-bold text-dark">Dernières visites</span>
            <Button size="sm" variant="ghost" onClick={() => navigate('/historique')}>Voir tout →</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-muted uppercase tracking-wide">
                <th className="px-5 py-2.5 text-left">Date</th>
                <th className="px-5 py-2.5 text-left">Patient</th>
                <th className="px-5 py-2.5 text-left">Médecin</th>
              </tr>
            </thead>
            <tbody>
              {recentVisites.map(v => {
                const p = patients.find(x => x.id === v.patientId)
                const m = medecins.find(x => x.id === v.medecinId)
                return (
                  <tr key={v.id} className="border-t border-muted-light hover:bg-surface-hover">
                    <td className="px-5 py-2.5 font-mono text-xs text-muted">{formatDateFR(v.date)}</td>
                    <td className="px-5 py-2.5 font-medium">{p ? `${p.prenom} ${p.nom}` : '—'}</td>
                    <td className="px-5 py-2.5 text-muted">Dr. {m ? `${m.prenom} ${m.nom}` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-line p-5">
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-3">Accès rapides</div>
            <div className="flex flex-col gap-2">
              {quickActions.map(a => (
                <Button key={a.label} variant={a.variant} size="md" onClick={() => navigate(a.to)} className="w-full justify-start">
                  <span>{a.icon}</span> {a.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="bg-primary-light rounded-xl border border-primary-border px-5 py-4">
            <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Aujourd'hui</div>
            <div className="text-3xl font-bold text-primary">{visitesToday.length}</div>
            <div className="text-sm text-primary/70 mt-0.5">
              visite{visitesToday.length > 1 ? 's' : ''} enregistrée{visitesToday.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
