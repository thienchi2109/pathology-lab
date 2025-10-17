-- Seed dictionary/catalog data for testing
-- Run this in Supabase SQL Editor

-- Kit Types
INSERT INTO kit_types (code, name, description) VALUES
  ('PCR-WSSV', 'PCR WSSV Detection Kit', 'Kit phát hiện virus đốm trắng'),
  ('PCR-EHP', 'PCR EHP Detection Kit', 'Kit phát hiện vi bào tử gan tụy'),
  ('PCR-EMS', 'PCR EMS Detection Kit', 'Kit phát hiện hội chứng hoại tử gan tụy cấp'),
  ('PCR-COMBO', 'PCR Combo Kit', 'Kit phát hiện đa bệnh'),
  ('ELISA-WSSV', 'ELISA WSSV Kit', 'Kit ELISA phát hiện WSSV')
ON CONFLICT (code) DO NOTHING;

-- Sample Types
INSERT INTO sample_types (code, name, description) VALUES
  ('WATER', 'Nước ao', 'Mẫu nước ao nuôi'),
  ('SHRIMP', 'Tôm', 'Mẫu tôm'),
  ('FEED', 'Thức ăn', 'Mẫu thức ăn'),
  ('SOIL', 'Đất đáy', 'Mẫu đất đáy ao'),
  ('PLANKTON', 'Tảo', 'Mẫu tảo')
ON CONFLICT (code) DO NOTHING;

-- Companies
INSERT INTO companies (code, name, address, phone) VALUES
  ('CP', 'CP Việt Nam', 'TP. Hồ Chí Minh', '0281234567'),
  ('VIET-UC', 'Việt Úc', 'Cần Thơ', '0292123456'),
  ('MINH-PHU', 'Minh Phú', 'Cà Mau', '0293123456'),
  ('CAFATEX', 'Cafatex', 'Sóc Trăng', '0299123456'),
  ('THUAN-PHUOC', 'Thuận Phước', 'Bến Tre', '0275123456')
ON CONFLICT (code) DO NOTHING;

-- Categories
INSERT INTO categories (code, name, description) VALUES
  ('DISEASE', 'Bệnh học', 'Xét nghiệm bệnh'),
  ('WATER-QUALITY', 'Chất lượng nước', 'Phân tích nước'),
  ('NUTRITION', 'Dinh dưỡng', 'Phân tích dinh dưỡng'),
  ('ENVIRONMENT', 'Môi trường', 'Phân tích môi trường')
ON CONFLICT (code) DO NOTHING;

-- Get IDs for cost catalog (we need to query them)
DO $$
DECLARE
  kit_wssv_id uuid;
  kit_ehp_id uuid;
  kit_ems_id uuid;
  sample_water_id uuid;
  sample_shrimp_id uuid;
BEGIN
  -- Get kit type IDs
  SELECT id INTO kit_wssv_id FROM kit_types WHERE code = 'PCR-WSSV';
  SELECT id INTO kit_ehp_id FROM kit_types WHERE code = 'PCR-EHP';
  SELECT id INTO kit_ems_id FROM kit_types WHERE code = 'PCR-EMS';
  
  -- Get sample type IDs
  SELECT id INTO sample_water_id FROM sample_types WHERE code = 'WATER';
  SELECT id INTO sample_shrimp_id FROM sample_types WHERE code = 'SHRIMP';

  -- Cost Catalog
  INSERT INTO cost_catalog (kit_type_id, sample_type_id, cost_per_unit, effective_from) VALUES
    (kit_wssv_id, sample_water_id, 150000, '2024-01-01'),
    (kit_wssv_id, sample_shrimp_id, 180000, '2024-01-01'),
    (kit_ehp_id, sample_water_id, 160000, '2024-01-01'),
    (kit_ehp_id, sample_shrimp_id, 190000, '2024-01-01'),
    (kit_ems_id, sample_water_id, 170000, '2024-01-01'),
    (kit_ems_id, sample_shrimp_id, 200000, '2024-01-01')
  ON CONFLICT DO NOTHING;
END $$;

-- Customers (linked to companies)
DO $$
DECLARE
  cp_id uuid;
  viet_uc_id uuid;
BEGIN
  SELECT id INTO cp_id FROM companies WHERE code = 'CP';
  SELECT id INTO viet_uc_id FROM companies WHERE code = 'VIET-UC';

  INSERT INTO customers (code, name, company_id, phone, email, address) VALUES
    ('CP-001', 'Trại tôm CP Bến Tre', cp_id, '0901234567', 'bentre@cp.vn', 'Bến Tre'),
    ('CP-002', 'Trại tôm CP Cà Mau', cp_id, '0901234568', 'camau@cp.vn', 'Cà Mau'),
    ('VU-001', 'Trại tôm Việt Úc 1', viet_uc_id, '0902345678', 'trai1@vietuc.vn', 'Cần Thơ'),
    ('VU-002', 'Trại tôm Việt Úc 2', viet_uc_id, '0902345679', 'trai2@vietuc.vn', 'Sóc Trăng')
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Verify
SELECT 'Kit Types' as table_name, COUNT(*) as count FROM kit_types
UNION ALL
SELECT 'Sample Types', COUNT(*) FROM sample_types
UNION ALL
SELECT 'Companies', COUNT(*) FROM companies
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Cost Catalog', COUNT(*) FROM cost_catalog;
