import { useState } from 'react'
import { toast } from 'react-toastify'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/FormFields'
import { Modal, ConfirmDeleteModal } from '../components/ui/Modal'
import { useAppData } from '../context/AppDataContext'
import { GRADES } from '../data/seed'
import { newId } from '../lib/utils'
import type { Medecin, FormModal } from '../types'

const EMPTY_MEDECIN = { code: '', nom: '', prenom: '', grade: 'Généraliste' }

export function MedecinsPage() {
  const { medecins, setMedecins } = useAppData()

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<FormModal>(null)
  const [editTarget, setEditTarget] = useState<Medecin | null>(null)
  const [form, setForm] = useState(EMPTY_MEDECIN)
  const [deleteTarget, setDeleteTarget] = useState<Medecin | null>(null)

  const filtered = medecins.filter(m => {
    const q = search.toLowerCase()
    return !q || m.nom.toLowerCase().includes(q) || m.prenom.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
  })

  function openAdd() {
    setForm({ ...EMPTY_MEDECIN, code: `MED-${String(medecins.length + 1).padStart(3, '0')}` })
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
      setMedecins(medecins.map(m => (m.id === editTarget.id ? { ...editTarget, ...form } : m)))
      toast.success('Médecin modifié avec succès')
    } else {
      setMedecins([...medecins, { id: newId(), ...form }])
      toast.success('Médecin ajouté avec succès')
    }
    setModal(null)
  }

  function doDelete() {
    if (!deleteTarget) return
    setMedecins(medecins.filter(m => m.id !== deleteTarget.id))
    toast.info('Médecin supprimé')
    setModal(null)
    setDeleteTarget(null)
  }

  const formModal = modal === 'add-medecin' || modal === 'edit-medecin'

  return (
    <div>
      <PageHeader
        title="Médecins"
        subtitle={`${filtered.length} médecin${filtered.length > 1 ? 's' : ''}`}
        action={<Button variant="teal" onClick={openAdd}><span>＋</span> Ajouter un médecin</Button>}
      />

      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base pointer-events-none">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou code médecin…"
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
              {['Code', 'Nom', 'Prénom', 'Grade', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted text-sm">Aucun médecin trouvé</td></tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="border-t border-muted-light hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3"><span className="font-mono text-xs bg-muted-light text-muted px-1.5 py-0.5 rounded">{m.code}</span></td>
                <td className="px-4 py-3 font-semibold text-dark">{m.nom}</td>
                <td className="px-4 py-3 text-dark">{m.prenom}</td>
                <td className="px-4 py-3"><Badge variant="muted">{m.grade}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Modifier" onClick={() => openEdit(m)} className="p-1.5 rounded-md text-muted hover:bg-muted-light hover:text-dark transition-colors cursor-pointer"><LuPencil size={15} /></button>
                    <button title="Supprimer" onClick={() => { setDeleteTarget(m); setModal('confirm-delete') }} className="p-1.5 rounded-md text-danger hover:bg-danger-light transition-colors cursor-pointer"><LuTrash2 size={15} /></button>
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
            <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
            <Button variant="teal" onClick={saveMedecin} disabled={!form.nom.trim() || !form.prenom.trim()}>
              {modal === 'add-medecin' ? 'Ajouter le médecin' : 'Enregistrer'}
            </Button>
          </div>
        </Modal>
      )}

      {modal === 'confirm-delete' && deleteTarget && (
        <ConfirmDeleteModal
          label={`Dr. ${deleteTarget.prenom} ${deleteTarget.nom}`}
          onConfirm={doDelete}
          onClose={() => { setModal(null); setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}
