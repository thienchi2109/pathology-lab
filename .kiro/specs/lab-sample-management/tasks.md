# Implementation Plan

- [x] 1. Project setup and configuration: use Context7 MCP for the up-to-date code snippets

  - Initialize Next.js 15+ project with TypeScript and App Router
  - Configure Tailwind CSS with custom pastel color theme
  - Install and configure shadcn/ui components
  - Set up Supabase client and environment variables
  - Configure Cloudflare R2 SDK for image storage
  - Set up ESLint, Prettier, and TypeScript strict mode
  - Create project folder structure (app, components, lib, types)
  - _Requirements: 16_

- [x] 2. Database schema and migrations: use Supabase MCP tools


  - [x] 2.1 Create core tables in Supabase
    - Create users table with role field
    - Create kit_batches, kits tables with relationships
    - Create samples table with kit_id foreign key
    - Create sample_results, sample_images tables
    - Create audit_logs table
    - Create catalog tables (kit_types, sample_types, companies, customers, categories, cost_catalog, settings)
    - Add indexes on frequently queried columns
    - _Requirements: 1, 2, 3, 4, 11, 15_
  - [x] 2.2 Create database views
    - Create v_sample_results_wide view for pivoted results
    - Create v_kq_chung view for calculated overall status
    - Create v_lab_records unified view joining kits and samples
    - _Requirements: 5, 3_
  - [x] 2.3 Create database functions and triggers

    - Create sample_code_seq sequence
    - Create next_sample_code() function for code generation
    - Create trg_touch_updated_at trigger for samples
    - Create trg_sample_kit_used trigger to update kit status
    - _Requirements: 2, 13_

  - [x] 2.4 Configure RLS policies

    - Enable RLS on all tables
    - Create editor policies (SELECT, INSERT, UPDATE on relevant tables)
    - Create viewer policies (SELECT only)
    - Test policies with different user roles
    - _Requirements: 9_

- [x] 3. Authentication setup




  - [x] 3.1 Configure Supabase Auth


    - Enable email/password authentication in Supabase
    - Configure OAuth providers (optional)
    - Set up auth callback route in Next.js
    - _Requirements: 10_



  - [x] 3.2 Create auth utilities and middleware

    - Create Supabase client utilities (server, client, middleware)
    - Create middleware to validate session on protected routes
    - Create auth context/hooks for client components

    - Create role-checking utilities
    - _Requirements: 10, 9_

  - [x] 3.3 Build authentication UI

    - Create login page with Supabase Auth UI
    - Create sign-out functionality
    - Create protected route wrapper component
    - Add role-based UI element visibility
    - _Requirements: 10_

- [ ] 4. Design system and layout components
  - [ ] 4.1 Configure Tailwind theme
    - Extend Tailwind config with pastel color palette
    - Configure typography settings (Inter font)
    - Set up custom spacing and border radius
    - Add backdrop-blur utilities
    - _Requirements: 12_

  - [ ] 4.2 Create layout components
    - Create AppShell with responsive layout
    - Create sticky Header with transparency and backdrop-blur
    - Create sticky Header navigation bar for desktop (≥1024px)
    - Create MobileNav bottom navigation (<1024px)
    - Add role-based navigation items
    - _Requirements: 12_

  - [ ] 4.3 Customize shadcn/ui components: glassmorphism design language
    - Install base shadcn/ui components (button, card, input, select, etc.)
    - Customize component styles with pastel colors
    - Create reusable form components: off-canvas sheet that slides from the right side
    - Create loading and error state components
    - _Requirements: 12_

- [ ] 5. API routes for dictionaries and catalogs
  - [ ] 5.1 Create dictionary endpoints
    - Implement GET /api/dicts/kit-types
    - Implement GET /api/dicts/sample-types
    - Implement GET /api/dicts/companies with search
    - Implement GET /api/dicts/customers with search
    - Implement GET /api/dicts/categories
    - Implement GET /api/dicts/costs
    - Add server-side caching for reference data
    - _Requirements: 15_

  - [ ]* 5.2 Write API tests for dictionary endpoints
    - Test successful responses
    - Test search functionality
    - Test error cases
    - _Requirements: 15_

- [ ] 6. Kit inventory management
  - [ ] 6.1 Create kit management API routes
    - Implement POST /api/kits/bulk-create with quantity validation (≤100)
    - Implement POST /api/kits/bulk-adjust with stock validation
    - Implement GET /api/kits/availability
    - Add error handling for business rules (422, 409 errors)
    - _Requirements: 1_

  - [ ] 6.2 Build kit batch creation form
    - Create KitBatchForm component with validation
    - Add quantity input with max 100 validation
    - Add batch information fields
    - Implement form submission with error handling
    - Show success/error messages
    - _Requirements: 1, 6_

  - [ ]* 6.3 Write tests for kit management
    - Test bulk create with valid/invalid quantities
    - Test stock adjustment logic
    - Test availability queries
    - _Requirements: 1_

- [ ] 7. Sample management API
  - [ ] 7.1 Create sample CRUD endpoints
    - Implement GET /api/samples/next-code with date parameter
    - Implement POST /api/samples with auto-assign logic
    - Implement GET /api/samples/:id
    - Implement PATCH /api/samples/:id for metadata updates
    - Implement PATCH /api/samples/:id/results for test results
    - Add validation for all inputs
    - _Requirements: 2, 3_

  - [ ] 7.2 Implement sample code generation
    - Use next_sample_code() database function
    - Format as T<MM>_<#####>
    - Handle sequence generation
    - _Requirements: 2_

  - [ ] 7.3 Implement KQ_CHUNG calculation
    - Create GET /api/samples/:id/report-message endpoint
    - Calculate overall status from results
    - Generate formatted message with severity levels
    - _Requirements: 3_

  - [ ]* 7.4 Write tests for sample management
    - Test sample creation with auto-assign
    - Test sample code generation
    - Test KQ_CHUNG calculation logic
    - Test update operations
    - _Requirements: 2, 3_

- [ ] 8. Image upload functionality
  - [ ] 8.1 Configure Cloudflare R2
    - Set up R2 bucket with private access
    - Configure CORS for presigned URLs
    - Create R2 client utility
    - _Requirements: 4_

  - [ ] 8.2 Create image upload API routes
    - Implement POST /api/uploads/presign with size/type validation
    - Implement POST /api/samples/:id/images/attach
    - Add validation for max 10 images per sample
    - Generate presigned URLs with 15-minute expiration
    - _Requirements: 4_

  - [ ] 8.3 Build image upload UI component
    - Create ImageUploader with drag-drop
    - Add file type and size validation (≤5MB)
    - Show upload progress
    - Display preview thumbnails
    - Integrate camera capture for mobile
    - _Requirements: 4, 6, 12_

  - [ ] 8.4 Create image gallery component
    - Build ImageGallery grid display
    - Add lightbox for full-size viewing
    - Show image metadata
    - Allow deletion (editors only)
    - _Requirements: 4_

  - [ ]* 8.5 Write tests for image upload
    - Test presigned URL generation
    - Test file validation
    - Test max 10 images limit
    - _Requirements: 4_

- [ ] 9. Sample data entry form
  - [ ] 9.1 Build multi-section sample form
    - Create SampleForm with kit selection section
    - Add metadata section with 20-30 fields
    - Add results section with 10-15 metrics
    - Add image upload section
    - Organize fields in logical groups
    - _Requirements: 2, 3, 4, 6_

  - [ ] 9.2 Implement form validation
    - Add Zod schema for all fields
    - Implement real-time validation with React Hook Form
    - Show clear error messages
    - Validate required fields and data types
    - _Requirements: 6_

  - [ ] 9.3 Add autosave functionality
    - Implement draft autosave every 30 seconds
    - Store drafts in localStorage or database
    - Allow resuming from draft
    - Show save status indicator
    - _Requirements: 6_

  - [ ] 9.4 Add autocomplete for company/customer
    - Integrate with dictionary search APIs
    - Show dropdown with search results
    - Allow creating new entries inline
    - Snapshot selected data to sample
    - _Requirements: 6, 15_

  - [ ] 9.5 Make form mobile-responsive
    - Adapt layout for mobile screens
    - Use touch-friendly input controls (min 44x44px)
    - Optimize field order for mobile entry
    - Test on various screen sizes
    - _Requirements: 12_

- [ ] 10. Lab records unified grid
  - [ ] 10.1 Create lab records API with server-side operations
    - Implement GET /api/lab-records with query parameters
    - Add server-side filtering by query, kitTypeId, status, dates
    - Add server-side sorting by any column
    - Add server-side pagination
    - Query v_lab_records view
    - Return total count for pagination
    - _Requirements: 5_

  - [ ] 10.2 Build LabRecordsGrid component
    - Integrate TanStack Table for UI rendering
    - Display data from server with pagination
    - Add column visibility controls
    - Show kit and sample data in unified view
    - Handle null sample_id for unused kits
    - _Requirements: 5_

  - [ ] 10.3 Add filter panel
    - Create FilterPanel component
    - Add text search input
    - Add kit type selector
    - Add status filters
    - Add date range picker
    - Send filter params to server API
    - _Requirements: 5_

  - [ ] 10.4 Add sorting functionality
    - Add sort indicators to column headers
    - Send sort params to server API
    - Support multi-column sorting
    - _Requirements: 5_

  - [ ] 10.5 Implement pagination
    - Add pagination controls
    - Show page size selector
    - Show total records count
    - Handle page navigation
    - _Requirements: 5_

  - [ ]* 10.6 Write tests for grid functionality
    - Test filtering with various criteria
    - Test sorting by different columns
    - Test pagination
    - Test column visibility
    - _Requirements: 5_

- [ ] 11. Dashboard and analytics
  - [ ] 11.1 Create analytics API routes
    - Implement POST /api/analytics/pivot for server-side aggregation
    - Implement GET /api/analytics/dashboard for pre-configured data
    - Add SQL GROUP BY queries for aggregations
    - Support multiple aggregation functions (sum/avg/count/min/max)
    - _Requirements: 7_

  - [ ] 11.2 Build dashboard layout
    - Create DashboardLayout with grid-based responsive design
    - Add card-based widget containers
    - Implement generous whitespace and clean design
    - Make responsive for mobile/tablet/desktop
    - _Requirements: 7, 12_

  - [ ] 11.3 Create metric cards
    - Build MetricCards for KPIs
    - Show large numbers with trend indicators
    - Add icons with pastel backgrounds
    - Display comparison to previous period
    - _Requirements: 7_

  - [ ] 11.4 Build revenue chart
    - Create RevenueChart using ECharts
    - Use pastel color scheme
    - Add smooth animations
    - Add interactive tooltips
    - Add time range selector
    - Show trend indicators
    - _Requirements: 7_

  - [ ] 11.5 Create sample distribution chart
    - Build SampleDistributionChart as donut chart
    - Use pastel colors for segments
    - Show total in center
    - Add interactive legend
    - Add hover effects
    - _Requirements: 7_

  - [ ] 11.6 Build kit inventory widget
    - Create KitInventoryWidget with horizontal bars
    - Color-code by status with pastel colors
    - Show quick stats (total, in_stock, used, expired)
    - Add alert indicators for low stock
    - Make clickable to filter main grid
    - _Requirements: 7_

  - [ ] 11.7 Create test results heatmap
    - Build TestResultsHeatmap using ECharts
    - Use gradient from light to dark pastels
    - Add clear axis labels
    - Add tooltips with exact values
    - Make responsive
    - _Requirements: 7_

  - [ ] 11.8 Build interactive pivot table
    - Create PivotTable with drag-drop interface
    - Use TanStack Table for rendering
    - Add aggregation options
    - Add collapsible groups
    - Add inline sparklines for trends
    - Integrate with DuckDB-WASM for client-side queries
    - _Requirements: 7_

  - [ ] 11.9 Add dashboard filters
    - Create QuickFilters component
    - Add date range picker
    - Add customer/type selectors
    - Add status filters
    - Apply filters to all widgets
    - Show active filter indicators
    - _Requirements: 7_

  - [ ]* 11.10 Write tests for dashboard
    - Test chart rendering
    - Test data aggregation
    - Test filter application
    - Test responsive behavior
    - _Requirements: 7_

- [ ] 12. Data export functionality
  - [ ] 12.1 Create export API routes
    - Implement POST /api/export/excel
    - Implement POST /api/export/csv
    - Accept grid data or pivot results
    - Generate files with proper formatting
    - Include column headers
    - _Requirements: 8_

  - [ ] 12.2 Add export buttons to UI
    - Add export buttons to grid toolbar
    - Add export buttons to pivot table
    - Trigger file download on completion
    - Show loading state during export
    - Add descriptive filenames with timestamps
    - _Requirements: 8_

  - [ ]* 12.3 Write tests for export
    - Test Excel generation
    - Test CSV generation
    - Test data formatting
    - _Requirements: 8_

- [ ] 13. Audit logging
  - [ ] 13.1 Create audit logging utility
    - Build utility function to log events
    - Log CREATE, UPDATE, VIEW, EXPORT actions
    - Record actor_id, entity, entity_id, timestamp
    - Store diff for updates (excluding PII)
    - _Requirements: 11_

  - [ ] 13.2 Integrate audit logging
    - Add logging to all sample CRUD operations
    - Add logging to kit operations
    - Add logging to export operations
    - Add logging to view operations (optional)
    - _Requirements: 11_

  - [ ]* 13.3 Write tests for audit logging
    - Test log creation
    - Test PII exclusion
    - Test different action types
    - _Requirements: 11_

- [ ] 14. Status workflow and billing
  - [ ] 14.1 Add status update functionality
    - Add status field to sample form
    - Allow transitions: draft → done → approved
    - Add billing_status field with options
    - Add invoice_month field for invoiced/eom_credit
    - _Requirements: 13, 14_

  - [ ] 14.2 Create status filter and reports
    - Add status filters to grid
    - Add billing status filters
    - Create financial reports by billing_status and invoice_month
    - _Requirements: 13, 14_

- [ ] 15. PWA configuration
  - [ ] 15.1 Configure service worker
    - Set up Next.js PWA plugin
    - Configure cache strategies (network-first for API, cache-first for static)
    - Implement offline dashboard viewing (read-only cache)
    - Add background sync for draft autosave
    - _Requirements: 12_

  - [ ] 15.2 Create PWA manifest
    - Configure manifest.json with app metadata
    - Set theme_color to pastel blue (#93C5FD)
    - Set background_color to off-white (#FAFAFA)
    - Add app icons in various sizes
    - _Requirements: 12_

  - [ ]* 15.3 Test PWA functionality
    - Test offline mode
    - Test installation
    - Test cache behavior
    - _Requirements: 12_

- [ ] 16. Performance optimization
  - [ ] 16.1 Optimize database queries
    - Verify indexes are used in query plans
    - Optimize complex joins in v_lab_records
    - Add query result caching with React Query
    - Configure cache times (5min for reference data, 1min for dynamic)
    - _Requirements: 16_

  - [ ] 16.2 Optimize frontend performance
    - Implement code splitting by route
    - Add image lazy loading
    - Use virtual scrolling in TanStack Table
    - Debounce search inputs
    - Implement optimistic UI updates
    - _Requirements: 16_

  - [ ]* 16.3 Run performance tests
    - Test with 5-7 concurrent users
    - Measure page load times (target <2s)
    - Measure API response times (target <500ms p95)
    - Test grid rendering with 100 rows (target <1s)
    - _Requirements: 16_

- [ ] 17. Error handling and monitoring
  - [ ] 17.1 Implement error handling
    - Create ApiError class with standard format
    - Add error boundaries for React components
    - Implement retry logic for 5xx errors
    - Show user-friendly Vietnamese error messages
    - _Requirements: All_

  - [ ] 17.2 Add monitoring and logging
    - Set up Vercel Analytics
    - Configure Supabase logging
    - Add custom business metrics tracking
    - Set up error alerts
    - _Requirements: All_

- [ ] 18. Security hardening
  - [ ]* 18.1 Security audit
    - Verify RLS policies prevent unauthorized access
    - Test SQL injection protection
    - Verify XSS prevention
    - Test CSRF protection
    - Verify presigned URL expiration
    - Test file upload validation
    - Test rate limiting
    - _Requirements: 9, 10, 4_

- [ ] 19. Deployment and documentation
  - [ ] 19.1 Configure deployment
    - Set up Vercel project
    - Configure environment variables
    - Set up Supabase production database
    - Configure Cloudflare R2 bucket
    - Set up custom domain (if applicable)
    - _Requirements: All_

  - [ ] 19.2 Create user documentation
    - Write user guide for data entry
    - Document dashboard usage
    - Create role-based access guide
    - Document export functionality
    - _Requirements: All_

  - [ ] 19.3 Create developer documentation
    - Document API endpoints
    - Document database schema
    - Document deployment process
    - Document environment variables
    - _Requirements: All_
