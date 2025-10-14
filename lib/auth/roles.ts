import { createClient } from '@/lib/supabase/server'

export type UserRole = 'editor' | 'viewer'

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
}

/**
 * Get the current user with their role from the database
 * Server-side only
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', user.id)
    .single()

  if (dbError || !userData) {
    return null
  }

  return userData as UserWithRole
}

/**
 * Check if the current user has editor role
 * Server-side only
 */
export async function isEditor(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'editor'
}

/**
 * Check if the current user has viewer role
 * Server-side only
 */
export async function isViewer(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'viewer'
}

/**
 * Require editor role or throw error
 * Server-side only - use in API routes
 */
export async function requireEditor(): Promise<UserWithRole> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (user.role !== 'editor') {
    throw new Error('Bạn không có quyền thực hiện thao tác này')
  }
  
  return user
}

/**
 * Require authentication (any role)
 * Server-side only - use in API routes
 */
export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Vui lòng đăng nhập')
  }
  
  return user
}
