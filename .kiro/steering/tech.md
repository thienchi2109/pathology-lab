# Technology Stack

## Frontend

- **Framework**: Next.js 15+ with App Router and TypeScript
- **Styling**: Tailwind CSS with custom pastel color theme
- **UI Components**: shadcn/ui (customized with pastel colors)
- **Data Grid**: TanStack Table v8 for server-side data rendering
- **Charts**: ECharts for interactive visualizations
- **Forms**: React Hook Form + Zod for validation
- **Client-side SQL**: DuckDB-WASM for complex pivot operations
- **PWA**: Progressive Web App with offline dashboard caching

## Backend

- **API**: Next.js API Routes (serverless)
- **Database**: Supabase Postgres with Row Level Security (RLS)
- **Authentication**: Supabase Auth with JWT sessions
- **Object Storage**: Cloudflare R2 (S3-compatible) for images
- **Authorization**: Application-layer RBAC (editor/viewer roles)

## Deployment

- **Hosting**: Vercel for Next.js application
- **Database**: Supabase Cloud (managed Postgres)
- **Storage**: Cloudflare R2 bucket

## Design System

### Color Palette (Pastel Theme)
- Primary: Soft Blue (#93C5FD - blue-300)
- Secondary: Lavender (#C4B5FD - purple-300)
- Success: Mint Green (#86EFAC - green-300)
- Warning: Peach (#FED7AA - orange-300)
- Error: Soft Rose (#FCA5A5 - red-300)
- Background: Off-white (#FAFAFA - gray-50)
- Text Primary: Charcoal (#1F2937 - gray-800)

### Typography
- Font: Inter (sans-serif)
- Body: 16px, 400 weight
- Headings: 600 weight

### Layout
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1280px (bottom navigation)
  - Desktop: ≥ 1280px (sidebar navigation)
- Maximum content width: 1400px
- Touch targets: minimum 44x44px for mobile

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
# Run migrations in Supabase dashboard or via CLI
supabase db push     # Push local migrations
supabase db reset    # Reset database (dev only)
```

### Testing
```bash
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run integration tests (Playwright)
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

## Performance Targets

- Page load: < 2s
- API response: < 500ms (p95)
- Grid rendering: < 1s for 100 rows
- Image upload: < 5s for 5MB
- Support 5-7 concurrent users
