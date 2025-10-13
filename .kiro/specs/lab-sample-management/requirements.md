# Requirements Document

## Introduction

This document outlines the requirements for a Lab Sample Management System - an internal web application designed to manage laboratory samples with tabular data, form-based data entry supporting up to 10 images per result, Excel-like pivot analysis and charting capabilities, role-based access control, and mobile-optimized interface for 5-7 concurrent users.

The system follows a kit-first approach where kits are managed as inventory, and samples are created by linking to kits. The unified view presents both kit inventory and sample data in a single interface, similar to the existing Data_Kit spreadsheet workflow.

## Requirements

### Requirement 1: Kit Inventory Management

**User Story:** As a lab technician, I want to manage kit inventory with batch tracking and status monitoring, so that I can efficiently track available kits and their lifecycle from receipt to usage.

#### Acceptance Criteria

1. WHEN a user creates a new kit batch THEN the system SHALL accept batch_code, kit_type, supplier, purchased_at, unit_cost, quantity (≤100), and expires_at
2. WHEN a user creates kits in bulk THEN the system SHALL generate individual kit records with unique kit_code for each unit in the batch
3. WHEN quantity exceeds 100 THEN the system SHALL return error "Số lượng quá lớn" with status 422
4. WHEN a user views kit inventory THEN the system SHALL display kits grouped by status: in_stock, assigned, used, void, expired, lost
5. WHEN a user adjusts stock with negative delta THEN the system SHALL only allow reduction up to available in_stock quantity
6. WHEN stock reduction exceeds available quantity THEN the system SHALL return error "Chuyển quá số lượng tồn kho" with status 409

### Requirement 2: Sample Creation and Management

**User Story:** As a lab technician, I want to create samples by linking them to kits with comprehensive metadata (20-30 fields), so that I can track the complete lifecycle of each sample from receipt to completion.

#### Acceptance Criteria

1. WHEN a user creates a new sample THEN the system SHALL generate a unique sample_code in format T<month>_<#####> based on received_at date
2. WHEN a user creates a sample with assignNext=true THEN the system SHALL automatically assign the next available kit of the specified kit_type
3. WHEN no kits are available for auto-assignment THEN the system SHALL return error "Không còn kit <Loai_kit>" with status 409
4. WHEN a sample is linked to a kit THEN the system SHALL automatically update kit status to 'used' and set tested_at timestamp
5. WHEN a user creates a sample THEN the system SHALL accept metadata including: customer, sample_type, received_at, collected_at, technician, price, category, company snapshot (name/region/province), customer snapshot (name/phone/region), sl_mau, note
6. WHEN a user updates sample metadata THEN the system SHALL update the updated_at timestamp automatically
7. WHEN a user views sample detail THEN the system SHALL display all metadata, linked kit information, results, and images

### Requirement 3: Sample Results Management

**User Story:** As a lab technician, I want to record 10-15 test metrics per sample with numeric and text values, so that I can document comprehensive test results for each sample.

#### Acceptance Criteria

1. WHEN a user adds sample results THEN the system SHALL accept metric_code from the standard set: CL_GAN, WSSV, EHP, EMS, TPD, KHUAN, MBV, DIV1, DANG_KHAC, VI_KHUAN_VI_NAM, TAM_SOAT
2. WHEN a user enters a result THEN the system SHALL accept value_num (numeric), value_text (text), unit, ref_low, and ref_high
3. WHEN a result value is "-" THEN the system SHALL treat it as 0
4. WHEN all results are entered THEN the system SHALL automatically calculate KQ_CHUNG as 'NHIỄM' if any metric > 0, otherwise 'SẠCH'
5. WHEN a user updates results THEN the system SHALL allow batch update of multiple metrics in a single operation
6. WHEN a user requests report message THEN the system SHALL generate a formatted message showing KQ_CHUNG and listing all positive metrics with severity levels (1=nhẹ, 2=TB, 3=nặng)

### Requirement 4: Image Upload and Management

**User Story:** As a lab technician, I want to upload up to 10 images per sample as evidence of test results, so that I can provide visual documentation of findings.

#### Acceptance Criteria

1. WHEN a user requests image upload THEN the system SHALL generate a presigned URL for Cloudflare R2 with 15-minute expiration
2. WHEN generating presigned URL THEN the system SHALL validate sizeBytes ≤ 5MB (5,242,880 bytes)
3. WHEN generating presigned URL THEN the system SHALL validate contentType is one of: image/jpeg, image/png, image/webp
4. WHEN a user attaches an uploaded image THEN the system SHALL record r2_key, url, width, height, size_bytes, and uploaded_by
5. WHEN a sample has 10 images THEN the system SHALL prevent attaching additional images
6. WHEN a user views sample images THEN the system SHALL display all images with metadata in chronological order

### Requirement 5: Unified Grid View (Lab Records)

**User Story:** As a lab user, I want to view a unified grid combining kit inventory and sample data in a single table, so that I can see both available kits and completed samples in one place.

#### Acceptance Criteria

1. WHEN a user views lab records THEN the system SHALL display data from v_lab_records view combining kits and samples
2. WHEN a kit has no linked sample THEN the system SHALL show kit information with null sample fields
3. WHEN a kit has a linked sample THEN the system SHALL show combined kit and sample information including all result metrics and KQ_CHUNG
4. WHEN a user filters lab records THEN the system SHALL support filtering by: query (text search), kitTypeId, status, dateFrom, dateTo
5. WHEN a user sorts lab records THEN the system SHALL support sorting by any visible column
6. WHEN a user views lab records THEN the system SHALL implement pagination with configurable page size
7. WHEN a user customizes columns THEN the system SHALL allow hiding/showing individual columns

### Requirement 6: Form-Based Data Entry

**User Story:** As a lab technician, I want to enter sample data through a responsive form with validation and autosave, so that I can efficiently input data on both desktop and mobile devices without losing work.

#### Acceptance Criteria

1. WHEN a user opens the sample form THEN the system SHALL display all 20-30 metadata fields organized in logical sections
2. WHEN a user enters data THEN the system SHALL validate required fields, data types, and format constraints in real-time
3. WHEN a user enters data THEN the system SHALL automatically save draft every 30 seconds
4. WHEN a user navigates away THEN the system SHALL preserve draft data and allow resuming later
5. WHEN a user submits the form THEN the system SHALL validate all fields and display clear error messages for any issues
6. WHEN the form is displayed on mobile THEN the system SHALL adapt layout for touch input with appropriate field sizes
7. WHEN a user selects company or customer THEN the system SHALL provide autocomplete search functionality

### Requirement 7: Dashboard and Pivot Analysis

**User Story:** As a lab analyst, I want to create pivot tables and charts from sample data grouped by various dimensions, so that I can analyze trends and generate insights from test results.

#### Acceptance Criteria

1. WHEN a user creates a pivot THEN the system SHALL accept rows, cols, metrics (with aggregation: sum/avg/min/max/count), and filters
2. WHEN a user creates a pivot THEN the system SHALL execute server-side aggregation using SQL GROUP BY for datasets
3. WHEN a user creates a pivot on client THEN the system SHALL use TanStack Table v8 for flexible grouping and aggregation
4. WHEN a user analyzes large datasets THEN the system SHALL use DuckDB-WASM for client-side SQL queries
5. WHEN a user views dashboard THEN the system SHALL display pre-configured charts: revenue by month, samples by customer, test results distribution, kit inventory status
6. WHEN a user creates custom charts THEN the system SHALL support chart types: column, line, stacked, box plot, heatmap using ECharts
7. WHEN a user applies filters THEN the system SHALL clearly display active filter criteria with the results

### Requirement 8: Data Export

**User Story:** As a lab user, I want to export grid data and pivot results to Excel/CSV formats, so that I can perform additional analysis or share data with stakeholders.

#### Acceptance Criteria

1. WHEN a user exports from grid view THEN the system SHALL generate Excel/CSV file with all visible columns and applied filters
2. WHEN a user exports pivot results THEN the system SHALL generate Excel/CSV file preserving the pivot structure
3. WHEN a user exports data THEN the system SHALL include column headers and proper data formatting
4. WHEN export is complete THEN the system SHALL trigger browser download with descriptive filename including timestamp

### Requirement 9: Role-Based Access Control (RBAC)

**User Story:** As a system administrator, I want to enforce two-level role-based access control, so that I can ensure editors can modify data while viewers can only read information.

#### Acceptance Criteria

1. WHEN a user authenticates THEN the system SHALL assign role: 'editor' or 'viewer'
2. WHEN a viewer attempts write operations THEN the system SHALL return error "Bạn không có quyền thực hiện thao tác này"
3. WHEN an editor performs write operations THEN the system SHALL allow: create/update samples, upload images, update results, adjust kit inventory
4. WHEN a viewer accesses the system THEN the system SHALL allow: view lab records, view sample details, view images, view dashboards, export data
5. WHEN any user accesses protected endpoints THEN the system SHALL validate Supabase session and role before processing request
6. WHEN RBAC is enforced THEN the system SHALL implement checks at both application layer and database layer using Supabase RLS policies

### Requirement 10: Authentication

**User Story:** As a lab user, I want to authenticate using Supabase Auth integrated with Next.js, so that I can securely access the system with built-in session management and RLS support.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL display Supabase Auth sign-in options (email/password, OAuth providers)
2. WHEN a user signs in through Supabase Auth THEN the system SHALL create or retrieve user record with email, name, and assigned role
3. WHEN authentication succeeds THEN the system SHALL establish Supabase session with automatic token refresh
4. WHEN a user makes API requests THEN the system SHALL use Supabase client with session cookies for authentication
5. WHEN session expires THEN the system SHALL automatically refresh tokens or prompt user to re-authenticate
6. WHEN a user signs out THEN the system SHALL call Supabase signOut() to invalidate the session
7. WHEN RLS is enabled THEN the system SHALL configure Supabase policies to enforce row-level security based on user role

### Requirement 11: Audit Trail

**User Story:** As a lab manager, I want to track who created, modified, or viewed samples, so that I can maintain accountability and trace data changes.

#### Acceptance Criteria

1. WHEN a user creates a sample THEN the system SHALL log action='CREATE', entity='samples', entity_id, actor_id, and timestamp
2. WHEN a user updates a sample THEN the system SHALL log action='UPDATE', entity='samples', entity_id, actor_id, timestamp, and diff (changes)
3. WHEN a user views a sample THEN the system SHALL log action='VIEW', entity='samples', entity_id, actor_id, and timestamp
4. WHEN a user exports data THEN the system SHALL log action='EXPORT', entity type, actor_id, and timestamp
5. WHEN logging audit events THEN the system SHALL NOT include PII, JWT tokens, or presigned URLs in diff field
6. WHEN a user reviews audit logs THEN the system SHALL display chronological history with actor name, action, and timestamp

### Requirement 12: Mobile Responsiveness

**User Story:** As a lab technician, I want to use the application effectively on my mobile phone, so that I can enter data and view results while working in the lab.

#### Acceptance Criteria

1. WHEN a user accesses the app on mobile THEN the system SHALL adapt layout to screen width using responsive design
2. WHEN a user interacts with forms on mobile THEN the system SHALL provide touch-friendly input controls with appropriate sizes (min 44x44px)
3. WHEN a user views tables on mobile THEN the system SHALL enable horizontal scrolling or card-based layout for better readability
4. WHEN a user uploads images on mobile THEN the system SHALL support camera capture and gallery selection
5. WHEN a user views charts on mobile THEN the system SHALL render interactive charts optimized for touch gestures
6. WHEN the app loads on mobile THEN the system SHALL implement PWA features for offline dashboard viewing (read-only cache)

### Requirement 13: Sample Status Workflow

**User Story:** As a lab technician, I want to track sample progress through workflow states, so that I can monitor which samples are in progress, completed, or approved.

#### Acceptance Criteria

1. WHEN a sample is created THEN the system SHALL set status to 'draft' by default
2. WHEN a user completes data entry THEN the system SHALL allow updating status to 'done'
3. WHEN a supervisor reviews a sample THEN the system SHALL allow updating status to 'approved'
4. WHEN a user filters samples THEN the system SHALL support filtering by status: draft, done, approved
5. WHEN sample status changes THEN the system SHALL record the change in audit logs

### Requirement 14: Billing Status Tracking

**User Story:** As a lab administrator, I want to track payment status for each sample, so that I can manage invoicing and accounts receivable.

#### Acceptance Criteria

1. WHEN a sample is created THEN the system SHALL set billing_status to 'unpaid' by default
2. WHEN a user updates billing status THEN the system SHALL accept values: unpaid, invoiced, paid, eom_credit
3. WHEN billing_status is set to 'invoiced' or 'eom_credit' THEN the system SHALL allow setting invoice_month (first day of month)
4. WHEN a user filters samples THEN the system SHALL support filtering by billing_status and invoice_month
5. WHEN a user views financial reports THEN the system SHALL aggregate revenue by billing_status and invoice_month

### Requirement 15: Dictionary and Catalog Management

**User Story:** As a lab administrator, I want to manage reference data (kit types, sample types, companies, customers, categories, costs), so that I can maintain consistent data entry options.

#### Acceptance Criteria

1. WHEN a user accesses data entry forms THEN the system SHALL provide dropdown/autocomplete options from: kit_types, sample_types, companies, customers, categories
2. WHEN a user searches companies or customers THEN the system SHALL support partial text matching on name, region, and other fields
3. WHEN a user views cost catalog THEN the system SHALL display predefined cost items with labels and amounts
4. WHEN kit_types are defined THEN the system SHALL include default_sl_mau (default sample quantity) for each type
5. WHEN dictionary data is used in samples THEN the system SHALL snapshot company and customer data to preserve historical accuracy

### Requirement 16: System Performance

**User Story:** As a lab user, I want the system to respond quickly and handle concurrent usage, so that I can work efficiently without delays.

#### Acceptance Criteria

1. WHEN 5-7 users access the system concurrently THEN the system SHALL maintain response times under 2 seconds for typical operations
2. WHEN a user loads the lab records grid THEN the system SHALL implement pagination to limit initial load to 50-100 records
3. WHEN a user performs pivot analysis THEN the system SHALL execute server-side aggregation for datasets over 1000 records
4. WHEN a user uploads images THEN the system SHALL use presigned URLs to avoid server bottlenecks
5. WHEN database queries execute THEN the system SHALL use appropriate indexes on: kits(status, kit_code), samples(customer, status, billing_status, received_at), sample_results(sample_id, metric_code)
