'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireEditor?: boolean
}

export function ProtectedRoute({ children, requireEditor = false }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (requireEditor && role !== 'editor') {
        router.push('/')
      }
    }
  }, [user, role, loading, requireEditor, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireEditor && role !== 'editor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-400">Bạn không có quyền truy cập trang này</div>
      </div>
    )
  }

  return <>{children}</>
}
