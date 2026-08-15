import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useAppData } from '../context/AppDataContext'
import { newId, today, formatDateFR } from '../lib/utils'
import type { Patient } from '../types'

export function NouvelleVisitePage() {
  const { patients, medecins, visites, setVisites } = useAppData()

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false)
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
    toast.success('Visite enregistrée avec succès')
  }

  const medecin = medecins.find(m => m.id === selectedMedecinId)
  const canSubmit = !!selectedPatient && !!selectedMedecinId && !!date

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center text-3xl mb-5">✓</div>
        <h2 className="text-xl font-bold text-dark mb-2">Visite enregistrée</h2>
        <p className="text-muted text-sm mb-1">
          <strong>{selectedPatient?.prenom} {selectedPatient?.nom}</strong> — Dr. <strong>{medecin?.prenom} {medecin?.nom}</strong>
        </p>
        <p className="text-muted text-sm mb-8">{formatDateFR(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <Button variant="teal" size="lg" onClick={reset}>Enregistrer une autre visite</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Nouvelle visite" subtitle="Remplissez les trois champs puis enregistrez" />

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        {/* Étape 1 */}
        <div className="px-6 py-5 border-b border-muted-light">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="text-sm font-bold text-dark">Sélectionner le patient</span>
          </div>
          <div ref={dropdownRef} className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">🔍</span>
            <input
              ref={searchRef}
              type="text"
              value={patientSearch}
              onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); setShowDropdown(true) }}
              onFocus={() => { if (patientSearch) setShowDropdown(true) }}
              placeholder="Taper le nom ou code patient…"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-line rounded-lg text-dark placeholder-faint focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
            {selectedPatient && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success pointer-events-none text-base">✓</span>}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-lg shadow-lg z-20 overflow-hidden">
                {suggestions.map(p => (
                  <button
                    key={p.id}
                    onMouseDown={() => selectPatient(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-light text-left transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-xs text-muted bg-muted-light px-1.5 py-0.5 rounded shrink-0">{p.code}</span>
                    <span className="font-medium text-dark">{p.prenom} {p.nom}</span>
                    <span className="text-muted text-xs ml-auto">{p.sexe === 'F' ? 'Femme' : 'Homme'}</span>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && patientSearch.length >= 1 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-lg shadow-lg z-20 px-4 py-3 text-sm text-muted">
                Aucun patient trouvé pour « {patientSearch} »
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="mt-2 flex items-center gap-2 text-xs text-success font-medium">
              <span>✓</span>
              <span>{selectedPatient.prenom} {selectedPatient.nom} · {selectedPatient.code} · {selectedPatient.adresse}</span>
            </div>
          )}
        </div>

        {/* Étape 2 */}
        <div className="px-6 py-5 border-b border-muted-light">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${selectedPatient ? 'bg-primary text-white' : 'bg-line text-muted'}`}>2</span>
            <span className="text-sm font-bold text-dark">Sélectionner le médecin</span>
          </div>
          <select
            value={selectedMedecinId}
            onChange={e => setSelectedMedecinId(e.target.value)}
            disabled={!selectedPatient}
            className="w-full px-3 py-2.5 text-sm bg-white border border-line rounded-lg text-dark focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">— Choisir un médecin —</option>
            {medecins.map(m => (
              <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} · {m.grade}</option>
            ))}
          </select>
        </div>

        {/* Étape 3 */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${selectedMedecinId ? 'bg-primary text-white' : 'bg-line text-muted'}`}>3</span>
            <span className="text-sm font-bold text-dark">Date de la visite</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={!selectedMedecinId}
            className="w-full px-3 py-2.5 text-sm bg-white border border-line rounded-lg text-dark focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer disabled:opacity-50"
          />
          <p className="text-xs text-muted mt-1.5">Date du jour pré-remplie — modifiable si besoin</p>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-xl text-base font-bold transition-all
              ${canSubmit
                ? 'bg-teal text-white hover:bg-teal-hover active:scale-[0.99] shadow-md shadow-teal/30'
                : 'bg-line text-faint cursor-not-allowed'
              }`}
          >
            Enregistrer la visite
          </button>
        </div>
      </div>
    </div>
  )
}
