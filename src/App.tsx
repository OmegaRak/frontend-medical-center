import { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

type Sex = 'M' | 'F'

interface Patient {
  id: string
  code: string
  nom: string
  prenom: string
  sexe: Sex
  adresse: string
}

interface Medecin {
  id: string
  code: string
  nom: string
  prenom: string
  grade: string
}

interface Visite {
  id: string
  patientId: string
  medecinId: string
  date: string
}

type Screen = 'dashboard' | 'patients' | 'medecins' | 'nouvelle-visite' | 'historique'
type Modal = null | 'add-patient' | 'edit-patient' | 'add-medecin' | 'edit-medecin' | 'confirm-delete'

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_PATIENTS: Patient[] = [
  { id: 'p1', code: 'PAT-001', nom: 'Benali', prenom: 'Fatima', sexe: 'F', adresse: '12 rue des Oliviers, Alger' },
  { id: 'p2', code: 'PAT-002', nom: 'Hadj', prenom: 'Mohamed', sexe: 'M', adresse: '7 avenue Pasteur, Oran' },
  { id: 'p3', code: 'PAT-003', nom: 'Meziane', prenom: 'Amina', sexe: 'F', adresse: '34 bd Zighoud Youcef, Constantine' },
  { id: 'p4', code: 'PAT-004', nom: 'Cherif', prenom: 'Youcef', sexe: 'M', adresse: '5 impasse des Mimosas, Annaba' },
  { id: 'p5', code: 'PAT-005', nom: 'Bouzid', prenom: 'Soraya', sexe: 'F', adresse: '22 rue Didouche Mourad, Blida' },
  { id: 'p6', code: 'PAT-006', nom: 'Laouedj', prenom: 'Karim', sexe: 'M', adresse: '18 cité SONATRACH, Hassi Messaoud' },
  { id: 'p7', code: 'PAT-007', nom: 'Ouali', prenom: 'Nadia', sexe: 'F', adresse: '9 rue Ben Badis, Sétif' },
]

const SEED_MEDECINS: Medecin[] = [
  { id: 'm1', code: 'MED-001', nom: 'Bensalem', prenom: 'Rachid', grade: 'Professeur' },
  { id: 'm2', code: 'MED-002', nom: 'Kaci', prenom: 'Leïla', grade: 'Maître de conférences' },
  { id: 'm3', code: 'MED-003', nom: 'Ould Hamou', prenom: 'Tarek', grade: 'Spécialiste' },
  { id: 'm4', code: 'MED-004', nom: 'Ferhat', prenom: 'Yasmina', grade: 'Généraliste' },
  { id: 'm5', code: 'MED-005', nom: 'Ziani', prenom: 'Omar', grade: 'Interne' },
]

const today = new Date().toISOString().split('T')[0]

const SEED_VISITES: Visite[] = [
  { id: 'v1', patientId: 'p1', medecinId: 'm1', date: today },
  { id: 'v2', patientId: 'p2', medecinId: 'm3', date: today },
  { id: 'v3', patientId: 'p3', medecinId: 'm2', date: today },
  { id: 'v4', patientId: 'p1', medecinId: 'm2', date: '2026-07-18' },
  { id: 'v5', patientId: 'p4', medecinId: 'm1', date: '2026-07-22' },
  { id: 'v6', patientId: 'p2', medecinId: 'm4', date: '2026-06-10' },
  { id: 'v7', patientId: 'p5', medecinId: 'm3', date: today },
]

function newId() {
  return Math.random().toString(36).slice(2, 9)
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconEdit({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.833 13.833 1 15l1.167-3.833Z" />
    </svg>
  )
}

function IconTrash({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,4 14,4" />
      <path d="M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4" />
      <path d="M3 4l.9 9a1 1 0 0 0 1 .917h6.2a1 1 0 0 0 1-.917L13 4" />
      <line x1="8" y1="7" x2="8" y2="11" />
      <line x1="5.9" y1="7" x2="6.1" y2="11" />
      <line x1="10.1" y1="7" x2="9.9" y2="11" />
    </svg>
  )
}

function IconHistory({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 8a6.5 6.5 0 1 1 1.9 4.6" />
      <polyline points="1.5,4 1.5,8 5.5,8" />
      <polyline points="8,5 8,8 10,10" />
    </svg>
  )
}

// ── Small UI primitives ──────────────────────────────────────────────────────

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'muted' }) {
  const cls = {
    default: 'bg-[#e8f4f8] text-[#1a5f7a]',
    success: 'bg-[#e8f5f0] text-[#27ae60]',
    muted: 'bg-[#f0f2f5] text-[#6b7a8d]',
  }[variant]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{children}</span>
}

function Btn({
  children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'teal' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-md transition-all cursor-pointer select-none border'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary: 'bg-[#1a5f7a] text-white border-[#1a5f7a] hover:bg-[#134a60] active:scale-95',
    teal: 'bg-[#2a9d8f] text-white border-[#2a9d8f] hover:bg-[#21867a] active:scale-95',
    ghost: 'bg-transparent text-[#1a5f7a] border-transparent hover:bg-[#e8f4f8] active:scale-95',
    danger: 'bg-white text-[#c0392b] border-[#c0392b] hover:bg-[#fdf2f2] active:scale-95',
    outline: 'bg-white text-[#1a5f7a] border-[#dde3ea] hover:border-[#1a5f7a] hover:bg-[#e8f4f8] active:scale-95',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

function Input({
  label, value, onChange, placeholder, type = 'text', autoFocus, required,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoFocus?: boolean
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-[#6b7a8d] uppercase tracking-wide">{label}{required && <span className="text-[#c0392b] ml-0.5">*</span>}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required={required}
        className="w-full px-3 py-2 text-sm bg-white border border-[#dde3ea] rounded-md text-[#1a2332] placeholder-[#b0bcc8] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all"
      />
    </div>
  )
}

function Select({
  label, value, onChange, children, required,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-[#6b7a8d] uppercase tracking-wide">{label}{required && <span className="text-[#c0392b] ml-0.5">*</span>}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm bg-white border border-[#dde3ea] rounded-md text-[#1a2332] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all cursor-pointer"
      >
        {children}
      </select>
    </div>
  )
}

// ── Toast ────────────────────────────────────────────────────────────────────

interface ToastMsg { id: string; text: string; type: 'success' | 'error' | 'info' }

function Toast({ msg, onDone }: { msg: ToastMsg; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  const icon = msg.type === 'success' ? '✓' : msg.type === 'error' ? '✕' : 'ℹ'
  const color = msg.type === 'success' ? 'bg-[#27ae60]' : msg.type === 'error' ? 'bg-[#c0392b]' : 'bg-[#1a5f7a]'

  return (
    <div className={`toast-enter flex items-center gap-3 ${color} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[260px]`}>
      <span className="text-base leading-none">{icon}</span>
      <span>{msg.text}</span>
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, width = 'max-w-md' }: {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: string
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${width} mx-4 overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dde3ea]">
          <h2 className="text-base font-bold text-[#1a2332]">{title}</h2>
          <button onClick={onClose} className="text-[#6b7a8d] hover:text-[#1a2332] text-xl leading-none cursor-pointer transition-colors">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm delete modal ─────────────────────────────────────────────────────

function ConfirmDelete({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title="Confirmer la suppression" onClose={onClose}>
      <p className="text-sm text-[#1a2332] mb-6">
        Supprimer <strong>{label}</strong> ? Cette action est irréversible.
      </p>
      <div className="flex justify-end gap-3">
        <Btn variant="outline" onClick={onClose}>Annuler</Btn>
        <Btn variant="danger" onClick={onConfirm}>Supprimer</Btn>
      </div>
    </Modal>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '⊞' },
  { id: 'nouvelle-visite', label: 'Nouvelle visite', icon: '＋', highlight: true },
  { id: 'patients', label: 'Patients', icon: '👤' },
  { id: 'medecins', label: 'Médecins', icon: '⚕' },
  { id: 'historique', label: 'Historique', icon: '📋' },
] as const

function Sidebar({ screen, onNav }: { screen: Screen; onNav: (s: Screen) => void }) {
  return (
    <aside className="w-52 shrink-0 bg-[#1a2332] flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2a9d8f] flex items-center justify-center text-white font-bold text-sm">MC</div>
          <div>
            <div className="text-white text-sm font-bold leading-tight">Centre Médical</div>
            <div className="text-white/40 text-xs">Accueil</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {NAV.map(item => {
          const active = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id as Screen)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer text-left
                ${item.highlight
                  ? active
                    ? 'bg-[#2a9d8f] text-white'
                    : 'bg-[#2a9d8f]/20 text-[#2a9d8f] hover:bg-[#2a9d8f]/30'
                  : active
                    ? 'bg-[#1a5f7a] text-white'
                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                }`}
            >
              <span className="text-base w-5 text-center leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-white/30">v1.0.0 · {today}</div>
      </div>
    </aside>
  )
}

// ── Page header ──────────────────────────────────────────────────────────────

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-[#1a2332]">{title}</h1>
        {subtitle && <p className="text-sm text-[#6b7a8d] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── SCREEN: Dashboard ────────────────────────────────────────────────────────

function Dashboard({ patients, medecins, visites, onNav }: {
  patients: Patient[]
  medecins: Medecin[]
  visites: Visite[]
  onNav: (s: Screen) => void
}) {
  const visitesToday = visites.filter(v => v.date === today)

  const recentVisites = [...visites]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bienvenue — ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        action={
          <Btn size="lg" variant="teal" onClick={() => onNav('nouvelle-visite')}>
            <span>＋</span> Nouvelle visite
          </Btn>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Visites aujourd'hui", value: visitesToday.length, color: 'text-[#1a5f7a]', bg: 'bg-[#e8f4f8]', icon: '📋' },
          { label: 'Patients enregistrés', value: patients.length, color: 'text-[#2a9d8f]', bg: 'bg-[#e8f5f3]', icon: '👤' },
          { label: 'Médecins actifs', value: medecins.length, color: 'text-[#8e44ad]', bg: 'bg-[#f3e8f8]', icon: '⚕' },
          { label: 'Total visites', value: visites.length, color: 'text-[#e67e22]', bg: 'bg-[#fef3e8]', icon: '📊' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#dde3ea] px-5 py-4">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${stat.bg} text-lg mb-3`}>{stat.icon}</div>
            <div className={`text-3xl font-bold ${stat.color} mb-0.5`}>{stat.value}</div>
            <div className="text-xs text-[#6b7a8d] font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Recent visits */}
        <div className="col-span-3 bg-white rounded-xl border border-[#dde3ea]">
          <div className="px-5 py-3.5 border-b border-[#dde3ea] flex items-center justify-between">
            <span className="text-sm font-bold text-[#1a2332]">Dernières visites</span>
            <Btn size="sm" variant="ghost" onClick={() => onNav('historique')}>Voir tout →</Btn>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-[#6b7a8d] uppercase tracking-wide">
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
                  <tr key={v.id} className="border-t border-[#f0f2f5] hover:bg-[#f9fafb]">
                    <td className="px-5 py-2.5 font-mono text-xs text-[#6b7a8d]">{new Date(v.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-2.5 font-medium">{p ? `${p.prenom} ${p.nom}` : '—'}</td>
                    <td className="px-5 py-2.5 text-[#6b7a8d]">Dr. {m ? `${m.prenom} ${m.nom}` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#dde3ea] p-5">
            <div className="text-xs font-bold text-[#6b7a8d] uppercase tracking-wide mb-3">Accès rapides</div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Nouvelle visite', screen: 'nouvelle-visite' as Screen, icon: '＋', variant: 'teal' as const },
                { label: 'Ajouter un patient', screen: 'patients' as Screen, icon: '👤', variant: 'outline' as const },
                { label: 'Ajouter un médecin', screen: 'medecins' as Screen, icon: '⚕', variant: 'outline' as const },
              ].map(a => (
                <Btn key={a.label} variant={a.variant} size="md" onClick={() => onNav(a.screen)} className="w-full justify-start">
                  <span>{a.icon}</span> {a.label}
                </Btn>
              ))}
            </div>
          </div>
          <div className="bg-[#e8f4f8] rounded-xl border border-[#c5dde8] px-5 py-4">
            <div className="text-xs font-bold text-[#1a5f7a] uppercase tracking-wide mb-1">Aujourd'hui</div>
            <div className="text-3xl font-bold text-[#1a5f7a]">{visitesToday.length}</div>
            <div className="text-sm text-[#1a5f7a]/70 mt-0.5">visite{visitesToday.length > 1 ? 's' : ''} enregistrée{visitesToday.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SCREEN: Patients ─────────────────────────────────────────────────────────

const EMPTY_PATIENT: Omit<Patient, 'id'> = { code: '', nom: '', prenom: '', sexe: 'M', adresse: '' }

function PatientsScreen({ patients, setPatients, onViewHistory, toast }: {
  patients: Patient[]
  setPatients: (p: Patient[]) => void
  onViewHistory: (p: Patient) => void
  toast: (msg: string, type?: ToastMsg['type']) => void
}) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<Modal>(null)
  const [editTarget, setEditTarget] = useState<Patient | null>(null)
  const [form, setForm] = useState<Omit<Patient, 'id'>>(EMPTY_PATIENT)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return !q || p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  })

  function openAdd() {
    setForm({ ...EMPTY_PATIENT, code: `PAT-${String(patients.length + 1).padStart(3, '0')}` })
    setEditTarget(null)
    setModal('add-patient')
  }

  function openEdit(p: Patient) {
    setForm({ code: p.code, nom: p.nom, prenom: p.prenom, sexe: p.sexe, adresse: p.adresse })
    setEditTarget(p)
    setModal('edit-patient')
  }

  function savePatient() {
    if (!form.nom.trim() || !form.prenom.trim()) return
    if (editTarget) {
      setPatients(patients.map(p => p.id === editTarget.id ? { ...editTarget, ...form } : p))
      toast('Patient modifié avec succès', 'success')
    } else {
      setPatients([...patients, { id: newId(), ...form }])
      toast('Patient ajouté avec succès', 'success')
    }
    setModal(null)
  }

  function confirmDelete(p: Patient) {
    setDeleteTarget(p)
    setModal('confirm-delete')
  }

  function doDelete() {
    if (!deleteTarget) return
    setPatients(patients.filter(p => p.id !== deleteTarget.id))
    toast('Patient supprimé', 'info')
    setModal(null)
    setDeleteTarget(null)
  }

  const formModal = modal === 'add-patient' || modal === 'edit-patient'

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${filtered.length} patient${filtered.length > 1 ? 's' : ''} ${search ? 'trouvé' + (filtered.length > 1 ? 's' : '') : 'enregistré' + (filtered.length > 1 ? 's' : '')}`}
        action={<Btn variant="teal" onClick={openAdd}><span>＋</span> Ajouter un patient</Btn>}
      />

      {/* Search bar */}
      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] text-base pointer-events-none">🔍</span>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou code patient…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#dde3ea] rounded-lg text-[#1a2332] placeholder-[#b0bcc8] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] hover:text-[#1a2332] cursor-pointer text-lg leading-none">×</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#dde3ea] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f5f7fa] border-b border-[#dde3ea]">
              {['Code', 'Nom', 'Prénom', 'Sexe', 'Adresse', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#6b7a8d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[#6b7a8d] text-sm">Aucun patient trouvé</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-t border-[#f0f2f5] hover:bg-[#f9fafb] transition-colors">
                <td className="px-4 py-3"><span className="font-mono text-xs bg-[#f0f2f5] text-[#6b7a8d] px-1.5 py-0.5 rounded">{p.code}</span></td>
                <td className="px-4 py-3 font-semibold text-[#1a2332]">{p.nom}</td>
                <td className="px-4 py-3 text-[#1a2332]">{p.prenom}</td>
                <td className="px-4 py-3"><Badge variant={p.sexe === 'F' ? 'success' : 'default'}>{p.sexe === 'F' ? 'Femme' : 'Homme'}</Badge></td>
                <td className="px-4 py-3 text-[#6b7a8d] max-w-[200px] truncate">{p.adresse}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Historique des visites" onClick={() => onViewHistory(p)} className="p-1.5 rounded-md text-[#1a5f7a] hover:bg-[#e8f4f8] transition-colors cursor-pointer"><IconHistory /></button>
                    <button title="Modifier" onClick={() => openEdit(p)} className="p-1.5 rounded-md text-[#6b7a8d] hover:bg-[#f0f2f5] hover:text-[#1a2332] transition-colors cursor-pointer"><IconEdit /></button>
                    <button title="Supprimer" onClick={() => confirmDelete(p)} className="p-1.5 rounded-md text-[#c0392b] hover:bg-[#fdf2f2] transition-colors cursor-pointer"><IconTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient form modal */}
      {formModal && (
        <Modal title={modal === 'add-patient' ? 'Nouveau patient' : 'Modifier le patient'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Code" value={form.code} onChange={v => setForm({ ...form, code: v })} required />
              <Select label="Sexe" value={form.sexe} onChange={v => setForm({ ...form, sexe: v as Sex })} required>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom" value={form.nom} onChange={v => setForm({ ...form, nom: v })} required autoFocus={modal === 'add-patient'} />
              <Input label="Prénom" value={form.prenom} onChange={v => setForm({ ...form, prenom: v })} required />
            </div>
            <Input label="Adresse" value={form.adresse} onChange={v => setForm({ ...form, adresse: v })} placeholder="Rue, ville…" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn variant="teal" onClick={savePatient} disabled={!form.nom.trim() || !form.prenom.trim()}>
              {modal === 'add-patient' ? 'Ajouter le patient' : 'Enregistrer'}
            </Btn>
          </div>
        </Modal>
      )}

      {modal === 'confirm-delete' && deleteTarget && (
        <ConfirmDelete
          label={`${deleteTarget.prenom} ${deleteTarget.nom}`}
          onConfirm={doDelete}
          onClose={() => { setModal(null); setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}

// ── SCREEN: Médecins ─────────────────────────────────────────────────────────

const GRADES = ['Professeur', 'Maître de conférences', 'Spécialiste', 'Généraliste', 'Interne', 'Résident']

function MedecinsScreen({ medecins, setMedecins, toast }: {
  medecins: Medecin[]
  setMedecins: (m: Medecin[]) => void
  toast: (msg: string, type?: ToastMsg['type']) => void
}) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<Modal>(null)
  const [editTarget, setEditTarget] = useState<Medecin | null>(null)
  const EMPTY_MED = { code: '', nom: '', prenom: '', grade: 'Généraliste' }
  const [form, setForm] = useState(EMPTY_MED)
  const [deleteTarget, setDeleteTarget] = useState<Medecin | null>(null)

  const filtered = medecins.filter(m => {
    const q = search.toLowerCase()
    return !q || m.nom.toLowerCase().includes(q) || m.prenom.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
  })

  function openAdd() {
    setForm({ ...EMPTY_MED, code: `MED-${String(medecins.length + 1).padStart(3, '0')}` })
    setEditTarget(null)
    setModal('add-medecin')
  }

  function openEdit(m: Medecin) {
    setForm({ code: m.code, nom: m.nom, prenom: m.prenom, grade: m.grade })
    setEditTarget(m)
    setModal('edit-medecin')
  }

  function saveMedecin() {
    if (!form.nom.trim() || !form.prenom.trim()) return
    if (editTarget) {
      setMedecins(medecins.map(m => m.id === editTarget.id ? { ...editTarget, ...form } : m))
      toast('Médecin modifié avec succès', 'success')
    } else {
      setMedecins([...medecins, { id: newId(), ...form }])
      toast('Médecin ajouté avec succès', 'success')
    }
    setModal(null)
  }

  function doDelete() {
    if (!deleteTarget) return
    setMedecins(medecins.filter(m => m.id !== deleteTarget.id))
    toast('Médecin supprimé', 'info')
    setModal(null)
    setDeleteTarget(null)
  }

  const formModal = modal === 'add-medecin' || modal === 'edit-medecin'

  return (
    <div>
      <PageHeader
        title="Médecins"
        subtitle={`${filtered.length} médecin${filtered.length > 1 ? 's' : ''}`}
        action={<Btn variant="teal" onClick={openAdd}><span>＋</span> Ajouter un médecin</Btn>}
      />

      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] text-base pointer-events-none">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou code médecin…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#dde3ea] rounded-lg text-[#1a2332] placeholder-[#b0bcc8] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] hover:text-[#1a2332] cursor-pointer text-lg leading-none">×</button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#dde3ea] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f5f7fa] border-b border-[#dde3ea]">
              {['Code', 'Nom', 'Prénom', 'Grade', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#6b7a8d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-[#6b7a8d] text-sm">Aucun médecin trouvé</td></tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="border-t border-[#f0f2f5] hover:bg-[#f9fafb] transition-colors">
                <td className="px-4 py-3"><span className="font-mono text-xs bg-[#f0f2f5] text-[#6b7a8d] px-1.5 py-0.5 rounded">{m.code}</span></td>
                <td className="px-4 py-3 font-semibold text-[#1a2332]">{m.nom}</td>
                <td className="px-4 py-3 text-[#1a2332]">{m.prenom}</td>
                <td className="px-4 py-3"><Badge variant="muted">{m.grade}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Modifier" onClick={() => openEdit(m)} className="p-1.5 rounded-md text-[#6b7a8d] hover:bg-[#f0f2f5] hover:text-[#1a2332] transition-colors cursor-pointer"><IconEdit /></button>
                    <button title="Supprimer" onClick={() => { setDeleteTarget(m); setModal('confirm-delete') }} className="p-1.5 rounded-md text-[#c0392b] hover:bg-[#fdf2f2] transition-colors cursor-pointer"><IconTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formModal && (
        <Modal title={modal === 'add-medecin' ? 'Nouveau médecin' : 'Modifier le médecin'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <Input label="Code" value={form.code} onChange={v => setForm({ ...form, code: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom" value={form.nom} onChange={v => setForm({ ...form, nom: v })} required autoFocus />
              <Input label="Prénom" value={form.prenom} onChange={v => setForm({ ...form, prenom: v })} required />
            </div>
            <Select label="Grade" value={form.grade} onChange={v => setForm({ ...form, grade: v })} required>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn variant="teal" onClick={saveMedecin} disabled={!form.nom.trim() || !form.prenom.trim()}>
              {modal === 'add-medecin' ? 'Ajouter le médecin' : 'Enregistrer'}
            </Btn>
          </div>
        </Modal>
      )}

      {modal === 'confirm-delete' && deleteTarget && (
        <ConfirmDelete
          label={`Dr. ${deleteTarget.prenom} ${deleteTarget.nom}`}
          onConfirm={doDelete}
          onClose={() => { setModal(null); setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}

// ── SCREEN: Nouvelle visite ──────────────────────────────────────────────────

function NouvelleVisiteScreen({ patients, medecins, visites, setVisites, toast }: {
  patients: Patient[]
  medecins: Medecin[]
  visites: Visite[]
  setVisites: (v: Visite[]) => void
  toast: (msg: string, type?: ToastMsg['type']) => void
}) {
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedMedecinId, setSelectedMedecinId] = useState('')
  const [date, setDate] = useState(today)
  const [submitted, setSubmitted] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const suggestions = patientSearch.length >= 1
    ? patients.filter(p => {
        const q = patientSearch.toLowerCase()
        return p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      }).slice(0, 8)
    : []

  function selectPatient(p: Patient) {
    setSelectedPatient(p)
    setPatientSearch(`${p.prenom} ${p.nom}`)
    setShowDropdown(false)
  }

  function reset() {
    setSelectedPatient(null)
    setPatientSearch('')
    setSelectedMedecinId('')
    setDate(today)
    setSubmitted(false)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  function submit() {
    if (!selectedPatient || !selectedMedecinId) return
    setVisites([...visites, { id: newId(), patientId: selectedPatient.id, medecinId: selectedMedecinId, date }])
    setSubmitted(true)
    toast('Visite enregistrée avec succès', 'success')
  }

  const medecin = medecins.find(m => m.id === selectedMedecinId)
  const canSubmit = !!selectedPatient && !!selectedMedecinId && !!date

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-[#e8f5f0] flex items-center justify-center text-3xl mb-5">✓</div>
        <h2 className="text-xl font-bold text-[#1a2332] mb-2">Visite enregistrée</h2>
        <p className="text-[#6b7a8d] text-sm mb-1">
          <strong>{selectedPatient?.prenom} {selectedPatient?.nom}</strong> — Dr. <strong>{medecin?.prenom} {medecin?.nom}</strong>
        </p>
        <p className="text-[#6b7a8d] text-sm mb-8">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="flex gap-3">
          <Btn variant="teal" size="lg" onClick={reset}>Enregistrer une autre visite</Btn>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Nouvelle visite" subtitle="Remplissez les trois champs puis enregistrez" />

      <div className="bg-white rounded-xl border border-[#dde3ea] overflow-hidden">

        {/* Step 1 */}
        <div className="px-6 py-5 border-b border-[#f0f2f5]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#1a5f7a] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="text-sm font-bold text-[#1a2332]">Sélectionner le patient</span>
          </div>
          <div ref={dropdownRef} className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] pointer-events-none">🔍</span>
            <input
              ref={searchRef}
              type="text"
              value={patientSearch}
              onChange={e => {
                setPatientSearch(e.target.value)
                setSelectedPatient(null)
                setShowDropdown(true)
              }}
              onFocus={() => { if (patientSearch) setShowDropdown(true) }}
              placeholder="Taper le nom ou code patient…"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#dde3ea] rounded-lg text-[#1a2332] placeholder-[#b0bcc8] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all"
            />
            {selectedPatient && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#27ae60] pointer-events-none text-base">✓</span>
            )}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#dde3ea] rounded-lg shadow-lg z-20 overflow-hidden">
                {suggestions.map(p => (
                  <button
                    key={p.id}
                    onMouseDown={() => selectPatient(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#e8f4f8] text-left transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#6b7a8d] bg-[#f0f2f5] px-1.5 py-0.5 rounded shrink-0">{p.code}</span>
                    <span className="font-medium text-[#1a2332]">{p.prenom} {p.nom}</span>
                    <span className="text-[#6b7a8d] text-xs ml-auto">{p.sexe === 'F' ? 'Femme' : 'Homme'}</span>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && patientSearch.length >= 1 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#dde3ea] rounded-lg shadow-lg z-20 px-4 py-3 text-sm text-[#6b7a8d]">
                Aucun patient trouvé pour « {patientSearch} »
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[#27ae60] font-medium">
              <span>✓</span>
              <span>{selectedPatient.prenom} {selectedPatient.nom} · {selectedPatient.code} · {selectedPatient.adresse}</span>
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div className="px-6 py-5 border-b border-[#f0f2f5]">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${selectedPatient ? 'bg-[#1a5f7a] text-white' : 'bg-[#dde3ea] text-[#6b7a8d]'}`}>2</span>
            <span className="text-sm font-bold text-[#1a2332]">Sélectionner le médecin</span>
          </div>
          <select
            value={selectedMedecinId}
            onChange={e => setSelectedMedecinId(e.target.value)}
            disabled={!selectedPatient}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#dde3ea] rounded-lg text-[#1a2332] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">— Choisir un médecin —</option>
            {medecins.map(m => (
              <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} · {m.grade}</option>
            ))}
          </select>
        </div>

        {/* Step 3 */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${selectedMedecinId ? 'bg-[#1a5f7a] text-white' : 'bg-[#dde3ea] text-[#6b7a8d]'}`}>3</span>
            <span className="text-sm font-bold text-[#1a2332]">Date de la visite</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={!selectedMedecinId}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#dde3ea] rounded-lg text-[#1a2332] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all cursor-pointer disabled:opacity-50"
          />
          <p className="text-xs text-[#6b7a8d] mt-1.5">Date du jour pré-remplie — modifiable si besoin</p>
        </div>

        {/* Submit */}
        <div className="px-6 pb-6">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-xl text-base font-bold transition-all
              ${canSubmit
                ? 'bg-[#2a9d8f] text-white hover:bg-[#21867a] active:scale-[0.99] shadow-md shadow-[#2a9d8f]/30'
                : 'bg-[#dde3ea] text-[#b0bcc8] cursor-not-allowed'
              }`}
          >
            Enregistrer la visite
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SCREEN: Historique ───────────────────────────────────────────────────────

function HistoriqueScreen({ patients, medecins, visites, initialPatient, onNav }: {
  patients: Patient[]
  medecins: Medecin[]
  visites: Visite[]
  initialPatient: Patient | null
  onNav: (s: Screen) => void
}) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient)
  const [search, setSearch] = useState(initialPatient ? `${initialPatient.prenom} ${initialPatient.nom}` : '')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSelectedPatient(initialPatient)
    setSearch(initialPatient ? `${initialPatient.prenom} ${initialPatient.nom}` : '')
  }, [initialPatient])

  useEffect(() => {
    if (!initialPatient) searchRef.current?.focus()
  }, [initialPatient])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const suggestions = search.length >= 1
    ? patients.filter(p => {
        const q = search.toLowerCase()
        return p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      }).slice(0, 8)
    : []

  const patientVisites = selectedPatient
    ? [...visites.filter(v => v.patientId === selectedPatient.id)].sort((a, b) => b.date.localeCompare(a.date))
    : []

  return (
    <div>
      <PageHeader
        title="Historique des visites"
        subtitle="Consultez le parcours complet d'un patient"
      />

      {/* Patient search */}
      <div ref={dropdownRef} className="relative mb-6 max-w-lg">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a8d] pointer-events-none">🔍</span>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedPatient(null); setShowDropdown(true) }}
          onFocus={() => { if (search) setShowDropdown(true) }}
          placeholder="Rechercher un patient par nom ou code…"
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#dde3ea] rounded-lg text-[#1a2332] placeholder-[#b0bcc8] focus:border-[#1a5f7a] focus:ring-2 focus:ring-[#1a5f7a]/15 transition-all shadow-sm"
        />
        {selectedPatient && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#27ae60] pointer-events-none">✓</span>}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#dde3ea] rounded-lg shadow-lg z-20 overflow-hidden">
            {suggestions.map(p => (
              <button
                key={p.id}
                onMouseDown={() => { setSelectedPatient(p); setSearch(`${p.prenom} ${p.nom}`); setShowDropdown(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#e8f4f8] text-left transition-colors cursor-pointer"
              >
                <span className="font-mono text-xs text-[#6b7a8d] bg-[#f0f2f5] px-1.5 py-0.5 rounded">{p.code}</span>
                <span className="font-medium">{p.prenom} {p.nom}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedPatient && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#6b7a8d] text-sm">Recherchez un patient pour afficher son historique de visites</p>
        </div>
      )}

      {selectedPatient && (
        <div>
          {/* Patient card */}
          <div className="bg-[#e8f4f8] border border-[#c5dde8] rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1a5f7a] text-white font-bold text-base flex items-center justify-center">
                {selectedPatient.prenom[0]}{selectedPatient.nom[0]}
              </div>
              <div>
                <div className="font-bold text-[#1a2332]">{selectedPatient.prenom} {selectedPatient.nom}</div>
                <div className="text-xs text-[#6b7a8d] mt-0.5 flex items-center gap-2">
                  <span className="font-mono">{selectedPatient.code}</span>
                  <span>·</span>
                  <span>{selectedPatient.sexe === 'F' ? 'Femme' : 'Homme'}</span>
                  <span>·</span>
                  <span>{selectedPatient.adresse}</span>
                </div>
              </div>
            </div>
            <Badge>{patientVisites.length} visite{patientVisites.length > 1 ? 's' : ''}</Badge>
          </div>

          {patientVisites.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#dde3ea] px-6 py-12 text-center">
              <p className="text-[#6b7a8d] text-sm">Aucune visite enregistrée pour ce patient.</p>
              <Btn variant="teal" size="md" className="mt-4" onClick={() => onNav('nouvelle-visite')}>Enregistrer une visite</Btn>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#dde3ea] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f7fa] border-b border-[#dde3ea]">
                    <th className="px-5 py-3 text-left text-xs font-bold text-[#6b7a8d] uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-[#6b7a8d] uppercase tracking-wide">Médecin</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-[#6b7a8d] uppercase tracking-wide">Grade</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-[#6b7a8d] uppercase tracking-wide">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {patientVisites.map((v, i) => {
                    const m = medecins.find(x => x.id === v.medecinId)
                    const isToday = v.date === today
                    return (
                      <tr key={v.id} className={`border-t border-[#f0f2f5] ${isToday ? 'bg-[#f0faf8]' : 'hover:bg-[#f9fafb]'} transition-colors`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#6b7a8d]">{new Date(v.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            {isToday && <Badge variant="success">Aujourd'hui</Badge>}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold">Dr. {m ? `${m.prenom} ${m.nom}` : '—'}</td>
                        <td className="px-5 py-3 text-[#6b7a8d]">{m?.grade ?? '—'}</td>
                        <td className="px-5 py-3"><span className="font-mono text-xs bg-[#f0f2f5] text-[#6b7a8d] px-1.5 py-0.5 rounded">{m?.code ?? '—'}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [patients, setPatients] = useState<Patient[]>(SEED_PATIENTS)
  const [medecins, setMedecins] = useState<Medecin[]>(SEED_MEDECINS)
  const [visites, setVisites] = useState<Visite[]>(SEED_VISITES)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [histoPatient, setHistoPatient] = useState<Patient | null>(null)

  const pushToast = useCallback((text: string, type: ToastMsg['type'] = 'success') => {
    const id = newId()
    setToasts(t => [...t, { id, text, type }])
  }, [])

  function removeToast(id: string) {
    setToasts(t => t.filter(x => x.id !== id))
  }

  function navToHistory(p: Patient) {
    setHistoPatient(p)
    setScreen('historique')
  }

  function navTo(s: Screen) {
    if (s !== 'historique') setHistoPatient(null)
    setScreen(s)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fa]">
      <Sidebar screen={screen} onNav={navTo} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-7">
          {screen === 'dashboard' && (
            <Dashboard patients={patients} medecins={medecins} visites={visites} onNav={navTo} />
          )}
          {screen === 'patients' && (
            <PatientsScreen patients={patients} setPatients={setPatients} onViewHistory={navToHistory} toast={pushToast} />
          )}
          {screen === 'medecins' && (
            <MedecinsScreen medecins={medecins} setMedecins={setMedecins} toast={pushToast} />
          )}
          {screen === 'nouvelle-visite' && (
            <NouvelleVisiteScreen patients={patients} medecins={medecins} visites={visites} setVisites={setVisites} toast={pushToast} />
          )}
          {screen === 'historique' && (
            <HistoriqueScreen patients={patients} medecins={medecins} visites={visites} initialPatient={histoPatient} onNav={navTo} />
          )}
        </div>
      </main>

      {/* Toast stack */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <Toast key={t.id} msg={t} onDone={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  )
}
