# Project Structure

## Directory Organization

```
.
├── .kiro/                      # Kiro configuration
│   ├── specs/                  # Specification documents
│   │   └── lab-sample-management/
│   │       ├── requirements.md # Detailed requirements
│   │       ├── design.md       # System design
│   │       └── tasks.md        # Implementation tasks
│   └── steering/               # AI assistant guidance
├── docs/                       # Additional documentation
└── [to be created]
    ├── app/                    # Next.js App Router
    │   ├── (auth)/            # Authentication routes
    │   ├── (dashboard)/       # Protected dashboard routes
    │   ├── api/               # API routes
    │   └── layout.tsx         # Root layout
    ├── components/            # React components
    │   ├── ui/               # shadcn/ui components
    │   ├── forms/            # Form components
    │   ├── grid/             # Data grid components
    │   └── dashboard/        # Dashboard widgets
    ├── lib/                   # Utilities and helpers
    │   ├── supabase/         # Supabase client utilities
    │   ├── r2/               # Cloudflare R2 utilities
    │   └── utils.ts          # General utilities
    ├── types/                 # TypeScript type definitions
    └── public/               # Static assets
```

## Key Architectural Patterns

### Database Schema

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

### API Route Organization

```
/api/
├── me                          # Current user info
├── auth/callback              # Supabase auth callback
├── dicts/                     # Dictionary/catalog endpoints
│   ├── kit-types
│   ├── sample-types
│   ├── companies
│   ├── customers
│   ├── categories
│   └── costs
├── kits/                      # Kit management
│   ├── bulk-create
│   ├── bulk-adjust
│   └── availability
├── samples/                   # Sample management
│   ├── next-code
│   ├── [id]
│   ├── [id]/results
│   └── [id]/report-message
├── uploads/                   # Image upload
│   └── presign
├── lab-records                # Unified grid data
├── analytics/                 # Analytics & reporting
│   ├── pivot
│   └── dashboard
└── export/                    # Data export
    ├── excel
    └── csv
```

### Component Organization

**Layout Components**:
- `AppShell` - Main application layout
- `Header` - Sticky header with transparency
- `Sidebar` - Desktop navigation (≥1024px)
- `MobileNav` - Bottom navigation (<1024px)

**Data Components**:
- `LabRecordsGrid` - Main unified grid (TanStack Table)
- `SampleForm` - Multi-section sample entry form
- `KitBatchForm` - Kit batch creation form
- `ImageUploader` - Drag-drop image upload
- `ImageGallery` - Image display with lightbox

**Dashboard Components**:
- `DashboardLayout` - Grid-based widget container
- `MetricCards` - KPI cards
- `RevenueChart` - Line/bar chart (ECharts)
- `SampleDistributionChart` - Donut chart
- `KitInventoryWidget` - Horizontal bar chart
- `TestResultsHeatmap` - Heatmap visualization
- `PivotTable` - Interactive pivot with drag-drop

## Naming Conventions

### Files
- React components: PascalCase (e.g., `SampleForm.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- API routes: kebab-case (e.g., `next-code.ts`)

### Database
- Tables: snake_case plural (e.g., `sample_results`)
- Columns: snake_case (e.g., `created_at`)
- Views: prefix with `v_` (e.g., `v_lab_records`)
- Functions: snake_case (e.g., `next_sample_code`)

### TypeScript
- Interfaces: PascalCase (e.g., `Sample`, `KitBatch`)
- Types: PascalCase (e.g., `KitStatus`, `UserRole`)
- Enums: PascalCase with UPPER_CASE values

## Code Organization Principles

1. **Server-side data operations**: All filtering, sorting, pagination handled in API routes
2. **Client-side rendering**: TanStack Table for UI, DuckDB-WASM for complex client-side queries
3. **Type safety**: Strict TypeScript with Zod validation
4. **Error handling**: Consistent error format with Vietnamese messages
5. **Security**: RBAC at application layer, RLS enabled in database
6. **Performance**: React Query for caching, virtual scrolling for large datasets
