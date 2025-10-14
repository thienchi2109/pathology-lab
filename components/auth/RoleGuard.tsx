'use client'

import { useAuth } from '@/lib/auth'
import type { UserRole } from '@/lib/auth'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

/**
 * Component to conditionally render children based on user role
 * Usage:
 * <RoleGuard allowedRoles={['editor']}>
 *   <Button>Edit</Button>
 * </RoleGuard>
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { role, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Component to show content only to editors
 */
export function EditorOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['editor']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Component to show content to both editors and viewers
 */
export function AuthenticatedOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['editor', 'viewer']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
