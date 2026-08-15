import { createContext, useContext, useState, type ReactNode } from 'react'

interface CurrentUser {
  email: string
  nom: string
}

interface AuthContextValue {
  user: CurrentUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)

  // Mock d'authentification — remplacer par un vrai appel API (ex. axios.post('/api/login', ...))
  async function login(email: string, password: string) {
    await new Promise(r => setTimeout(r, 500))

    if (!email.trim() || !password.trim()) {
      return { ok: false, error: 'Veuillez renseigner votre identifiant et votre mot de passe.' }
    }
    if (password.length < 4) {
      return { ok: false, error: 'Identifiants incorrects.' }
    }

    setUser({ email, nom: email.split('@')[0] })
    return { ok: true }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
