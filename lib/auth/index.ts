// Client-side exports only
export { AuthProvider, useAuth } from './context'
export { useIsEditor, useIsViewer, useIsAuthenticated } from './hooks'

// Re-export types (types are safe to export)
export type { UserRole, UserWithRole } from './roles'
