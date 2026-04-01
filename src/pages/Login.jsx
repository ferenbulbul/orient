import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import logo from '../assets/logo.svg'

export default function Login() {
  const { signIn, isAuthenticated, loading } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/panel" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/panel', { replace: true })
    } catch (err) {
      setError(
        isEN
          ? 'Invalid email or password.'
          : 'Geçersiz e-posta veya şifre.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-8 flex flex-col items-center gap-4">
            <img src={logo} alt="Euromat Print" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-slate-900">
              {isEN ? 'Sign In' : 'Giriş Yap'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEN
                ? 'Enter your credentials to access your panel'
                : 'Panelinize erişmek için bilgilerinizi girin'}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {isEN ? 'Email' : 'E-posta'}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {isEN ? 'Password' : 'Şifre'}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting
                ? isEN
                  ? 'Signing in...'
                  : 'Giriş yapılıyor...'
                : isEN
                  ? 'Sign In'
                  : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-slate-500 transition hover:text-slate-700"
            >
              {isEN ? '← Back to website' : '← Siteye Dön'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
