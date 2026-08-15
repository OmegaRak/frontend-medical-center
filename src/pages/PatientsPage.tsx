import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LuPencil, LuTrash2, LuHistory } from 'react-icons/lu'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/FormFields'
import { Modal, ConfirmDeleteModal } from '../components/ui/Modal'
import { useAppData } from '../context/AppDataContext'
import { newId } from '../lib/utils'
import type { Patient, FormModal, Sex } from '../types'

const EMPTY_PATIENT: Omit<Patient, 'id'> = { code: '', nom: '', prenom: '', sexe: 'M', adresse: '' }

export function PatientsPage() {
  const { patients, setPatients } = useAppData()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<FormModal>(null)
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
      setPatients(patients.map(p => (p.id === editTarget.id ? { ...editTarget, ...form } : p)))
      toast.success('Patient modifié avec succès')
    } else {
      setPatients([...patients, { id: newId(), ...form }])
      toast.success('Patient ajouté avec succès')
    }
    setModal(null)
  }

  function doDelete() {
    if (!deleteTarget) return
    setPatients(patients.filter(p => p.id !== deleteTarget.id))
    toast.info('Patient supprimé')
    setModal(null)
    setDeleteTarget(null)
  }

  function viewHistory(p: Patient) {
    navigate('/historique', { state: { patientId: p.id } })
  }

  const formModal = modal === 'add-patient' || modal === 'edit-patient'

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${filtered.length} patient${filtered.length > 1 ? 's' : ''} ${search ? 'trouvé' + (filtered.length > 1 ? 's' : '') : 'enregistré' + (filtered.length > 1 ? 's' : '')}`}
        action={<Button variant="teal" onClick={openAdd}><span>＋</span> Ajouter un patient</Button>}
      />

      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base pointer-events-none">🔍</span>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou code patient…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-line rounded-lg text-dark placeholder-faint focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-dark cursor-pointer text-lg leading-none">×</button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-line">
              {['Code', 'Nom', 'Prénom', 'Sexe', 'Adresse', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted text-sm">Aucun patient trouvé</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-t border-muted-light hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3"><span className="font-mono text-xs bg-muted-light text-muted px-1.5 py-0.5 rounded">{p.code}</span></td>
                <td className="px-4 py-3 font-semibold text-dark">{p.nom}</td>
                <td className="px-4 py-3 text-dark">{p.prenom}</td>
                <td className="px-4 py-3"><Badge variant={p.sexe === 'F' ? 'success' : 'default'}>{p.sexe === 'F' ? 'Femme' : 'Homme'}</Badge></td>
                <td className="px-4 py-3 text-muted max-w-[200px] truncate">{p.adresse}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Historique des visites" onClick={() => viewHistory(p)} className="p-1.5 rounded-md text-primary hover:bg-primary-light transition-colors cursor-pointer"><LuHistory size={15} /></button>
                    <button title="Modifier" onClick={() => openEdit(p)} className="p-1.5 rounded-md text-muted hover:bg-muted-light hover:text-dark transition-colors cursor-pointer"><LuPencil size={15} /></button>
                    <button title="Supprimer" onClick={() => { setDeleteTarget(p); setModal('confirm-delete') }} className="p-1.5 rounded-md text-danger hover:bg-danger-light transition-colors cursor-pointer"><LuTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
            <Button variant="teal" onClick={savePatient} disabled={!form.nom.trim() || !form.prenom.trim()}>
              {modal === 'add-patient' ? 'Ajouter le patient' : 'Enregistrer'}
            </Button>
          </div>
        </Modal>
      )}

      {modal === 'confirm-delete' && deleteTarget && (
        <ConfirmDeleteModal
          label={`${deleteTarget.prenom} ${deleteTarget.nom}`}
          onConfirm={doDelete}
          onClose={() => { setModal(null); setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}
