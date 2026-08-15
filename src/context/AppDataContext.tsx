import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Patient, Medecin, Visite } from '../types'
import { SEED_PATIENTS, SEED_MEDECINS, SEED_VISITES } from '../data/seed'

interface AppDataContextValue {
  patients: Patient[]
  setPatients: (p: Patient[]) => void
  medecins: Medecin[]
  setMedecins: (m: Medecin[]) => void
  visites: Visite[]
  setVisites: (v: Visite[]) => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(SEED_PATIENTS)
  const [medecins, setMedecins] = useState<Medecin[]>(SEED_MEDECINS)
  const [visites, setVisites] = useState<Visite[]>(SEED_VISITES)

  return (
    <AppDataContext.Provider value={{ patients, setPatients, medecins, setMedecins, visites, setVisites }}>
      {children}
    </AppDataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData doit être utilisé dans <AppDataProvider>')
  return ctx
}
