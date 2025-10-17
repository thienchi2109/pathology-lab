// Database types for dictionary/catalog tables

export interface KitType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SampleType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  company_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostCatalog {
  id: string;
  kit_type_id: string | null;
  sample_type_id: string | null;
  cost_per_unit: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  kit_type?: KitType;
  sample_type?: SampleType;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}
