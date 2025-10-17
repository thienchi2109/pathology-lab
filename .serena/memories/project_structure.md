# Project Structure

## Directory Organization

```
.
├── app/                        # Next.js App Router
│   ├── auth/                  # Authentication routes
│   │   └── callback/          # Supabase auth callback
│   ├── login/                 # Login page
│   ├── api/                   # API routes (to be created)
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with AuthProvider
│   └── page.tsx               # Home page
├── components/                # React components
│   ├── auth/                  # Auth components
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleGuard.tsx
│   │   └── SignOutButton.tsx
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── forms/                 # Form components (to be created)
│   ├── grid/                  # Data grid components (to be created)
│   └── dashboard/             # Dashboard widgets (to be created)
├── lib/                       # Utilities and helpers
│   ├── auth/                  # Auth utilities
│   │   ├── context.tsx        # AuthProvider and useAuth
│   │   ├── hooks.ts           # Role-based hooks
│   │   └── roles.ts           # Server-side role validation
│   ├── supabase/              # Supabase client utilities
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── middleware.ts      # Session validation
│   ├── r2/                    # Cloudflare R2 utilities
│   │   └── client.ts          # R2 client
│   └── utils.ts               # General utilities (cn helper)
├── types/                     # TypeScript type definitions
│   └── index.ts               # Shared types
├── docs/                      # Documentation
│   ├── AUTHENTICATION.md      # Auth documentation
│   └── TASK_3_SUMMARY.md      # Task 3 completion summary
├── .kiro/                     # Kiro configuration
│   ├── specs/                 # Specification documents
│   │   └── lab-sample-management/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/              # AI assistant guidance
│       ├── rules.md
│       ├── tech.md
│       ├── structure.md
│       └── product.md
├── middleware.ts              # Next.js middleware for auth
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
├── next.config.ts             # Next.js config
└── .env.local                 # Environment variables
```

## Key Architectural Patterns

### Database Schema (Supabase)
**Core Tables**:
- `users` - User accounts with role (editor/viewer)
- `kit_batches` - Kit purchase batches
- `kits` - Individual kit inventory items
- `samples` - Sample records (1:1 with kits)
- `sample_results` - Test result metrics (normalized)
- `sample_images` - Image metadata and R2 references
- `audit_logs` - Audit trail for all operations

**Catalog Tables**:
- `kit_types`, `sample_types`, `companies`, `customers`, `categories`, `cost_catalog`, `settings`

**Views**:
- `v_sample_results_wide` - Pivoted results (one row per sample)
- `v_kq_chung` - Calculated overall result status
- `v_lab_records` - Unified view joining kits and samples (primary data source for UI grid)

### API Route Organization (Planned)
```
/api/
├── me                          # Current user info
├── auth/callback              # Supabase auth callback
├── dicts/                     # Dictionary/catalog endpoints
├── kits/                      # Kit management
├── samples/                   # Sample management
├── uploads/                   # Image upload
├── lab-records                # Unified grid data
├── analytics/                 # Analytics & reporting
└── export/                    # Data export
```

### Component Organization
**Layout Components** (to be created):
- `AppShell` - Main application layout
- `Header` - Sticky header with transparency
- `Sidebar` - Desktop navigation (≥1024px)
- `MobileNav` - Bottom navigation (<1024px)

**Data Components** (to be created):
- `LabRecordsGrid` - Main unified grid (TanStack Table)
- `SampleForm` - Multi-section sample entry form
- `KitBatchForm` - Kit batch creation form
- `ImageUploader` - Drag-drop image upload
- `ImageGallery` - Image display with lightbox

**Dashboard Components** (to be created):
- `DashboardLayout` - Grid-based widget container
- `MetricCards` - KPI cards
- `RevenueChart` - Line/bar chart (ECharts)
- Various analytics widgets
