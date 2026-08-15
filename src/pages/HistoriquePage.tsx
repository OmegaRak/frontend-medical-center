import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAppData } from '../context/AppDataContext'
import { today, formatDateFR } from '../lib/utils'
import type { Patient } from '../types'

export function HistoriquePage() {
  const { patients, medecins, visites } = useAppData()
  const location = useLocation()
  const navigate = useNavigate()

  const initialPatientId = (location.state as { patientId?: string } | null)?.patientId
  const initialPatient = patients.find(p => p.id === initialPatientId) ?? null

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient)
  const [search, setSearch] = useState(initialPatient ? `${initialPatient.prenom} ${initialPatient.nom}` : '')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Re-sync when arriving from another page with a different patient in state
  useEffect(() => {
    setSelectedPatient(initialPatient)
    setSearch(initialPatient ? `${initialPatient.prenom} ${initialPatient.nom}` : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatientId])

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
      <PageHeader title="Historique des visites" subtitle="Consultez le parcours complet d'un patient" />

      <div ref={dropdownRef} className="relative mb-6 max-w-lg">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">🔍</span>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedPatient(null); setShowDropdown(true) }}
          onFocus={() => { if (search) setShowDropdown(true) }}
          placeholder="Rechercher un patient par nom ou code…"
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-line rounded-lg text-dark placeholder-faint focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all shadow-sm"
        />
        {selectedPatient && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success pointer-events-none">✓</span>}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-lg shadow-lg z-20 overflow-hidden">
            {suggestions.map(p => (
              <button
                key={p.id}
                onMouseDown={() => { setSelectedPatient(p); setSearch(`${p.prenom} ${p.nom}`); setShowDropdown(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-light text-left transition-colors cursor-pointer"
              >
                <span className="font-mono text-xs text-muted bg-muted-light px-1.5 py-0.5 rounded">{p.code}</span>
                <span className="font-medium">{p.prenom} {p.nom}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedPatient && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-muted text-sm">Recherchez un patient pour afficher son historique de visites</p>
        </div>
      )}

      {selectedPatient && (
        <div>
          <div className="bg-primary-light border border-primary-border rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-base flex items-center justify-center">
                {selectedPatient.prenom[0]}{selectedPatient.nom[0]}
              </div>
              <div>
                <div className="font-bold text-dark">{selectedPatient.prenom} {selectedPatient.nom}</div>
                <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
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
            <div className="bg-white rounded-xl border border-line px-6 py-12 text-center">
              <p className="text-muted text-sm">Aucune visite enregistrée pour ce patient.</p>
              <Button variant="teal" size="md" className="mt-4" onClick={() => navigate('/nouvelle-visite')}>Enregistrer une visite</Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-line">
                    <th className="px-5 py-3 text-left text-xs font-bold text-muted uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-muted uppercase tracking-wide">Médecin</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-muted uppercase tracking-wide">Grade</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-muted uppercase tracking-wide">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {patientVisites.map(v => {
                    const m = medecins.find(x => x.id === v.medecinId)
                    const isToday = v.date === today
                    return (
                      <tr key={v.id} className={`border-t border-muted-light ${isToday ? 'bg-teal-subtle' : 'hover:bg-surface-hover'} transition-colors`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted">{formatDateFR(v.date, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            {isToday && <Badge variant="success">Aujourd'hui</Badge>}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold">Dr. {m ? `${m.prenom} ${m.nom}` : '—'}</td>
                        <td className="px-5 py-3 text-muted">{m?.grade ?? '—'}</td>
                        <td className="px-5 py-3"><span className="font-mono text-xs bg-muted-light text-muted px-1.5 py-0.5 rounded">{m?.code ?? '—'}</span></td>
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
