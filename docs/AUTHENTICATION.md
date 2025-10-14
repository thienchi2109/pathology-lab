# Authentication Setup

## Overview

The Lab Sample Management System uses Supabase Auth for authentication with role-based access control (RBAC). The system supports two roles:
- **Editor**: Can create, update, and delete data
- **Viewer**: Read-only access

## Architecture

### Components

1. **Supabase Auth**: Handles authentication and session management
2. **Middleware**: Validates sessions on protected routes
3. **Auth Context**: Provides user and role information to client components
4. **Role Guards**: Components for conditional rendering based on roles
5. **Server Utilities**: Functions for server-side authentication checks

## File Structure

```
lib/auth/
├── context.tsx          # Client-side auth context and provider
├── hooks.ts             # Client-side auth hooks
├── roles.ts             # Server-side role checking utilities
└── index.ts             # Exports

components/auth/
├── ProtectedRoute.tsx   # Route protection wrapper
├── RoleGuard.tsx        # Role-based UI visibility
├── SignOutButton.tsx    # Sign out button component
└── index.ts             # Exports

app/
├── login/page.tsx       # Login page
└── auth/callback/route.ts  # Auth callback handler

lib/supabase/
├── client.ts            # Browser client
├── server.ts            # Server client
└── middleware.ts        # Session validation
```

## Usage

### Client-Side Authentication

#### Using Auth Context

```tsx
'use client'

import { useAuth } from '@/lib/auth'

export function MyComponent() {
  const { user, role, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

#### Using Auth Hooks

```tsx
'use client'

import { useIsEditor, useIsViewer, useIsAuthenticated } from '@/lib/auth'

export function MyComponent() {
  const isEditor = useIsEditor()
  const isViewer = useIsViewer()
  const isAuthenticated = useIsAuthenticated()

  return (
    <div>
      {isEditor && <button>Edit</button>}
      {isViewer && <p>View only</p>}
    </div>
  )
}
```

#### Role-Based UI Visibility

```tsx
'use client'

import { EditorOnly, RoleGuard } from '@/components/auth'

export function MyComponent() {
  return (
    <div>
      {/* Show only to editors */}
      <EditorOnly>
        <button>Create Sample</button>
      </EditorOnly>

      {/* Custom role guard */}
      <RoleGuard allowedRoles={['editor', 'viewer']}>
        <button>View Dashboard</button>
      </RoleGuard>
    </div>
  )
}
```

#### Protected Routes

```tsx
'use client'

import { ProtectedRoute } from '@/components/auth'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  )
}

// Require editor role
export default function EditPage() {
  return (
    <ProtectedRoute requireEditor>
      <div>Editor only content</div>
    </ProtectedRoute>
  )
}
```

### Server-Side Authentication

#### API Routes

```tsx
import { requireAuth, requireEditor } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Require any authenticated user
export async function GET() {
  try {
    const user = await requireAuth()
    // user is guaranteed to exist here
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Vui lòng đăng nhập' },
      { status: 401 }
    )
  }
}

// Require editor role
export async function POST() {
  try {
    const user = await requireEditor()
    // user is guaranteed to be an editor here
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Bạn không có quyền thực hiện thao tác này' },
      { status: 403 }
    )
  }
}
```

#### Server Components

```tsx
import { getCurrentUser, isEditor } from '@/lib/auth'

export default async function ServerComponent() {
  const user = await getCurrentUser()
  const canEdit = await isEditor()

  if (!user) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {canEdit && <button>Edit</button>}
    </div>
  )
}
```

## Middleware

The middleware automatically:
1. Validates Supabase sessions on every request
2. Refreshes expired tokens
3. Redirects unauthenticated users to `/login`
4. Allows public access to `/login` and `/auth/*` routes

Configuration in `middleware.ts`:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
```

## Database Schema

The `users` table stores user roles:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)

RLS policies are configured in the database to enforce role-based access:

### Editor Policies
- SELECT: All tables
- INSERT: kits, samples, sample_results, sample_images
- UPDATE: kits, samples, sample_results
- DELETE: sample_images (own uploads only)

### Viewer Policies
- SELECT: All tables except audit_logs
- No INSERT, UPDATE, DELETE

Example policy:
```sql
CREATE POLICY "Editors can insert samples"
  ON samples FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'editor'
    )
  );
```

## Login Flow

1. User visits protected route
2. Middleware checks for valid session
3. If no session, redirect to `/login`
4. User enters credentials
5. Supabase Auth validates credentials
6. Session created and stored in cookies
7. User redirected to home page
8. Auth context fetches user role from database

## Sign Out Flow

1. User clicks sign out button
2. `signOut()` called from auth context
3. Supabase session invalidated
4. User redirected to `/login`
5. Middleware prevents access to protected routes

## Error Handling

### Client-Side Errors
- Invalid credentials: Display error message on login form
- Session expired: Automatic redirect to login
- Insufficient permissions: Show error message or hide UI elements

### Server-Side Errors
- 401 Unauthorized: Missing or invalid session
- 403 Forbidden: Insufficient permissions
- Error messages in Vietnamese for user-facing errors

## Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected route without authentication
- [ ] Access editor-only feature as viewer
- [ ] Sign out functionality
- [ ] Session persistence across page refreshes
- [ ] Token refresh on expiration

### Test Users
Create test users in Supabase with different roles:
```sql
-- Editor user
INSERT INTO users (id, email, role)
VALUES ('uuid-here', 'editor@example.com', 'editor');

-- Viewer user
INSERT INTO users (id, email, role)
VALUES ('uuid-here', 'viewer@example.com', 'viewer');
```

## Security Considerations

1. **Session Management**: Supabase handles secure session storage with httpOnly cookies
2. **Token Refresh**: Automatic token refresh prevents session expiration
3. **RLS Enforcement**: Database-level security as defense in depth
4. **Role Validation**: Both client and server-side role checks
5. **Audit Logging**: All mutations logged with actor information

## Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### User not redirected after login
- Check auth callback route is configured
- Verify redirect URL in Supabase dashboard
- Check browser console for errors

### Role not loading
- Verify user exists in `users` table
- Check RLS policies allow reading from `users` table
- Verify user ID matches auth.users ID

### Session not persisting
- Check cookie settings in Supabase client
- Verify middleware is running on all routes
- Check browser cookie settings

## Future Enhancements

- [ ] OAuth providers (Google, GitHub)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Multi-factor authentication
- [ ] Session management dashboard
- [ ] Role hierarchy (admin, manager, etc.)
