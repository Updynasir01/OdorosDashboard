import { Navigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import { ReactNode } from 'react'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAdmin()
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}
