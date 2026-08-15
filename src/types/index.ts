export type Sex = 'M' | 'F'

export interface Patient {
  id: string
  code: string
  nom: string
  prenom: string
  sexe: Sex
  adresse: string
}

export interface Medecin {
  id: string
  code: string
  nom: string
  prenom: string
  grade: string
}

export interface Visite {
  id: string
  patientId: string
  medecinId: string
  date: string
}

export type FormModal = null | 'add-patient' | 'edit-patient' | 'add-medecin' | 'edit-medecin' | 'confirm-delete'
