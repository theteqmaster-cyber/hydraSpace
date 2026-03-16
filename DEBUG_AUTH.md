# Debug Auth Issue

## The Problem
- `auth.users` table has the user (Supabase authentication)
- Your `users` table is empty (your custom table)
- The app looks in your `users` table, not `auth.users`

## Quick Solution: Check What Exists

Run these queries to see what's there:

```sql
-- Check if user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'test@hydraspace.com';

-- Check if user exists in your users table  
SELECT id, email, created_at FROM users WHERE email = 'test@hydraspace.com';

-- Check all users in auth.users
SELECT email, created_at FROM auth.users LIMIT 5;

-- Check all users in your users table
SELECT email, created_at FROM users LIMIT 5;
```

## Fix 1: Copy from auth.users to users table

```sql
-- Get the auth user ID first
SELECT id FROM auth.users WHERE email = 'test@hydraspace.com';

-- Then insert into your users table (replace the UUID)
INSERT INTO users (
  id,
  email,
  name,
  university,
  created_at,
  updated_at
) VALUES (
  'the-uuid-from-above', -- Use the actual ID from auth.users
  'test@hydraspace.com',
  'Test Student', 
  'National University of Science and Technology',
  NOW(),
  NOW()
);
```

## Fix 2: Create Both Tables at Once

```sql
-- Create auth user first
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) 
SELECT 
  (SELECT instance_id FROM auth.instances LIMIT 1),
  gen_random_uuid(),
  'authenticated',
  'authenticated', 
  'test2@hydraspace.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Test Student 2", "university": "NUST"}'
RETURNING id;

-- Then create user profile (use the returned ID)
INSERT INTO users (
  id,
  email,
  name,
  university,
  created_at,
  updated_at
) VALUES (
  'the-returned-uuid-above',
  'test2@hydraspace.com', 
  'Test Student 2',
  'NUST',
  NOW(),
  NOW()
);
```

## Fix 3: Temporary Bypass (Easiest for Testing)

Just insert into your users table and modify the code to use it:

```sql
INSERT INTO users (
  id,
  email,
  name,
  university,
  created_at,
  updated_at
) VALUES (
  'test-user-id-123',
  'test@hydraspace.com',
  'Test Student',
  'NUST', 
  NOW(),
  NOW()
);
```

Then I can modify the auth code to use this test user directly.

## What to Try First
1. Run the "Check What Exists" queries
2. Tell me what you see
3. I'll give you the exact fix based on the results
