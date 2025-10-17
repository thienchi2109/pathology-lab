# Development Commands

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

### Testing (Future)
```bash
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run integration tests (Playwright)
```

### Database (Supabase)
- Use Supabase dashboard for migrations
- Or use Supabase CLI:
```bash
supabase db push     # Push local migrations
supabase db reset    # Reset database (dev only)
```

## Windows-Specific Commands

Since this project is on Windows with cmd shell, use these commands:

### File Operations
```cmd
dir                  # List files
type file.txt        # View file content
copy source dest     # Copy file
del file.txt         # Delete file
mkdir dirname        # Create directory
rmdir /s /q dirname  # Remove directory recursively
```

### Git Commands
```bash
git status           # Check status
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Push to remote
git pull             # Pull from remote
git log --oneline    # View commit history
```

### Process Management
```cmd
tasklist             # List running processes
taskkill /F /PID id  # Kill process by ID
netstat -ano         # Show network connections
```

## Environment Setup

### Required Environment Variables
Create `.env.local` file with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=your_r2_public_url
```

### Installation
```bash
# Install dependencies
npm install

# Copy environment template
copy .env.local.example .env.local

# Start development server
npm run dev
```

## Development Workflow

### Before Starting Work
1. Pull latest changes: `git pull`
2. Install dependencies: `npm install`
3. Check environment variables in `.env.local`
4. Start dev server: `npm run dev`

### During Development
1. Run type checking: `npm run typecheck`
2. Run linting: `npm run lint`
3. Test in browser: `http://localhost:3000`

### Before Committing
1. Run type check: `npm run typecheck`
2. Run lint: `npm run lint`
3. Test build: `npm run build`
4. Commit changes: `git add . && git commit -m "message"`
5. Push: `git push`

## Troubleshooting

### Port Already in Use
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /F /PID <process_id>
```

### Clear Next.js Cache
```cmd
rmdir /s /q .next
npm run dev
```

### Reinstall Dependencies
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Supabase Connection Issues
1. Check `.env.local` has correct values
2. Verify Supabase project is active
3. Check network connection
4. Restart dev server

## Performance Targets
- Page load: < 2s
- API response: < 500ms (p95)
- Grid rendering: < 1s for 100 rows
- Image upload: < 5s for 5MB
- Support 5-7 concurrent users
