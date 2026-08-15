import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PatientsPage } from './pages/PatientsPage'
import { MedecinsPage } from './pages/MedecinsPage'
import { NouvelleVisitePage } from './pages/NouvelleVisitePage'
import { HistoriquePage } from './pages/HistoriquePage'

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/medecins" element={<MedecinsPage />} />
                <Route path="/nouvelle-visite" element={<NouvelleVisitePage />} />
                <Route path="/historique" element={<HistoriquePage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  )
}
