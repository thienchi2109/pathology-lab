# Setup Test Users

## ✅ Users Already Created!

Test users have been automatically created via Supabase MCP tools.

### Test Accounts

**Editor Account (Full Access):**
- Email: `editor@lab.local`
- Password: `Test123!`
- User ID: `0f75e716-b314-4fb9-9c5f-ee2cd61409f5`
- Role: `editor`

**Viewer Account (Read-Only):**
- Email: `viewer@lab.local`
- Password: `Test123!`
- User ID: `a918c9d0-61d1-4e21-8fef-2587d3a25443`
- Role: `viewer`

### Verify in Supabase Dashboard

You can verify these users exist:
1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **Users**
3. You should see both `editor@lab.local` and `viewer@lab.local`

## Test Login

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Try logging in with both accounts
4. Verify:
   - Editor sees "Editor" badge in header
   - Viewer sees "Viewer" badge in header
   - Both can access `/dashboard`

## Next Steps

Once users are seeded, we'll build API routes (Task 5) where you can test:
- Editors can create/update data
- Viewers get 403 Forbidden on mutations
- Audit logs track all actions
- RLS policies enforce data access

---

**Note**: For production, you'll create real user accounts through your admin interface or invite system.
