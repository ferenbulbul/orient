import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/giris" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/panel" replace />
  }

  return children
}
