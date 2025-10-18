# Form Components

## KitBatchForm

A form component for creating kit batches with bulk kit generation.

### Features

- **Validation**: Client-side validation with real-time error feedback
- **Max Quantity**: Enforces maximum 100 kits per batch
- **Date Validation**: Ensures expiration date is after purchase date
- **Kit Type Selection**: Loads kit types from API
- **Error Handling**: Displays user-friendly error messages in Vietnamese
- **Success Feedback**: Shows toast notification on successful creation
- **Auto-reset**: Clears form when sheet closes

### Usage

```tsx
import { KitBatchForm } from "@/components/forms";

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    // Refresh data or perform other actions
    console.log("Kit batch created successfully");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Add Kit Batch
      </Button>
      
      <KitBatchForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

### Props

- `open` (boolean): Controls the visibility of the form sheet
- `onOpenChange` (function): Callback when the sheet open state changes
- `onSuccess` (function, optional): Callback when kit batch is successfully created

### Form Fields

1. **Mã lô** (Batch Code) - Required
   - Unique identifier for the batch
   - Example: LOT-2024-001

2. **Loại kit** (Kit Type) - Required
   - Dropdown selection from active kit types
   - Loaded from `/api/dicts/kit-types`

3. **Nhà cung cấp** (Supplier) - Required
   - Name of the supplier

4. **Ngày mua** (Purchase Date) - Required
   - Date when kits were purchased

5. **Đơn giá** (Unit Cost) - Required
   - Cost per kit in VNĐ
   - Must be greater than 0

6. **Số lượng** (Quantity) - Required
   - Number of kits to create (1-100)
   - Generates individual kit records with unique codes

7. **Ngày hết hạn** (Expiration Date) - Optional
   - Must be after purchase date if provided

8. **Ghi chú** (Note) - Optional
   - Additional notes about the batch

### Validation Rules

- Batch code cannot be empty
- Kit type must be selected
- Supplier cannot be empty
- Purchase date is required
- Unit cost must be greater than 0
- Quantity must be between 1 and 100
- Expiration date must be after purchase date (if provided)

### API Integration

The form submits to `/api/kits/bulk-create` with the following payload:

```typescript
{
  batch_code: string;
  kit_type_id: string;
  supplier: string;
  purchased_at: string; // YYYY-MM-DD
  unit_cost: number;
  quantity: number;
  expires_at: string | null; // YYYY-MM-DD
  note: string | null;
}
```

### Error Messages

All error messages are in Vietnamese:

- "Mã lô không được để trống" - Batch code is required
- "Vui lòng chọn loại kit" - Kit type must be selected
- "Nhà cung cấp không được để trống" - Supplier is required
- "Ngày mua không được để trống" - Purchase date is required
- "Đơn giá phải lớn hơn 0" - Unit cost must be greater than 0
- "Số lượng phải ≥ 1" - Quantity must be at least 1
- "Số lượng quá lớn (tối đa 100)" - Quantity exceeds maximum of 100
- "Ngày hết hạn phải sau ngày mua" - Expiration date must be after purchase date
- "Mã lô đã tồn tại" - Batch code already exists (409 error)
- "Không thể tải danh sách loại kit" - Failed to load kit types

### Success Behavior

On successful creation:
1. Shows success toast with count of created kits
2. Closes the form sheet
3. Calls the `onSuccess` callback (if provided)
4. Resets form fields

### Example Integration

See `app/dashboard/page.tsx` for a complete example of integrating the KitBatchForm component.
