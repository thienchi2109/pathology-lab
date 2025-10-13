// Core domain types
export type KitStatus = 'in_stock' | 'assigned' | 'used' | 'void' | 'expired' | 'lost'
export type SampleStatus = 'draft' | 'done' | 'approved'
export type BillingStatus = 'unpaid' | 'invoiced' | 'paid' | 'eom_credit'
export type UserRole = 'editor' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface KitBatch {
  id: string
  batch_code: string
  kit_type: string
  supplier: string
  purchased_at: string
  unit_cost: number
  quantity: number
  expires_at?: string
}

export interface Kit {
  id: string
  batch_id: string
  kit_code: string
  status: KitStatus
  assigned_at?: string
  tested_at?: string
  note?: string
}

export interface CompanySnapshot {
  name: string
  region?: string
  province?: string
}

export interface CustomerSnapshot {
  name: string
  phone?: string
  region?: string
}

export interface Sample {
  id: string
  kit_id: string
  sample_code: string
  customer: string
  sample_type: string
  received_at: string
  collected_at?: string
  technician: string
  price: number
  status: SampleStatus
  billing_status: BillingStatus
  invoice_month?: string
  category_id: string
  company_snapshot: CompanySnapshot
  customer_snapshot: CustomerSnapshot
  sl_mau: number
  note?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface SampleResult {
  id: string
  sample_id: string
  metric_code: string
  metric_name: string
  value_num?: number
  value_text?: string
  unit: string
  ref_low?: number
  ref_high?: number
}

export interface SampleImage {
  id: string
  sample_id: string
  r2_key: string
  url: string
  width: number
  height: number
  size_bytes: number
  uploaded_by: string
  created_at: string
}

export interface LabRecord {
  record_id: string
  batch_code: string
  kit_code: string
  kit_status: KitStatus
  assigned_at?: string
  tested_at?: string
  sample_id?: string
  sample_code?: string
  customer?: string
  sample_type?: string
  received_at?: string
  technician?: string
  price?: number
  sample_status?: SampleStatus
  billing_status?: BillingStatus
  invoice_month?: string
  // Result metrics
  kq_wssv?: number
  kq_ehp?: number
  kq_ems?: number
  kq_tpd?: number
  kq_khuan?: number
  kq_mbv?: number
  kq_div1?: number
  kq_dang_khac?: number
  kq_vi_khuan_vi_nam?: number
  kq_tam_soat?: number
  cl_gan?: number
  kq_chung?: 'NHIỄM' | 'SẠCH'
}
