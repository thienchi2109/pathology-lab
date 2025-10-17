# Task Completion Checklist

When completing a task, follow these steps:

## 1. Code Quality Checks

### Type Checking
```bash
npm run typecheck
```
- Ensure no TypeScript errors
- Fix any type issues before committing

### Linting
```bash
npm run lint
```
- Ensure no ESLint errors or warnings
- Fix any linting issues before committing

### Build Test
```bash
npm run build
```
- Ensure production build succeeds
- Fix any build errors before committing

## 2. Code Review

### Self-Review Checklist
- [ ] Code follows naming conventions (PascalCase for components, camelCase for utilities)
- [ ] All imports are organized correctly (React → Third-party → Internal → Types)
- [ ] TypeScript types are explicit (no `any`)
- [ ] Error handling is implemented with try-catch
- [ ] Vietnamese error messages for user-facing errors
- [ ] Authentication checks in API routes (requireEditor/requireAuth)
- [ ] Audit logging for mutations (CREATE, UPDATE, DELETE)
- [ ] Mobile-responsive design (tested on small screens)
- [ ] Comments added for complex logic
- [ ] No console.logs left in production code (use console.error for errors)

### Security Checklist
- [ ] Input validation with Zod schemas
- [ ] SQL injection prevention (use Supabase client, not raw SQL)
- [ ] XSS prevention (React handles this by default)
- [ ] RBAC checks in API routes
- [ ] No sensitive data in client-side code
- [ ] Environment variables used for secrets

## 3. Testing

### Manual Testing
- [ ] Test happy path (normal flow)
- [ ] Test error cases (invalid input, missing data)
- [ ] Test edge cases (empty lists, max limits)
- [ ] Test on mobile device or responsive mode
- [ ] Test with editor role
- [ ] Test with viewer role (should be read-only)

### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox (optional)
- [ ] Test in Safari (optional)
- [ ] Test on mobile browser

## 4. Documentation

### Code Documentation
- [ ] JSDoc comments for complex functions
- [ ] Inline comments for non-obvious logic
- [ ] README updated if needed
- [ ] API endpoints documented (if new routes added)

### Task Documentation
- [ ] Update task status in `.kiro/specs/lab-sample-management/tasks.md`
- [ ] Mark sub-tasks as complete with ✅
- [ ] Create summary document if major task (like TASK_3_SUMMARY.md)
- [ ] Document any deviations from original plan

## 5. Git Workflow

### Commit
```bash
git add .
git commit -m "feat: descriptive message"
```

### Commit Message Format
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Push
```bash
git push
```

## 6. Deployment Checklist (When Ready)

### Pre-Deployment
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] R2 bucket configured and accessible
- [ ] Supabase RLS policies enabled
- [ ] Test users created with correct roles

### Post-Deployment
- [ ] Verify production build works
- [ ] Test authentication flow
- [ ] Test critical user paths
- [ ] Monitor error logs
- [ ] Check performance metrics

## 7. Handoff

### For Next Developer
- [ ] Document any known issues
- [ ] Document any technical debt
- [ ] Document any workarounds
- [ ] Update task list with next steps
- [ ] Communicate blockers or dependencies

## Example Task Completion

After completing Task 3 (Authentication):
1. ✅ Ran `npm run typecheck` - No errors
2. ✅ Ran `npm run lint` - No errors
3. ✅ Ran `npm run build` - Build successful
4. ✅ Tested login flow with test user
5. ✅ Tested role-based access (editor vs viewer)
6. ✅ Created `docs/AUTHENTICATION.md` documentation
7. ✅ Created `docs/TASK_3_SUMMARY.md` summary
8. ✅ Updated `tasks.md` with ✅ checkmarks
9. ✅ Committed with message: "feat: implement authentication system"
10. ✅ Pushed to repository

## Notes

- **Don't skip type checking and linting** - These catch bugs early
- **Test with both roles** - Editor and viewer have different permissions
- **Document as you go** - Don't wait until the end
- **Commit frequently** - Small, focused commits are better
- **Ask for help** - If stuck, consult documentation or ask team
