-- Seed test user accounts for development
-- Run this in Supabase SQL Editor (SQL Editor tab in your dashboard)

-- IMPORTANT: This creates auth users directly in the database
-- This is for DEVELOPMENT ONLY - in production, use Supabase Auth UI or API

-- Step 1: Create auth users with hashed passwords
-- Password for both: "Test123!" (bcrypt hashed)
-- Note: You'll need to reset passwords on first login or use the Dashboard to set them

DO $$
DECLARE
  editor_id uuid;
  viewer_id uuid;
BEGIN
  -- Create editor user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'editor@lab.local',
    crypt('Test123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test Editor"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO editor_id;

  -- Create viewer user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'viewer@lab.local',
    crypt('Test123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test Viewer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO viewer_id;

  -- Step 2: Create corresponding public.users records with roles
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES 
    (editor_id, 'editor@lab.local', 'Test Editor', 'editor', NOW(), NOW()),
    (viewer_id, 'viewer@lab.local', 'Test Viewer', 'viewer', NOW(), NOW());

  -- Step 3: Create identity records (required for email/password auth)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES 
    (gen_random_uuid(), editor_id, format('{"sub":"%s","email":"editor@lab.local"}', editor_id)::jsonb, 'email', NOW(), NOW(), NOW()),
    (gen_random_uuid(), viewer_id, format('{"sub":"%s","email":"viewer@lab.local"}', viewer_id)::jsonb, 'email', NOW(), NOW(), NOW());

  RAISE NOTICE 'Created editor user with ID: %', editor_id;
  RAISE NOTICE 'Created viewer user with ID: %', viewer_id;
END $$;

-- Verify users were created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  pu.full_name,
  pu.role
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.email IN ('editor@lab.local', 'viewer@lab.local');
