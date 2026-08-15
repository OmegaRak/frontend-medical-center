import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LuEye, LuEyeOff, LuLoaderCircle } from 'react-icons/lu'
import { Input } from '../components/ui/FormFields'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (!result.ok) {
      alert("d")
      setError(result.error ?? 'Une erreur est survenue.')
      return
    }
      alert("dc")
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal flex items-center justify-center text-white font-bold text-lg mb-3">MC</div>
          <h1 className="text-lg font-bold text-dark">Centre Médical</h1>
          <p className="text-sm text-muted mt-0.5">Connectez-vous à votre espace accueil</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-line shadow-sm px-6 py-6 flex flex-col gap-4">
          {error && (
            <div className="bg-danger-light border border-danger-border text-danger text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Input
            label="Identifiant"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nom@centre-medical.dz"
            autoFocus
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">
              Mot de passe<span className="text-danger ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 pr-10 text-sm bg-white border border-line rounded-md text-dark placeholder-faint focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-dark cursor-pointer transition-colors"
              >
                {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary cursor-pointer"
              />
              Se souvenir de moi
            </label>
            <button type="button" className="text-primary font-medium hover:underline cursor-pointer">
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2
              ${loading
                ? 'bg-line text-faint cursor-not-allowed'
                : 'bg-teal text-white hover:bg-teal-hover active:scale-[0.99] shadow-md shadow-teal/25 cursor-pointer'
              }`}
          >
            {loading && <LuLoaderCircle size={16} className="animate-spin" />}
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-5">
          Accès réservé au personnel du Centre Médical.
        </p>
      </div>
    </div>
  )
}
