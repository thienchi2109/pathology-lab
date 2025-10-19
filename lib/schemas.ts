import { z } from "zod";

// Sample form validation schema
export const sampleFormSchema = z.object({
  // Kit Selection
  assignNext: z.boolean(),
  kit_id: z.string().optional(),
  kit_type_id: z.string().optional(),

  // Basic Information
  customer: z.string().min(1, "Khách hàng không được để trống").trim(),
  sample_type: z.string().min(1, "Loại mẫu không được để trống").trim(),
  received_at: z.string().min(1, "Ngày nhận không được để trống"),
  collected_at: z.string().optional(),
  technician: z.string().min(1, "Kỹ thuật viên không được để trống").trim(),
  
  // Pricing & Status
  price: z.string().min(1, "Giá không được để trống").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    { message: "Giá phải ≥ 0" }
  ),
  status: z.enum(['draft', 'done', 'approved'] as const),
  billing_status: z.enum(['unpaid', 'invoiced', 'paid', 'eom_credit'] as const),
  invoice_month: z.string().optional(),
  category_id: z.string().min(1, "Vui lòng chọn danh mục"),
  
  // Company Information
  company_name: z.string().min(1, "Tên công ty không được để trống").trim(),
  company_region: z.string().optional(),
  company_province: z.string().optional(),
  
  // Customer Information
  customer_name: z.string().min(1, "Tên khách hàng không được để trống").trim(),
  customer_phone: z.string().optional(),
  customer_region: z.string().optional(),
  
  // Additional Fields
  sl_mau: z.string().min(1, "Số lượng mẫu không được để trống").refine(
    (val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1;
    },
    { message: "Số lượng mẫu phải > 0" }
  ),
  note: z.string().optional(),
}).refine(
  (data) => {
    // Kit selection validation
    if (data.assignNext && !data.kit_type_id) {
      return false;
    }
    if (!data.assignNext && !data.kit_id) {
      return false;
    }
    return true;
  },
  {
    message: "Vui lòng chọn kit hoặc loại kit",
    path: ["kit_type_id"], // This will show the error on kit_type_id field
  }
).refine(
  (data) => {
    // Invoice month validation for specific billing statuses
    if ((data.billing_status === 'invoiced' || data.billing_status === 'eom_credit') && !data.invoice_month) {
      return false;
    }
    return true;
  },
  {
    message: "Vui lòng chọn tháng hóa đơn",
    path: ["invoice_month"],
  }
);

export type SampleFormData = z.infer<typeof sampleFormSchema>;

// Dictionary types for form options
export interface KitType {
  id: string;
  name: string;
  default_sl_mau?: number;
}

export interface SampleType {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}