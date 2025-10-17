# Authentication System - Implementation Details

## Overview
Task 3 (Authentication Setup) has been completed successfully. The system uses Supabase Auth integrated with Next.js for authentication and implements a two-level RBAC system (editor/viewer).

## Architecture

### Client-Side
- **Auth Context**: `lib/auth/context.tsx` provides `AuthProvider` and `useAuth` hook
- **Auth Hooks**: `lib/auth/hooks.ts` provides role-based hooks:
  - `useIsAuthenticated()` - Check if user is logged in
  - `useIsEditor()` - Check if user has editor role
  - `useIsViewer()` - Check if user has viewer role
- **Protected Routes**: `components/auth/ProtectedRoute.tsx` wraps pages requiring auth
- **Role Guards**: `components/auth/RoleGuard.tsx` conditionally renders based on role

### Server-Side
- **Role Utilities**: `lib/auth/roles.ts` provides server-side validation:
  - `requireAuth()` - Require any authenticated user
  - `requireEditor()` - Require editor role
  - `getCurrentUser()` - Get current user with role
  - `isEditor(user)` - Check if user is editor
  - `isViewer(user)` - Check if user is viewer
- **Middleware**: `middleware.ts` validates sessions on all requests
- **Supabase Clients**:
  - `lib/supabase/client.ts` - Browser client
  - `lib/supabase/server.ts` - Server client
  - `lib/supabase/middleware.ts` - Session validation

## Authentication Flow

### Login Flow
1. User visits protected route
2. Middleware checks for valid session
3. If no session, redirect to `/login`
4. User enters credentials on login page
5. Supabase Auth validates credentials
6. Session created and stored in cookies
7. Auth context fetches user role from database
8. User redirected to home page

### Protected Route Flow
1. Component wrapped in `<ProtectedRoute>`
2. `useAuth()` hook checks authentication status
3. If not authenticated, redirect to login
4. If `requireEditor=true`, check role
5. If insufficient permissions, show error
6. Otherwise, render protected content

### API Route Protection
```typescript
import { requireEditor } from '@/lib/auth/roles';

export async function POST(request: Request) {
  const user = await requireEditor();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // ... business logic
}
```

## Components

### Login Page
- Location: `app/login/page.tsx`
- Features:
  - Email/password form
  - Error handling
  - Loading states
  - Vietnamese language support
  - Pastel color theme
  - Responsive design

### Sign Out Button
- Location: `components/auth/SignOutButton.tsx`
- Usage: `<SignOutButton />`
- Calls Supabase `signOut()` and redirects to login

### Protected Route
- Location: `components/auth/ProtectedRoute.tsx`
- Usage:
```typescript
<ProtectedRoute requireEditor={true}>
  <YourComponent />
</ProtectedRoute>
```

### Role Guards
- Location: `components/auth/RoleGuard.tsx`
- Usage:
```typescript
<EditorOnly>
  <Button>Edit</Button>
</EditorOnly>

<AuthenticatedOnly>
  <UserProfile />
</AuthenticatedOnly>
```

## Usage Examples

### Client Component
```typescript
'use client';
import { useAuth, useIsEditor } from '@/lib/auth';

export function MyComponent() {
  const { user, role, loading } = useAuth();
  const isEditor = useIsEditor();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      {isEditor && <Button>Edit</Button>}
    </div>
  );
}
```

### Server Component
```typescript
import { getCurrentUser } from '@/lib/auth/roles';

export default async function ServerPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Welcome, {user.email}</div>;
}
```

### API Route
```typescript
import { requireEditor } from '@/lib/auth/roles';

export async function POST(request: Request) {
  const user = await requireEditor();
  if (!user) {
    return NextResponse.json({ 
      error: "Bạn không có quyền thực hiện thao tác này" 
    }, { status: 403 });
  }
  
  // Business logic for editors only
  // ...
}
```

## Security Features
- ✅ Session validation on every request (middleware)
- ✅ Automatic token refresh
- ✅ Role-based access control (RBAC)
- ✅ Server-side role validation
- ✅ Client-side role checks for UI
- ✅ Protected routes with authentication checks
- ✅ Vietnamese error messages

## Testing
To test the authentication system:
1. Create test users in Supabase with roles
2. Test login with valid/invalid credentials
3. Test accessing protected routes without auth
4. Test role-based UI visibility (editor vs viewer)
5. Test sign-out functionality
6. Test session persistence across page refreshes

## Documentation
Comprehensive documentation available at:
- `docs/AUTHENTICATION.md` - Full authentication guide
- `docs/TASK_3_SUMMARY.md` - Task completion summary
