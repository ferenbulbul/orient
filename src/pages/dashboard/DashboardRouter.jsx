import { useAuth } from '../../context/AuthContext'
import CustomerDashboard from './CustomerDashboard'
import StaffDashboard from './StaffDashboard'
import AdminDashboard from './AdminDashboard'

export default function DashboardRouter() {
  const { role } = useAuth()

  if (role === 'admin') return <AdminDashboard />
  if (role === 'personel') return <StaffDashboard />
  return <CustomerDashboard />
}
