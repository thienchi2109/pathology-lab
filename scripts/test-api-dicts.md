# Test Dictionary API Routes

## ✅ What's Been Created

### API Endpoints (All GET, Read-Only)
- `/api/dicts/kit-types` - List all kit types
- `/api/dicts/sample-types` - List all sample types
- `/api/dicts/companies?search=CP` - List companies (with optional search)
- `/api/dicts/customers?search=trai` - List customers (with optional search)
- `/api/dicts/categories` - List all categories
- `/api/dicts/costs` - List cost catalog with relationships

### Seeded Test Data
- **5 Kit Types**: PCR-WSSV, PCR-EHP, PCR-EMS, PCR-COMBO, ELISA-WSSV
- **5 Sample Types**: Water, Shrimp, Feed, Soil, Plankton
- **5 Companies**: CP, Việt Úc, Minh Phú, Cafatex, Thuận Phước
- **4 Customers**: CP-001, CP-002, VU-001, VU-002
- **4 Categories**: Disease, Water Quality, Nutrition, Environment
- **6 Cost Records**: Various kit/sample type combinations

## How to Test

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Endpoints (Both Users Can Access)

Open your browser or use curl/Postman:

**Kit Types:**
```
http://localhost:3000/api/dicts/kit-types
```
Expected: Array of 5 kit types

**Sample Types:**
```
http://localhost:3000/api/dicts/sample-types
```
Expected: Array of 5 sample types

**Companies (No Search):**
```
http://localhost:3000/api/dicts/companies
```
Expected: Array of 5 companies

**Companies (With Search):**
```
http://localhost:3000/api/dicts/companies?search=CP
```
Expected: Only CP Việt Nam

**Customers (No Search):**
```
http://localhost:3000/api/dicts/customers
```
Expected: Array of 4 customers with company info

**Customers (With Search):**
```
http://localhost:3000/api/dicts/customers?search=trai
```
Expected: All 4 customers (all have "Trại" in name)

**Categories:**
```
http://localhost:3000/api/dicts/categories
```
Expected: Array of 4 categories

**Cost Catalog:**
```
http://localhost:3000/api/dicts/costs
```
Expected: Array of 6 cost records with kit_type and sample_type relationships

### 3. Test Authentication

**Without Login:**
- Try accessing any endpoint without being logged in
- Expected: Should work (these are read-only reference data)

**With Editor Login:**
- Login as `editor@lab.local` / `Test123!`
- Access any endpoint
- Expected: Works perfectly

**With Viewer Login:**
- Login as `viewer@lab.local` / `Test123!`
- Access any endpoint
- Expected: Works perfectly (viewers can read dictionaries)

## Expected Response Format

All endpoints return:
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "string",
      "name": "string",
      ...
    }
  ]
}
```

Error responses:
```json
{
  "error": "Vietnamese error message"
}
```

## What's Next

These dictionary endpoints are **read-only** and accessible to all authenticated users. In the next tasks, we'll build:

- **Task 6**: Kit management APIs with RBAC (editors only can POST/PATCH)
- **Task 7**: Sample management APIs with RBAC (editors only can mutate)
- **Task 8**: Image upload with RBAC (editors only)

Those endpoints will demonstrate full RBAC enforcement where viewers get 403 Forbidden on mutations!

## Troubleshooting

### Empty data arrays?
- Check if seed script ran successfully
- Run the verification query in Supabase SQL Editor

### 500 errors?
- Check browser console for detailed error
- Check Supabase logs in dashboard
- Verify RLS policies allow SELECT for authenticated users

### Can't access endpoints?
- Make sure dev server is running
- Check you're logged in (for protected routes)
- Verify `.env.local` has correct Supabase credentials
