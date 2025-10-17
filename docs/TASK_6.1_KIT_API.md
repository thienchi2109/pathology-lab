# Task 6.1: Kit Management API Routes

**Status**: ✅ Complete  
**Date**: 2025-10-17  
**Requirements**: Requirement 1 (Kit Inventory Management)

## Overview

Implemented three API endpoints for kit inventory management with comprehensive validation, error handling, and business rule enforcement. These endpoints enable lab technicians to create kit batches, adjust inventory levels, and query kit availability.

## Implemented Endpoints

### 1. POST /api/kits/bulk-create

Creates a kit batch and generates individual kit records.

**Authentication**: Editor role required

**Request Body**:
```json
{
  "batch_code": "BATCH001",
  "kit_type_id": "uuid-string",
  "supplier": "Supplier Name",
  "purchased_at": "2024-01-15",
  "unit_cost": 50000,
  "quantity": 50,
  "expires_at": "2025-01-15",
  "note": "Optional note"
}
```

**Validation Rules**:
- `batch_code`: Required, non-empty string
- `kit_type_id`: Required, valid UUID
- `supplier`: Required, non-empty string
- `purchased_at`: Required, format YYYY-MM-DD
- `unit_cost`: Required, positive number
- `quantity`: Required, integer between 1-100
- `expires_at`: Optional, format YYYY-MM-DD
- `note`: Optional string

**Response (Success - 200)**:
```json
{
  "data": {
    "batch": {
      "id": "uuid",
      "batch_code": "BATCH001",
      "kit_type_id": "uuid",
      "supplier": "Supplier Name",
      "purchased_at": "2024-01-15",
      "unit_cost": 50000,
      "quantity": 50,
      "expires_at": "2025-01-15",
      "note": null,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    },
    "kits": [
      {
        "id": "uuid",
        "batch_id": "uuid",
        "kit_code": "BATCH001-001",
        "status": "in_stock",
        "assigned_at": null,
        "tested_at": null,
        "note": null,
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
      // ... 49 more kits
    ],
    "count": 50
  }
}
```

**Error Responses**:
- `401 Unauthorized`: "Vui lòng đăng nhập"
- `403 Forbidden`: "Bạn không có quyền thực hiện thao tác này"
- `409 Conflict`: "Mã lô đã tồn tại" (duplicate batch_code)
- `422 Unprocessable Entity`: "Số lượng quá lớn" (quantity > 100)
- `422 Unprocessable Entity`: Validation error messages
- `500 Internal Server Error`: "Đã xảy ra lỗi, vui lòng thử lại"

**Business Logic**:
1. Validates all input fields using Zod schema
2. Enforces quantity limit of 100 kits per batch
3. Creates kit_batch record in database
4. Generates individual kit records with auto-generated codes:
   - Format: `{batch_code}-{sequential_number}`
   - Example: `BATCH001-001`, `BATCH001-002`, etc.
   - Sequential number is zero-padded to 3 digits
5. All kits start with `in_stock` status
6. If kit creation fails, automatically rolls back batch creation
7. Logs audit trail with CREATE action

**Kit Code Generation**:
- Pattern: `{batch_code}-{NNN}`
- NNN is zero-padded sequential number (001, 002, ..., 100)
- Example: For batch_code "KIT2024A" with quantity 5:
  - KIT2024A-001
  - KIT2024A-002
  - KIT2024A-003
  - KIT2024A-004
  - KIT2024A-005

---

### 2. POST /api/kits/bulk-adjust

Adjusts kit inventory levels with stock validation.

**Authentication**: Editor role required

**Request Body**:
```json
{
  "kit_type_id": "uuid-string",
  "delta": -10,
  "reason": "Damaged during transport"
}
```

**Validation Rules**:
- `kit_type_id`: Required, valid UUID
- `delta`: Required, integer (positive or negative)
- `reason`: Optional string

**Response (Success - 200)**:
```json
{
  "data": {
    "adjusted": 10,
    "new_stock": 40
  }
}
```

**Error Responses**:
- `401 Unauthorized`: "Vui lòng đăng nhập"
- `403 Forbidden`: "Bạn không có quyền thực hiện thao tác này"
- `404 Not Found`: "Không tìm thấy kit loại này"
- `409 Conflict`: "Chuyển quá số lượng tồn kho" (reduction exceeds available stock)
- `409 Conflict`: "Không đủ kit để điều chỉnh (cần X, có Y)" (insufficient adjustable kits)
- `422 Unprocessable Entity`: Validation error messages
- `500 Internal Server Error`: "Đã xảy ra lỗi, vui lòng thử lại"

**Business Logic**:

**Positive Delta (Increase Stock)**:
1. Finds kits with `void` or `lost` status for the specified kit type
2. Validates that enough kits are available to adjust
3. Updates found kits to `in_stock` status
4. Records reason in kit note field
5. Returns count of adjusted kits and new stock level

**Negative Delta (Decrease Stock)**:
1. Queries current `in_stock` count for the kit type
2. Validates that reduction doesn't exceed available stock
3. Finds `in_stock` kits to mark as `void`
4. Updates found kits to `void` status
5. Records reason in kit note field
6. Returns count of adjusted kits and new stock level

**Zero Delta**:
- Returns current stock without making changes

**Audit Logging**:
- Records action as UPDATE
- Includes delta, affected kit IDs, and reason
- Links to kit_type_id as entity_id

---

### 3. GET /api/kits/availability

Retrieves kit availability statistics grouped by type and status.

**Authentication**: Any authenticated user (editor or viewer)

**Query Parameters**:
- `kit_type_id` (optional): Filter by specific kit type UUID

**Request Examples**:
```
GET /api/kits/availability
GET /api/kits/availability?kit_type_id=uuid-string
```

**Response (Success - 200)**:
```json
{
  "data": [
    {
      "kit_type_id": "uuid-1",
      "kit_type_code": "PCR-01",
      "kit_type_name": "PCR Test Kit",
      "by_status": {
        "in_stock": 45,
        "assigned": 5,
        "used": 30,
        "void": 2,
        "expired": 1,
        "lost": 0
      },
      "total": 83
    },
    {
      "kit_type_id": "uuid-2",
      "kit_type_code": "ELISA-01",
      "kit_type_name": "ELISA Test Kit",
      "by_status": {
        "in_stock": 20,
        "assigned": 0,
        "used": 15,
        "void": 0,
        "expired": 0,
        "lost": 1
      },
      "total": 36
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: "Vui lòng đăng nhập"
- `500 Internal Server Error`: "Đã xảy ra lỗi, vui lòng thử lại"

**Business Logic**:
1. Queries all kits with their batch and kit_type information
2. Filters by kit_type_id if provided
3. Groups kits by kit_type_id and status
4. Calculates counts for each status category
5. Returns array of kit types with availability breakdown

**Status Categories**:
- `in_stock`: Available for assignment
- `assigned`: Reserved but not yet used
- `used`: Linked to a sample (tested)
- `void`: Removed from inventory (damaged, etc.)
- `expired`: Past expiration date
- `lost`: Missing/unaccounted for

---

## Database Schema

### kit_batches Table
```sql
CREATE TABLE kit_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT UNIQUE NOT NULL,
  kit_type_id UUID NOT NULL REFERENCES kit_types(id),
  supplier TEXT NOT NULL,
  purchased_at DATE NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 100),
  expires_at DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### kits Table
```sql
CREATE TABLE kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES kit_batches(id) ON DELETE CASCADE,
  kit_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_stock', 'assigned', 'used', 'void', 'expired', 'lost')),
  assigned_at TIMESTAMPTZ,
  tested_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_kits_status ON kits(status);
CREATE INDEX idx_kits_batch_id ON kits(batch_id);
CREATE INDEX idx_kits_kit_code ON kits(kit_code);
CREATE INDEX idx_kit_batches_kit_type_id ON kit_batches(kit_type_id);
```

---

## TypeScript Types

Added to `types/database.ts`:

```typescript
export type KitStatus = 'in_stock' | 'assigned' | 'used' | 'void' | 'expired' | 'lost';

export interface KitBatch {
  id: string;
  batch_code: string;
  kit_type_id: string;
  supplier: string;
  purchased_at: string;
  unit_cost: number;
  quantity: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  kit_type?: KitType;
}

export interface Kit {
  id: string;
  batch_id: string;
  kit_code: string;
  status: KitStatus;
  assigned_at: string | null;
  tested_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  batch?: KitBatch;
}
```

---

## Security & Authorization

### Role-Based Access Control (RBAC)

**Editor Role**:
- Can create kit batches (POST /api/kits/bulk-create)
- Can adjust inventory (POST /api/kits/bulk-adjust)
- Can view availability (GET /api/kits/availability)

**Viewer Role**:
- Can view availability (GET /api/kits/availability)
- Cannot create or modify kits

### Authentication Flow
1. Extract session from Supabase Auth cookies
2. Query users table to get user role
3. Validate role matches endpoint requirements
4. Return 401 if not authenticated
5. Return 403 if insufficient permissions

### Audit Logging
All mutations (CREATE, UPDATE) are logged to `audit_logs` table:
```typescript
{
  actor_id: string,      // User who performed action
  action: 'CREATE' | 'UPDATE',
  entity: 'kit_batches' | 'kits',
  entity_id: string,     // ID of affected entity
  diff: {                // Action-specific details
    after?: object,      // For CREATE
    delta?: number,      // For bulk-adjust
    kit_ids?: string[],  // For bulk-adjust
    reason?: string      // For bulk-adjust
  }
}
```

---

## Error Handling

### Validation Errors (422)
- Zod schema validation failures
- Quantity exceeds 100 limit
- Invalid date formats
- Invalid UUIDs

### Conflict Errors (409)
- Duplicate batch_code
- Stock reduction exceeds available quantity
- Insufficient kits for adjustment

### Authorization Errors
- 401: Not authenticated
- 403: Insufficient role permissions

### Server Errors (500)
- Database connection failures
- Unexpected errors during transaction
- Rollback failures

---

## Testing Recommendations

### Unit Tests
- [ ] Zod schema validation for all input combinations
- [ ] Kit code generation logic
- [ ] Stock calculation logic
- [ ] Error message formatting

### Integration Tests
- [ ] Create batch with valid data
- [ ] Create batch with quantity > 100 (expect 422)
- [ ] Create batch with duplicate batch_code (expect 409)
- [ ] Adjust stock with positive delta
- [ ] Adjust stock with negative delta exceeding stock (expect 409)
- [ ] Query availability for all kit types
- [ ] Query availability for specific kit type
- [ ] Viewer attempting to create batch (expect 403)

### API Test Examples

**Create Kit Batch**:
```bash
curl -X POST http://localhost:3000/api/kits/bulk-create \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "batch_code": "TEST001",
    "kit_type_id": "uuid-here",
    "supplier": "Test Supplier",
    "purchased_at": "2024-01-15",
    "unit_cost": 50000,
    "quantity": 10
  }'
```

**Adjust Stock**:
```bash
curl -X POST http://localhost:3000/api/kits/bulk-adjust \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "kit_type_id": "uuid-here",
    "delta": -5,
    "reason": "Damaged"
  }'
```

**Check Availability**:
```bash
curl http://localhost:3000/api/kits/availability?kit_type_id=uuid-here \
  -H "Cookie: sb-access-token=..."
```

---

## Dependencies Added

- **zod** (^3.x): Schema validation library for request body validation

---

## Files Created/Modified

### Created
- `app/api/kits/bulk-create/route.ts` - Bulk kit creation endpoint
- `app/api/kits/bulk-adjust/route.ts` - Stock adjustment endpoint
- `app/api/kits/availability/route.ts` - Availability query endpoint
- `docs/TASK_6.1_KIT_API.md` - This documentation

### Modified
- `types/database.ts` - Added KitBatch, Kit, and KitStatus types
- `package.json` - Added zod dependency

---

## Next Steps

The following tasks depend on this implementation:

- **Task 6.2**: Build kit batch creation form (UI component)
- **Task 6.3**: Write tests for kit management
- **Task 7.1**: Create sample CRUD endpoints (will use kit auto-assign logic)
- **Task 10.1**: Create lab records API (will query kit availability)

---

## Requirements Satisfied

✅ **Requirement 1.1**: Accept batch_code, kit_type, supplier, purchased_at, unit_cost, quantity (≤100), expires_at  
✅ **Requirement 1.2**: Generate individual kit records with unique kit_code  
✅ **Requirement 1.3**: Return 422 error "Số lượng quá lớn" when quantity > 100  
✅ **Requirement 1.4**: Display kits grouped by status  
✅ **Requirement 1.5**: Only allow stock reduction up to available in_stock quantity  
✅ **Requirement 1.6**: Return 409 error "Chuyển quá số lượng tồn kho" when exceeding stock  

---

**Implementation Date**: 2025-10-17  
**Developer**: AI Assistant (Kiro)  
**Reviewed**: Pending  
**Status**: ✅ Complete and Ready for Testing
