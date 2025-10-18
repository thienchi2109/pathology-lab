# Task 7: Sample Management API - Complete

## Summary

Successfully implemented all sample management API endpoints with full CRUD operations, auto-assignment logic, and KQ_CHUNG calculation.

## Implemented Endpoints

### 1. GET /api/samples/next-code
**Purpose**: Generate next sample code based on received date

**Query Parameters**:
- `receivedAt` (required): Date in YYYY-MM-DD format

**Response**:
```json
{
  "data": {
    "sample_code": "T10_00042",
    "received_at": "2024-10-15"
  }
}
```

**Features**:
- Uses database function `next_sample_code(date)`
- Format: T<MM>_<#####>
- Global sequence (doesn't reset monthly)
- Available to both editors and viewers

---

### 2. POST /api/samples
**Purpose**: Create new sample with optional auto-assignment

**Request Body**:
```json
{
  "kit_id": "uuid",              // Optional if assignNext=true
  "assignNext": true,            // Auto-assign next available kit
  "kit_type_id": "uuid",         // Required if assignNext=true
  "customer": "string",
  "sample_type": "string",
  "received_at": "2024-10-15",
  "collected_at": "2024-10-14",  // Optional
  "technician": "string",
  "price": 150000,
  "status": "draft",             // Optional: draft|done|approved
  "billing_status": "unpaid",    // Optional: unpaid|invoiced|paid|eom_credit
  "invoice_month": "2024-10-01", // Optional, required for invoiced/eom_credit
  "category_id": "uuid",
  "company_snapshot": {
    "name": "string",
    "region": "string",          // Optional
    "province": "string"         // Optional
  },
  "customer_snapshot": {
    "name": "string",
    "phone": "string",           // Optional
    "region": "string"           // Optional
  },
  "sl_mau": 5,
  "note": "string"               // Optional
}
```

**Response**: 201 Created
```json
{
  "data": {
    "id": "uuid",
    "sample_code": "T10_00042",
    "kit_id": "uuid",
    // ... all sample fields
  }
}
```

**Features**:
- Auto-generates sample code using `next_sample_code()`
- Auto-assigns next available kit if `assignNext=true`
- Updates kit status to 'assigned' then 'used' (via trigger)
- Returns 409 if no kits available: "Không còn kit <type>"
- Validates all inputs with Zod schemas
- Logs audit trail
- Editor-only access

**Business Rules**:
- Either `kit_id` OR (`assignNext` + `kit_type_id`) must be provided
- Auto-assignment selects oldest in_stock kit of specified type
- Kit status automatically updates to 'used' when sample is created (via database trigger)

---

### 3. GET /api/samples
**Purpose**: List samples with filtering and pagination

**Query Parameters**:
- `page` (optional): Page number, default 1
- `pageSize` (optional): Items per page, default 50
- `status` (optional): Filter by status (draft|done|approved)
- `billingStatus` (optional): Filter by billing status
- `customer` (optional): Search by customer name (partial match)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "sample_code": "T10_00042",
      "kit": { /* kit details */ },
      // ... all sample fields
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

**Features**:
- Server-side filtering and pagination
- Includes related kit data
- Ordered by received_at descending
- Available to both editors and viewers

---

### 4. GET /api/samples/:id
**Purpose**: Get sample detail with all related data

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "sample_code": "T10_00042",
    "kit": {
      "id": "uuid",
      "kit_code": "BATCH001-001",
      "batch": {
        "batch_code": "BATCH001",
        "kit_type": { /* kit type details */ }
      }
    },
    "results": [
      {
        "metric_code": "WSSV",
        "metric_name": "White Spot Syndrome Virus",
        "value_num": 150,
        "unit": "copies/µL"
      }
    ],
    "images": [
      {
        "id": "uuid",
        "url": "https://...",
        "size_bytes": 1024000
      }
    ],
    // ... all sample fields
  }
}
```

**Features**:
- Includes kit with batch and kit_type
- Includes all sample_results
- Includes all sample_images
- Logs VIEW action to audit trail
- Available to both editors and viewers

---

### 5. PATCH /api/samples/:id
**Purpose**: Update sample metadata

**Request Body** (all fields optional):
```json
{
  "customer": "string",
  "sample_type": "string",
  "received_at": "2024-10-15",
  "collected_at": "2024-10-14",
  "technician": "string",
  "price": 150000,
  "status": "done",
  "billing_status": "invoiced",
  "invoice_month": "2024-10-01",
  "category_id": "uuid",
  "company_snapshot": { /* ... */ },
  "customer_snapshot": { /* ... */ },
  "sl_mau": 5,
  "note": "string"
}
```

**Response**:
```json
{
  "data": {
    "id": "uuid",
    // ... updated sample fields
  }
}
```

**Features**:
- Partial updates (only provided fields)
- Validates all inputs
- Logs audit trail with before/after diff
- Auto-updates `updated_at` timestamp (via trigger)
- Editor-only access

---

### 6. PATCH /api/samples/:id/results
**Purpose**: Update sample test results (batch operation)

**Request Body**:
```json
{
  "results": [
    {
      "metric_code": "WSSV",
      "metric_name": "White Spot Syndrome Virus",
      "value_num": 150,
      "value_text": null,
      "unit": "copies/µL",
      "ref_low": 0,
      "ref_high": 100
    },
    {
      "metric_code": "EHP",
      "metric_name": "Enterocytozoon hepatopenaei",
      "value_num": null,
      "value_text": "-",
      "unit": ""
    }
  ]
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "sample_id": "uuid",
      "metric_code": "WSSV",
      // ... all result fields
    }
  ],
  "count": 2
}
```

**Features**:
- Replaces all existing results (delete + insert)
- Converts value_text "-" to value_num 0
- Validates metric_code against allowed list
- Logs audit trail with before/after diff
- Editor-only access

**Allowed Metric Codes**:
- CL_GAN
- WSSV
- EHP
- EMS
- TPD
- KHUAN
- MBV
- DIV1
- DANG_KHAC
- VI_KHUAN_VI_NAM
- TAM_SOAT

---

### 7. GET /api/samples/:id/report-message
**Purpose**: Generate formatted report with KQ_CHUNG calculation

**Response**:
```json
{
  "data": {
    "sample_id": "uuid",
    "sample_code": "T10_00042",
    "customer": "Công ty ABC",
    "kq_chung": "NHIỄM",
    "positive_count": 2,
    "positive_results": [
      {
        "metric_code": "WSSV",
        "metric_name": "White Spot Syndrome Virus",
        "value": 150,
        "severity": 3,
        "severityLabel": "nặng"
      },
      {
        "metric_code": "TPD",
        "metric_name": "Taura Syndrome",
        "value": 50,
        "severity": 2,
        "severityLabel": "TB"
      }
    ],
    "message": "Mẫu T10_00042 - Khách hàng: Công ty ABC\nKết quả tổng hợp: NHIỄM\n\nCác chỉ số dương tính:\n- White Spot Syndrome Virus (WSSV): 150 (mức độ: nặng)\n- Taura Syndrome (TPD): 50 (mức độ: TB)\n"
  }
}
```

**Features**:
- Calculates KQ_CHUNG: 'NHIỄM' if any metric > 0, else 'SẠCH'
- Converts value_text "-" to 0
- Assigns severity levels to each positive metric
- Sorts positive results by severity (highest first)
- Generates formatted Vietnamese message
- Available to both editors and viewers

**Severity Levels**:
- Level 3 (nặng): WSSV, EHP, EMS
- Level 2 (TB): TPD, KHUAN, MBV, DIV1
- Level 1 (nhẹ): DANG_KHAC, VI_KHUAN_VI_NAM, TAM_SOAT, CL_GAN

---

## Error Handling

All endpoints follow consistent error format:

**400 Bad Request**: Invalid input format
```json
{ "error": "Ngày nhận không hợp lệ" }
```

**401 Unauthorized**: Not authenticated
```json
{ "error": "Vui lòng đăng nhập" }
```

**403 Forbidden**: Insufficient permissions
```json
{ "error": "Bạn không có quyền thực hiện thao tác này" }
```

**404 Not Found**: Resource doesn't exist
```json
{ "error": "Không tìm thấy mẫu" }
```

**409 Conflict**: Business rule violation
```json
{ "error": "Không còn kit Loại A" }
{ "error": "Mã mẫu đã tồn tại" }
{ "error": "Kit không tồn tại hoặc đã được sử dụng" }
```

**422 Unprocessable Entity**: Validation error
```json
{ "error": "Số lượng mẫu phải > 0" }
```

**500 Internal Server Error**: Unexpected error
```json
{ "error": "Đã xảy ra lỗi, vui lòng thử lại" }
```

---

## Security & Authorization

**Editor Role** (can modify):
- POST /api/samples
- PATCH /api/samples/:id
- PATCH /api/samples/:id/results

**Viewer Role** (read-only):
- GET /api/samples/next-code
- GET /api/samples
- GET /api/samples/:id
- GET /api/samples/:id/report-message

**Audit Logging**:
- All mutations logged to `audit_logs` table
- VIEW actions logged for sample detail access
- Includes actor_id, action, entity, entity_id, and diff

---

## Database Integration

**Functions Used**:
- `next_sample_code(date)`: Generates sample code in format T<MM>_<#####>

**Triggers**:
- `trg_touch_updated_at`: Auto-updates samples.updated_at on modification
- `trg_sample_kit_used`: Auto-updates kit.status='used' and kit.tested_at when sample is created

**Sequences**:
- `sample_code_seq`: Global sequence for sample numbering

---

## Testing Recommendations

### Manual Testing with curl:

```bash
# 1. Get next sample code
curl "http://localhost:3000/api/samples/next-code?receivedAt=2024-10-15" \
  -H "Cookie: sb-access-token=..."

# 2. Create sample with auto-assign
curl -X POST "http://localhost:3000/api/samples" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "assignNext": true,
    "kit_type_id": "uuid",
    "customer": "Test Customer",
    "sample_type": "Tôm",
    "received_at": "2024-10-15",
    "technician": "Nguyễn Văn A",
    "price": 150000,
    "category_id": "uuid",
    "company_snapshot": {"name": "Công ty Test"},
    "customer_snapshot": {"name": "Test Customer"},
    "sl_mau": 5
  }'

# 3. Get sample detail
curl "http://localhost:3000/api/samples/{id}" \
  -H "Cookie: sb-access-token=..."

# 4. Update sample metadata
curl -X PATCH "http://localhost:3000/api/samples/{id}" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"status": "done", "price": 200000}'

# 5. Update sample results
curl -X PATCH "http://localhost:3000/api/samples/{id}/results" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "results": [
      {
        "metric_code": "WSSV",
        "metric_name": "White Spot Syndrome Virus",
        "value_num": 150,
        "unit": "copies/µL"
      }
    ]
  }'

# 6. Get report message
curl "http://localhost:3000/api/samples/{id}/report-message" \
  -H "Cookie: sb-access-token=..."
```

### Integration Test Scenarios:

1. **Sample Creation Flow**:
   - Create kit batch
   - Create sample with auto-assign
   - Verify kit status changed to 'used'
   - Verify sample_code format

2. **Results Update Flow**:
   - Create sample
   - Add results with positive values
   - Get report message
   - Verify KQ_CHUNG = 'NHIỄM'

3. **Authorization Tests**:
   - Viewer cannot POST/PATCH
   - Editor can perform all operations
   - Unauthenticated requests rejected

4. **Error Cases**:
   - No kits available (409)
   - Invalid metric_code (422)
   - Sample not found (404)
   - Invalid date format (400)

---

## Requirements Coverage

✅ **Requirement 2**: Sample Creation and Management
- Sample code generation (T<MM>_<#####>)
- Auto-assignment logic
- Comprehensive metadata (20-30 fields)
- Automatic kit status update

✅ **Requirement 3**: Sample Results Management
- 10-15 test metrics support
- Numeric and text values
- KQ_CHUNG calculation
- Report message generation with severity levels

---

## Next Steps

Task 8: Image upload functionality
- Configure Cloudflare R2
- Create presigned URL endpoint
- Implement image attachment
- Build upload UI components

---

**Status**: ✅ Complete
**Date**: 2025-10-18
**Files Created**: 5 API route files
**Lines of Code**: ~600
**Test Coverage**: Manual testing recommended

