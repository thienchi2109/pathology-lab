# Design Document

## Overview

The Lab Sample Management System is a Next.js-based web application that provides comprehensive laboratory sample tracking with a kit-first inventory approach. The system combines kit inventory management with sample data entry, test results recording, image documentation, and analytical reporting capabilities.

### Key Design Principles

1. **Kit-First Architecture**: Kits are managed as inventory items; samples are created by linking to kits
2. **Unified View**: Single interface combining kit inventory and sample data (mimicking Data_Kit spreadsheet)
3. **Mobile-First Responsive**: Optimized for both desktop and mobile workflows
4. **Progressive Web App**: Offline-capable dashboard with read-only caching
5. **Security by Default**: Supabase RLS + application-layer RBAC enforcement
6. **Scalable Data Model**: Normalized schema with denormalized views for performance

## Architecture

### Technology Stack

**Frontend**
- Next.js 14+ (App Router) - React framework with server components
- TypeScript - Type safety
- TanStack Table v8 - Data grid UI (server-side data)
- ECharts - Interactive charting library
- DuckDB-WASM - Client-side SQL for complex pivot operations
- Tailwind CSS - Utility-first styling with custom pastel theme
- shadcn/ui - Component library (customized with pastel colors)
- React Hook Form + Zod - Form management and validation

**Backend**
- Next.js API Routes - Serverless API endpoints
- Supabase Postgres - Primary database
- Supabase Auth - Authentication and session management
- Supabase RLS - Row-level security policies

**Storage**
- Cloudflare R2 - S3-compatible object storage for images

**Deployment**
- Vercel - Next.js hosting with edge functions
- Supabase Cloud - Managed Postgres and Auth

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │  TanStack    │  │   ECharts    │      │
│  │     UI       │  │    Table     │  │   DuckDB     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
└─────────┼─────────────────┼──────────────────┼───────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Components                        │   │
│  │  - Page rendering with Supabase data                 │   │
│  │  - Server actions for mutations                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (/api/*)                      │   │
│  │  - /api/samples, /api/kits, /api/uploads            │   │
│  │  - /api/analytics/pivot                              │   │
│  │  - Supabase client with RLS                          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────┬──────────────────────────────┬──────────────────┘
            │                              │
            ▼                              ▼
┌──────────────────────┐        ┌──────────────────────┐
│  Supabase Postgres   │        │   Cloudflare R2      │
│  - Tables & Views    │        │   - Sample Images    │
│  - RLS Policies      │        │   - Presigned URLs   │
│  - Triggers          │        │   (max 10/sample)    │
└──────────────────────┘        └──────────────────────┘
```

### Authentication Flow

```
User → Next.js Login Page → Supabase Auth
                                 ↓
                          Session Created
                                 ↓
                    Cookie Set (httpOnly, secure)
                                 ↓
              Middleware validates session on each request
                                 ↓
                    Server Component/API Route
                                 ↓
              Supabase Client (with session)
                                 ↓
                    RLS Policies Applied
```

## Components and Interfaces

### Frontend Components

#### 1. Layout Components
- **AppShell**: Main application layout with navigation, header, and content area
- **Sidebar**: Desktop navigation menu (≥1024px) with role-based visibility
- **Header**: Slightly transparent sticky header with user profile, notifications, and global actions
  - Background: rgba(255, 255, 255, 0.95) with backdrop-blur
  - Sticky positioning with smooth shadow on scroll
- **MobileNav**: Bottom navigation bar for mobile/tablet (<1024px)
  - Fixed position at bottom
  - Icons with labels
  - Active state with pastel color highlight

#### 2. Data Grid Components
- **LabRecordsGrid**: Main unified grid displaying kits and samples
  - Uses TanStack Table for UI rendering
  - Server-side filtering, sorting, and pagination
  - Column visibility controls
  - Filter panel with multiple criteria (applied server-side)
  - Sort by any column (applied server-side)
  - Pagination controls
  - Export to Excel/CSV button

#### 3. Form Components
- **SampleForm**: Multi-section form for sample creation/editing
  - Kit selection (auto-assign or manual)
  - Metadata section (20-30 fields)
  - Results section (10-15 metrics)
  - Image upload section (up to 10 images)
  - Autosave draft functionality
  - Validation with real-time feedback

- **KitBatchForm**: Form for creating kit batches
  - Batch information
  - Bulk quantity input (max 100)
  - Validation for quantity limits

#### 4. Dashboard Components

**Design Philosophy: Clean, Tidy, Intuitive with Rich Data Visualization**

- **DashboardLayout**: Container for dashboard widgets
  - Grid-based responsive layout
  - Card-based widgets with consistent spacing
  - Drag-and-drop widget reordering (optional)
  - Clean white cards with subtle shadows
  - Generous whitespace between widgets

- **RevenueChart**: Line/bar chart showing revenue over time
  - ECharts with pastel color scheme
  - Smooth animations
  - Interactive tooltips with detailed data
  - Time range selector (day/week/month/year)
  - Trend indicators with percentage change

- **SampleDistributionChart**: Donut chart by customer/type
  - Pastel color palette for segments
  - Center displays total count
  - Interactive legend with toggle
  - Hover effects with data labels
  - Clean, minimal design

- **KitInventoryWidget**: Current stock levels by status
  - Horizontal bar chart or stacked progress bars
  - Color-coded by status (pastel colors)
  - Quick stats: total, in_stock, used, expired
  - Alert indicators for low stock
  - Click to filter main grid

- **TestResultsHeatmap**: Heatmap of test results by metric
  - Gradient from light to dark pastel colors
  - Clear axis labels
  - Tooltip with exact values
  - Responsive cell sizing
  - Legend with value ranges

- **PivotTable**: Interactive pivot table with drag-drop dimensions
  - Clean table design with alternating row colors (very subtle)
  - Drag-drop interface for rows/columns
  - Aggregation options (sum/avg/count/min/max)
  - Export to Excel/CSV
  - Collapsible groups
  - Inline charts (sparklines) for trends

- **MetricCards**: Key performance indicators
  - Large numbers with trend indicators
  - Icon with pastel background
  - Comparison to previous period
  - Minimal, focused design

- **QuickFilters**: Dashboard-level filters
  - Date range picker
  - Customer/type selectors
  - Status filters
  - Apply to all widgets simultaneously
  - Clear visual indication of active filters

#### 5. Image Components
- **ImageUploader**: Drag-drop or click to upload with preview
- **ImageGallery**: Grid display of sample images with lightbox
- **ImagePreview**: Full-size image viewer with metadata

### API Endpoints

#### Authentication & User

```typescript
GET  /api/me                    // Get current user with role
POST /api/auth/callback         // Supabase auth callback
```

#### Dictionary/Catalog Endpoints
```typescript
GET /api/dicts/kit-types        // List all kit types
GET /api/dicts/sample-types     // List all sample types
GET /api/dicts/companies?query  // Search companies
GET /api/dicts/customers?query  // Search customers
GET /api/dicts/categories       // List categories
GET /api/dicts/costs            // List cost catalog
```

#### Kit Management Endpoints
```typescript
POST /api/kits/bulk-create      // Create kit batch (max 100)
POST /api/kits/bulk-adjust      // Adjust stock levels
GET  /api/kits/availability     // Get stock by status and type
```

#### Sample Management Endpoints
```typescript
GET  /api/samples/next-code?receivedAt  // Get next sample code
POST /api/samples                       // Create sample
GET  /api/samples/:id                   // Get sample detail
PATCH /api/samples/:id                  // Update sample metadata
PATCH /api/samples/:id/results          // Update sample results
GET  /api/samples/:id/report-message    // Generate report message
```

#### Image Management Endpoints
```typescript
POST /api/uploads/presign               // Get presigned URL for R2
POST /api/samples/:id/images/attach     // Attach uploaded image
```

#### Lab Records Endpoints
```typescript
GET /api/lab-records?query&kitTypeId&status&dateFrom&dateTo&page&pageSize
// Query unified view with server-side filters and pagination
// All filtering, sorting, and pagination handled on server
```

#### Analytics Endpoints
```typescript
POST /api/analytics/pivot       // Server-side pivot aggregation
GET  /api/analytics/dashboard   // Pre-configured dashboard data
```

#### Export Endpoints
```typescript
POST /api/export/excel          // Export grid or pivot to Excel
POST /api/export/csv            // Export grid or pivot to CSV
```

### Type Definitions

```typescript
// Core domain types
type KitStatus = 'in_stock' | 'assigned' | 'used' | 'void' | 'expired' | 'lost';
type SampleStatus = 'draft' | 'done' | 'approved';
type BillingStatus = 'unpaid' | 'invoiced' | 'paid' | 'eom_credit';
type UserRole = 'editor' | 'viewer';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

interface KitBatch {
  id: string;
  batch_code: string;
  kit_type: string;
  supplier: string;
  purchased_at: string;
  unit_cost: number;
  quantity: number;
  expires_at?: string;
}

interface Kit {
  id: string;
  batch_id: string;
  kit_code: string;
  status: KitStatus;
  assigned_at?: string;
  tested_at?: string;
  note?: string;
}

interface Sample {
  id: string;
  kit_id: string;
  sample_code: string;
  customer: string;
  sample_type: string;
  received_at: string;
  collected_at?: string;
  technician: string;
  price: number;
  status: SampleStatus;
  billing_status: BillingStatus;
  invoice_month?: string;
  category_id: string;
  company_snapshot: CompanySnapshot;
  customer_snapshot: CustomerSnapshot;
  sl_mau: number;
  note?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface SampleResult {
  id: string;
  sample_id: string;
  metric_code: string;
  metric_name: string;
  value_num?: number;
  value_text?: string;
  unit: string;
  ref_low?: number;
  ref_high?: number;
}

interface SampleImage {
  id: string;
  sample_id: string;
  r2_key: string;
  url: string;
  width: number;
  height: number;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
}

interface LabRecord {
  record_id: string;
  batch_code: string;
  kit_code: string;
  kit_status: KitStatus;
  assigned_at?: string;
  tested_at?: string;
  sample_id?: string;
  sample_code?: string;
  customer?: string;
  sample_type?: string;
  received_at?: string;
  technician?: string;
  price?: number;
  sample_status?: SampleStatus;
  billing_status?: BillingStatus;
  invoice_month?: string;
  // Result metrics
  kq_wssv?: number;
  kq_ehp?: number;
  kq_ems?: number;
  kq_tpd?: number;
  kq_khuan?: number;
  kq_mbv?: number;
  kq_div1?: number;
  kq_dang_khac?: number;
  kq_vi_khuan_vi_nam?: number;
  kq_tam_soat?: number;
  cl_gan?: number;
  kq_chung?: 'NHIỄM' | 'SẠCH';
}
```

## Data Models

### Database Schema

The database uses PostgreSQL with the following normalized structure:

#### Core Tables

**users**
- Primary authentication and authorization table
- Synced with Supabase Auth
- Stores role for RBAC

**kit_batches**
- Tracks kit purchases by batch
- Links to kit_types catalog
- Records cost and expiration

**kits**
- Individual kit inventory items
- Links to kit_batches
- Tracks status lifecycle

**samples**
- Core sample records
- 1:1 relationship with kits
- Stores metadata and snapshots

**sample_results**
- Normalized test results
- Multiple rows per sample
- Supports numeric and text values

**sample_images**
- Image metadata and R2 references
- Max 10 per sample
- Tracks uploader and size

**audit_logs**
- Immutable audit trail
- Records all CRUD operations
- Stores diff for updates

#### Catalog Tables

- kit_types
- sample_types
- companies
- customers
- categories
- cost_catalog
- settings

#### Views

**v_sample_results_wide**
- Pivots sample_results into wide format
- One row per sample with all metrics as columns
- Used for reporting and KQ_CHUNG calculation

**v_kq_chung**
- Calculates overall result status
- 'NHIỄM' if any metric > 0, else 'SẠCH'

**v_lab_records**
- Unified view joining kits, samples, results
- Primary data source for main grid
- Includes all metrics and KQ_CHUNG

### Database Triggers

**trg_touch_updated_at**
- Automatically updates samples.updated_at on modification

**trg_sample_kit_used**
- When sample links to kit, sets kit.status='used' and kit.tested_at

### Sample Code Generation

Uses PostgreSQL sequence `sample_code_seq` with function:

```sql
CREATE FUNCTION next_sample_code(received date) RETURNS text
```

Format: `T<MM>_<#####>` where MM is month from received_at

### RLS Policies

**Editor Policies**
- SELECT: All tables
- INSERT: kits, samples, sample_results, sample_images
- UPDATE: kits, samples, sample_results
- DELETE: sample_images (own uploads only)

**Viewer Policies**
- SELECT: All tables except audit_logs
- No INSERT, UPDATE, DELETE

**Policy Implementation**
```sql
-- Example for samples table
CREATE POLICY "Editors can insert samples"
  ON samples FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'editor'
    )
  );

CREATE POLICY "Viewers can read samples"
  ON samples FOR SELECT
  TO authenticated
  USING (true);
```

## Error Handling

### Error Response Format

All API errors follow consistent structure:

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
}
```

### Standard Error Codes

**400 Bad Request**
- Invalid input data
- Validation failures
- Message: Specific validation error

**401 Unauthorized**
- Missing or invalid session
- Message: "Vui lòng đăng nhập"

**403 Forbidden**
- Insufficient permissions
- Message: "Bạn không có quyền thực hiện thao tác này"

**404 Not Found**
- Resource doesn't exist
- Message: "Không tìm thấy <resource>"

**409 Conflict**
- Business rule violation
- Messages:
  - "Không còn kit <Loai_kit>"
  - "Chuyển quá số lượng tồn kho"
  - "Mẫu đã có đủ 10 ảnh"

**422 Unprocessable Entity**
- Semantic errors
- Message: "Số lượng quá lớn" (quantity > 100)

**500 Internal Server Error**
- Unexpected server errors
- Message: "Đã xảy ra lỗi, vui lòng thử lại"

### Client-Side Error Handling

```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  // Catches rendering errors
  // Displays user-friendly message
  // Logs to monitoring service
}

// API error handler
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error.message, response.status);
    }
    return response.json();
  } catch (error) {
    // Log to monitoring
    // Show toast notification
    throw error;
  }
}
```

### Retry Strategy

- 5xx errors: Retry up to 2 times with exponential backoff (500ms, 2s)
- 4xx errors: No retry, show error to user
- Network errors: Retry once after 1s

## Testing Strategy

### Unit Testing

**Framework**: Vitest

**Coverage Targets**
- Utility functions: 90%
- Business logic: 85%
- Components: 70%

**Key Areas**
- Sample code generation logic
- KQ_CHUNG calculation
- Form validation rules
- Data transformation utilities
- RLS policy helpers

**Example Test**
```typescript
describe('next_sample_code', () => {
  it('generates correct format for January', () => {
    const code = generateSampleCode(new Date('2024-01-15'), 42);
    expect(code).toBe('T01_00042');
  });
});
```

### Integration Testing

**Framework**: Playwright

**Test Scenarios**
1. Complete sample creation flow
   - Login as editor
   - Create kit batch
   - Create sample with auto-assign
   - Upload images
   - Enter results
   - Verify KQ_CHUNG calculation

2. Grid operations
   - Filter by multiple criteria
   - Sort columns
   - Export to Excel
   - Pagination

3. Dashboard interactions
   - Create pivot table
   - Generate charts
   - Apply filters

4. Role-based access
   - Viewer cannot edit
   - Editor can perform all operations

### API Testing

**Framework**: Supertest or Playwright API testing

**Test Coverage**
- All endpoints with valid inputs
- Error cases (400, 401, 403, 404, 409, 422)
- Rate limiting
- Concurrent requests

### Performance Testing

**Tools**: Lighthouse, k6

**Metrics**
- Page load: < 2s
- API response: < 500ms (p95)
- Grid rendering: < 1s for 100 rows
- Image upload: < 5s for 5MB

**Load Testing**
- 10 concurrent users
- 100 requests/minute sustained
- Database connection pooling

### Security Testing

**Checklist**
- [ ] RLS policies prevent unauthorized access
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS prevention (React escaping + CSP headers)
- [ ] CSRF protection (SameSite cookies)
- [ ] Presigned URL expiration (15 minutes)
- [ ] File upload validation (type, size)
- [ ] Rate limiting on sensitive endpoints

## Implementation Notes

### Progressive Web App (PWA) (deferred for MVP)

**Service Worker Strategy**
- Cache dashboard data for offline viewing
- Network-first for API calls
- Cache-first for static assets
- Background sync for draft autosave

**Manifest Configuration**
```json
{
  "name": "Lab Sample Management",
  "short_name": "LabSample",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#93C5FD",
  "background_color": "#FAFAFA",
  "icons": [...]
}
```

### Design System

**Theme: Clean, Modern, Elegant with Pastel Colors**

**Color Palette**
- Primary: Soft Blue (#93C5FD - blue-300)
- Secondary: Lavender (#C4B5FD - purple-300)
- Success: Mint Green (#86EFAC - green-300)
- Warning: Peach (#FED7AA - orange-300)
- Error: Soft Rose (#FCA5A5 - red-300)
- Background: Off-white (#FAFAFA - gray-50)
- Surface: White (#FFFFFF)
- Text Primary: Charcoal (#1F2937 - gray-800)
- Text Secondary: Slate (#6B7280 - gray-500)

**Typography**
- Font Family: Inter (sans-serif)
- Headings: 600 weight
- Body: 400 weight
- Small text: 14px
- Body text: 16px
- Headings: 20px, 24px, 32px

**Spacing**
- Base unit: 4px
- Component padding: 16px, 24px
- Section margins: 32px, 48px

**Components Style**
- Rounded corners: 8px (buttons, cards), 12px (modals)
- Subtle shadows: 0 1px 3px rgba(0,0,0,0.1)
- Soft borders: 1px solid with pastel colors
- Hover states: Slightly darker pastel shade
- Focus rings: 2px pastel blue outline
- Sticky header: Slightly transparent (90% opacity) with backdrop-blur-sm
- Bottom nav (mobile): Solid background with subtle top border

**Layout**
- Maximum content width: 1400px
- Grid: 12-column responsive
- Whitespace: Generous padding and margins
- Card-based design for data sections
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1280px (bottom nav)
  - Desktop: ≥ 1280px (header nav)
- Bottom navigation height: 64px (mobile/table, slightly transparent)
- Header height: 64px (sticky, slightly transparent)

### Mobile Optimizations

- Touch targets minimum 44x44px
- Swipe gestures for navigation
- Bottom sheet for filters on mobile
- List view on mobile/tablet with key information
- Camera integration for image capture
- Responsive tables with horizontal scroll (maybe convert into list view)
- Sticky headers and footer for long forms
- Pastel color scheme optimized for readability on mobile screens

### Performance Optimizations

**Database**
- Indexes on frequently queried columns
- Materialized views for complex aggregations (if needed)
- Connection pooling (Supabase handles this)
- Query result caching (React Query)

**Frontend**
- Code splitting by route
- Image lazy loading
- Virtual scrolling for large grids (TanStack Table)
- Debounced search inputs
- Optimistic UI updates

**Caching Strategy**
- React Query for server state
- Cache time: 5 minutes for reference data
- Stale time: 1 minute for dynamic data
- Invalidation on mutations

### Deployment Configuration

**Vercel**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "R2_ACCOUNT_ID": "@r2-account-id",
    "R2_ACCESS_KEY_ID": "@r2-access-key",
    "R2_SECRET_ACCESS_KEY": "@r2-secret-key",
    "R2_BUCKET_NAME": "@r2-bucket-name"
  }
}
```

**Supabase**
- Enable RLS on all tables
- Configure auth providers
- Set up database backups (daily)
- Enable connection pooling

**Cloudflare R2**
- Create bucket with private access
- Configure CORS for presigned URLs
- Set lifecycle policy for orphaned images (delete after 7 days if not attached)

### Monitoring and Observability

**Logging**
- Vercel logs for application errors
- Supabase logs for database queries
- Custom audit_logs table for business events

**Metrics**
- Vercel Analytics for page views and performance
- Supabase dashboard for database metrics
- Custom dashboard for business metrics (samples/day, revenue, etc.)

**Alerts**
- Error rate > 5%
- API response time > 2s
- Database connection pool exhaustion
- Failed image uploads

This design provides a solid foundation for implementing the Lab Sample Management System with all required features while maintaining security, performance, and user experience standards.
