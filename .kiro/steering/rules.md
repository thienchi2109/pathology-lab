# CLAUDE.md - AI Agent Coding Implementation Rules

## Project Context

This is a **Pathology Lab Management System** - an internal web application for managing laboratory samples with inventory tracking, test results, and analytics. The system treats **KIT inventory as the primary entity**, linking samples only after tests are performed.

## Core Technology Stack

- **Frontend**: Next.js 15+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS (core utilities only - no custom config), Shadcn/UI
- **Auth**: Supabase Auth with Next.js
- **Database**: Supabase Postgres (RLS enabled)
- **Storage**: Cloudflare R2 (S3-compatible) for images
- **Charts**: ECharts for visualizations
- **Tables**: TanStack Table v8 for data grids
- **State**: React hooks (useState, useReducer) - **NO localStorage/sessionStorage**
- **Deployment**: Vercel (frontend) + Supabase (database)

## Critical Architecture Decisions

### 1. Kit-First Data Model
```
kit_batches → kits → samples (1:1) → sample_results + sample_images
```
- **A kit exists before a sample** - inventory tracking is primary
- Sample creation automatically marks kit as "used"
- UI uses `v_lab_records` view to show unified grid (kit + sample data)


### 3. Storage Rules
- **Browser storage APIs forbidden**: No localStorage, sessionStorage, IndexedDB
- **Images**: Upload via presigned URLs to R2 (max 5MB, max 10 per sample)
- **State**: Use React state, server sessions, or database only
- **Offline**: Not supported in MVP (future PWA consideration)

### 4. Sample Code Generation
- Format: `T<MM>_<#####>` (e.g., `T09_00042`)
- Month extracted from `received_at` date
- Global sequence (doesn't reset monthly)
- Use `next_sample_code(date)` Postgres function

## Database Schema Essentials

### Key Tables
```sql
-- Inventory
kit_batches: batch_code, kit_type, quantity, purchased_at
kits: kit_code, status (in_stock|assigned|used|void|expired|lost), batch_id

-- Samples (linked 1:1 to kits)
samples: sample_code, kit_id (unique FK), received_at, price, status, billing_status
sample_results: sample_id, metric_code (WSSV|EHP|EMS|TPD|etc.), value_num
sample_images: sample_id, r2_key, size_bytes (≤5MB limit)

-- Catalogs
kit_types, sample_types, companies, customers, categories, cost_catalog
```

### Critical Views
- `v_lab_records`: Unified grid showing kits + samples (JOIN kits LEFT JOIN samples)
- `v_sample_results_wide`: Pivot results into columns (WSSV, EHP, EMS, etc.)
- `v_kq_chung`: Computed "NHIỄM" (infected) vs "SẠCH" (clean) status

### Important Constraints
- Max 10 images per sample (`CHECK` in app logic + UI validation)
- Image size ≤ 5MB (enforced at upload presign + database constraint)
- Kit can only be "used" once (via `kit_id` UNIQUE FK on samples)

## API Design Patterns

### Authentication
Supabase Auth

### Error Responses (Standardized)
```typescript
// 422: Validation error (e.g., quantity > 100)
// 409: Business logic conflict (e.g., out of stock, duplicate)
// 403: Forbidden (wrong role)
// 401: Unauthorized (no session)
return NextResponse.json({ 
  error: "Không còn kit <type>" 
}, { status: 409 });
```

### Presigned URL Flow
```typescript
// 1. POST /api/uploads/presign → { url, fields, r2Key }
// 2. Client: FormData POST to presigned URL
// 3. POST /api/samples/{id}/images/attach → save r2Key to DB
```

## UI/UX Implementation Rules

### Form Design
- **Mobile-first**: All forms must work on phones (touch-friendly, large inputs)
- **Autosave drafts**: Save to `samples.status='draft'` every 30s or on blur
- **Validation**: Client-side (Zod schemas) + server-side (Postgres constraints)
- **Progressive disclosure**: Show 10-15 result metrics only when `sample_type` selected

### Data Grid (TanStack Table)
```typescript
// Required features:
- Column visibility toggle (hide/show 20-30 columns)
- Server-side filtering (search, date range, status)
- Sorting (multi-column)
- Pagination (default 50 rows)
- Export to CSV (editors only)
```

### Charts (ECharts)
```typescript
// Common chart types:
- Bar (revenue by month, tests by type)
- Line (trends over time)
- Box plot (metric distributions)
- Heatmap (kit usage by day/hour)
```

## Code Quality Standards

### TypeScript
- **Strict mode**: Enable `strict: true` in tsconfig.json
- **Zod validation**: Use for all API request/response schemas
- **No `any`**: Use `unknown` + type guards instead
```typescript
const schema = z.object({
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantity: z.number().int().min(1).max(100)
});
```

### Database Queries
- **Use prepared statements**: Never concatenate SQL strings
- **Index usage**: Always filter/sort on indexed columns (status, received_at)
- **Transactions**: Wrap multi-table writes in `BEGIN...COMMIT`
```typescript
// Good
const { data } = await supabase
  .from('kits')
  .select('*')
  .eq('status', 'in_stock')
  .limit(100);

// Bad (SQL injection risk)
const query = `SELECT * FROM kits WHERE status='${userInput}'`;
```

### Error Handling
```typescript
try {
  // DB operation
} catch (err) {
  console.error('[API] Error:', err);
  // Audit log
  await supabase.from('audit_logs').insert({
    action: 'ERROR',
    entity: 'samples',
    diff: { error: String(err) }
  });
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}
```

## Security Requirements

### Image Upload
```typescript
// Validate before presign
if (sizeBytes > 5 * 1024 * 1024) {
  return NextResponse.json({ error: 'File too large' }, { status: 413 });
}
if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}
```

### RBAC Enforcement
```typescript
// Every mutation endpoint
if (session.user.role !== 'editor') {
  await auditLog(session.user.id, 'FORBIDDEN', 'samples', sampleId);
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Audit Logging
```typescript
// Log all mutations
await supabase.from('audit_logs').insert({
  actor_id: session.user.id,
  action: 'CREATE', // or UPDATE/DELETE/VIEW/EXPORT
  entity: 'samples',
  entity_id: sampleId,
  diff: { before: null, after: newData }
});
```

## Performance Guidelines

### Query Optimization
- **Pagination**: Always use `LIMIT` + `OFFSET` (default 50 rows)
- **Joins**: Prefer views (`v_lab_records`) over client-side joins
- **Indexes**: Ensure all `WHERE`/`ORDER BY` columns are indexed

### Image Optimization
```typescript
// Client-side resize before upload
const canvas = document.createElement('canvas');
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
// ... resize logic
const blob = await canvas.toBlob('image/webp', 0.85);
```

### Caching Strategy
- **Static data**: Cache kit_types, sample_types, categories (revalidate: 3600s)
- **Dynamic data**: No cache for samples/results (always fresh)
- **Images**: CDN cache (R2 public URLs with `Cache-Control: max-age=31536000`)

## Testing Approach (Future)

### Unit Tests (Vitest)
- Zod schemas validation
- Utility functions (date formatting, code generation)

### Integration Tests (Playwright)
- Login flow (editor vs viewer)
- Sample creation (assign next kit)
- Image upload (presigned URL flow)

### E2E Smoke Tests
- Load `/lab-records` grid
- Create sample + upload 1 image
- Export CSV

## Deployment Checklist

### Environment Variables
```bash
# .env.local
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=lab-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Database Setup
1. Run migration SQL (see spec document)
2. Seed initial data:
   - kit_types (10 rows)
   - sample_types (5 rows)
   - users (admin editor account)
3. Create Postgres indexes (see spec)

### Vercel Configuration
```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database-url",
    "R2_BUCKET_NAME": "@r2-bucket"
  }
}
```

## Common Pitfalls to Avoid

### ❌ Don't
- Use `localStorage` or `sessionStorage` (not supported in artifacts)
- Hardcode user IDs (always get from session)
- Skip RBAC checks in API routes
- Upload images >5MB (frontend must validate)
- Create >100 kits in single batch (UI must prevent)
- Forget to update `kits.status='used'` when creating sample

### ✅ Do
- Validate all inputs (client + server)
- Use transactions for multi-table writes
- Log all mutations to `audit_logs`
- Handle Postgres errors gracefully (unique violations, FK errors)
- Show loading states during async operations
- Use optimistic UI updates (then revalidate)

## Code Style Conventions

### File Structure
```
app/
  (auth)/
    login/page.tsx
  (dashboard)/
    lab-records/page.tsx
    samples/[id]/page.tsx
  api/
    samples/route.ts
    samples/[id]/route.ts
lib/
  db.ts          # Supabase client
  auth.ts        # NextAuth config
  schemas.ts     # Zod schemas
components/
  ui/            # shadcn/ui components
  forms/
  tables/
```

### Naming Conventions
- **API routes**: Lowercase with hyphens (`/api/lab-records`)
- **Components**: PascalCase (`SampleForm.tsx`)
- **Utilities**: camelCase (`formatSampleCode.ts`)
- **Database**: snake_case (`sample_results`, `kit_batches`)

### Import Order
```typescript
// 1. React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { z } from 'zod';
import * as echarts from 'echarts';

// 3. Internal
import { supabase } from '@/lib/db';
import { SampleForm } from '@/components/forms/SampleForm';

// 4. Types
import type { Sample, Kit } from '@/types';
```

## MVP Scope Reminders

### In Scope (Must Deliver)
- Kit inventory management (bulk create ≤100, adjust stock)
- Sample CRUD with 20-30 fields + 10-15 metrics + up to 10 images
- Unified grid (`v_lab_records`) with filter/sort/search
- Basic pivot/charts (revenue by month, tests by type)
- RBAC (editor/viewer)
- Mobile-responsive forms
- RLS at database level

### Out of Scope (Post-MVP)
- Multi-level approval workflows
- SSO/LDAP integration
- Automated equipment integration (LIMS)
- PDF report generation
- Real-time collaboration (comments/mentions)

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Database migration
psql $DATABASE_URL < migration.sql

# Type check
npm run type-check

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Next.js App Router**: https://nextjs.org/docs/app
- **Auth.js**: https://authjs.dev/reference/nextjs
- **TanStack Table**: https://tanstack.com/table/v8
- **ECharts**: https://echarts.apache.org/en/option.html

---

**Last Updated**: 2025-10-13  
**Spec Version**: 0.1.0  
**Target MVP**: 4-6 weeks