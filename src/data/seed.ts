import type { Patient, Medecin, Visite } from '../types'
import { today } from '../lib/utils'

export const GRADES = ['Professeur', 'Maître de conférences', 'Spécialiste', 'Généraliste', 'Interne', 'Résident']

export const SEED_PATIENTS: Patient[] = [
  { id: 'p1', code: 'PAT-001', nom: 'Benali', prenom: 'Fatima', sexe: 'F', adresse: '12 rue des Oliviers, Alger' },
  { id: 'p2', code: 'PAT-002', nom: 'Hadj', prenom: 'Mohamed', sexe: 'M', adresse: '7 avenue Pasteur, Oran' },
  { id: 'p3', code: 'PAT-003', nom: 'Meziane', prenom: 'Amina', sexe: 'F', adresse: '34 bd Zighoud Youcef, Constantine' },
  { id: 'p4', code: 'PAT-004', nom: 'Cherif', prenom: 'Youcef', sexe: 'M', adresse: '5 impasse des Mimosas, Annaba' },
  { id: 'p5', code: 'PAT-005', nom: 'Bouzid', prenom: 'Soraya', sexe: 'F', adresse: '22 rue Didouche Mourad, Blida' },
  { id: 'p6', code: 'PAT-006', nom: 'Laouedj', prenom: 'Karim', sexe: 'M', adresse: '18 cité SONATRACH, Hassi Messaoud' },
  { id: 'p7', code: 'PAT-007', nom: 'Ouali', prenom: 'Nadia', sexe: 'F', adresse: '9 rue Ben Badis, Sétif' },
]

export const SEED_MEDECINS: Medecin[] = [
  { id: 'm1', code: 'MED-001', nom: 'Bensalem', prenom: 'Rachid', grade: 'Professeur' },
  { id: 'm2', code: 'MED-002', nom: 'Kaci', prenom: 'Leïla', grade: 'Maître de conférences' },
  { id: 'm3', code: 'MED-003', nom: 'Ould Hamou', prenom: 'Tarek', grade: 'Spécialiste' },
  { id: 'm4', code: 'MED-004', nom: 'Ferhat', prenom: 'Yasmina', grade: 'Généraliste' },
  { id: 'm5', code: 'MED-005', nom: 'Ziani', prenom: 'Omar', grade: 'Interne' },
]

export const SEED_VISITES: Visite[] = [
  { id: 'v1', patientId: 'p1', medecinId: 'm1', date: today },
  { id: 'v2', patientId: 'p2', medecinId: 'm3', date: today },
  { id: 'v3', patientId: 'p3', medecinId: 'm2', date: today },
  { id: 'v4', patientId: 'p1', medecinId: 'm2', date: '2026-07-18' },
  { id: 'v5', patientId: 'p4', medecinId: 'm1', date: '2026-07-22' },
  { id: 'v6', patientId: 'p2', medecinId: 'm4', date: '2026-06-10' },
  { id: 'v7', patientId: 'p5', medecinId: 'm3', date: today },
]
