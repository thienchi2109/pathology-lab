# Test Authentication

## Test Users Created ✅

Two test accounts have been created in your Supabase database:

### 1. Editor Account (Full Access)
- **Email**: `editor@lab.local`
- **Password**: `Test123!`
- **Role**: `editor`
- **Permissions**: Can create, read, update, delete all data

### 2. Viewer Account (Read-Only)
- **Email**: `viewer@lab.local`
- **Password**: `Test123!`
- **Role**: `viewer`
- **Permissions**: Can only read data, no mutations allowed

## How to Test

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Test Login Flow

1. Go to `http://localhost:3000/login`
2. Try logging in with the **editor** account:
   - Email: `editor@lab.local`
   - Password: `Test123!`
3. After login, you should:
   - Be redirected to `/dashboard`
   - See "Editor" badge in the header
   - See your name "Test Editor" displayed

4. Sign out and try the **viewer** account:
   - Email: `viewer@lab.local`
   - Password: `Test123!`
5. After login, you should:
   - Be redirected to `/dashboard`
   - See "Viewer" badge in the header
   - See your name "Test Viewer" displayed

### Step 3: Test Role-Based Access (Coming Soon)

Once we build API routes (Task 5+), you'll be able to test:
- ✅ Editor can POST/PATCH/DELETE data
- ❌ Viewer gets 403 Forbidden on mutations
- ✅ Both can GET/read data
- ✅ All actions logged in `audit_logs` table

## ✅ Issue Fixed!

The "Database error querying schema" issue has been resolved. The auth.users records were missing some required fields (`email_change`, `phone_change`, etc.) which have now been populated.

## Troubleshooting

### Can't login?
- Check `.env.local` has correct Supabase credentials
- Verify users exist in Supabase Dashboard > Authentication > Users
- Check browser console for errors
- **Fixed**: "Database error querying schema" - auth.users fields now properly populated

### Redirected to login after successful auth?
- Check middleware is working: `middleware.ts`
- Verify session cookie is being set
- Check Supabase URL and keys are correct

### Role not showing correctly?
- Verify `public.users` table has correct role values
- Check `lib/auth/server.ts` `getUserRole()` function
- Look at browser Network tab for `/api/me` response

## Next Steps

Once auth is confirmed working, we'll proceed to:
- **Task 5**: Build dictionary/catalog API routes
- **Task 6**: Kit inventory management
- **Task 7**: Sample management API

These will give us real endpoints to test RBAC enforcement!
