# Technology Stack

## Frontend
- **Framework**: Next.js 15+ with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with custom pastel color theme
- **UI Components**: shadcn/ui (customized with pastel colors)
- **Data Grid**: TanStack Table v8 for server-side data rendering
- **Charts**: ECharts for interactive visualizations
- **Forms**: React Hook Form + Zod for validation
- **Client-side SQL**: DuckDB-WASM for complex pivot operations (planned)
- **PWA**: Progressive Web App with offline dashboard caching (planned)

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

## Key Dependencies
```json
{
  "next": "^15.5.4",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "^5.9.3",
  "@supabase/supabase-js": "^2.75.0",
  "@supabase/ssr": "^0.7.0",
  "@aws-sdk/client-s3": "^3.908.0",
  "tailwindcss": "^4.1.14",
  "@tailwindcss/postcss": "^4.1.14"
}
```

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
