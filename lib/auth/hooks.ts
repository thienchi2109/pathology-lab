'use client'

import { useAuth } from './context'

/**
 * Hook to check if current user is an editor
 * Client-side only
 */
export function useIsEditor(): boolean {
  const { role } = useAuth()
  return role === 'editor'
}

/**
 * Hook to check if current user is a viewer
 * Client-side only
 */
export function useIsViewer(): boolean {
  const { role } = useAuth()
  return role === 'viewer'
}

/**
 * Hook to check if user is authenticated
 * Client-side only
 */
export function useIsAuthenticated(): boolean {
  const { user } = useAuth()
  return user !== null
}
