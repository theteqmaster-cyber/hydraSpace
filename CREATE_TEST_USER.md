# Create Test User Manually

## Step 1: Create Auth User
Run this in Supabase SQL Editor first:

```sql
-- Create auth user (this creates the authentication record)
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
  last_sign_in_at,
  raw_user_meta_data
) 
SELECT 
  'your-instance-id', -- Replace with your actual instance_id
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@hydraspace.com',
  crypt('password123', gen_salt('bf')), -- Simple password hash
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Test Student", "university": "National University of Science and Technology"}';
```

## Step 2: Get Instance ID
If you don't know your instance_id, run this:

```sql
SELECT instance_id FROM auth.instances LIMIT 1;
```

## Step 3: Create User Profile
Then create the user profile in your users table:

```sql
-- Create user profile (replace the UUID with the one from step 1)
INSERT INTO users (
  id,
  email,
  name,
  university,
  created_at,
  updated_at
) VALUES (
  'the-uuid-from-step-1', -- Use the actual UUID generated
  'test@hydraspace.com',
  'Test Student',
  'National University of Science and Technology',
  NOW(),
  NOW()
);
```

## Step 4: Test Login
Use these credentials in the app:
- **Email:** test@hydraspace.com
- **Password:** password123

## Alternative: Simpler Method
If the above is too complex, try this simpler approach:

```sql
-- Direct user profile creation (bypass auth for testing)
INSERT INTO users (
  id,
  email,
  name,
  university,
  created_at,
  updated_at
) VALUES (
  '12345678-1234-1234-1234-123456789012', -- Fixed UUID
  'test@hydraspace.com',
  'Test Student',
  'National University of Science and Technology',
  NOW(),
  NOW()
);
```

Then modify your auth check temporarily to allow this test user.

## Quick Test
After creating the user, try logging in with:
- Email: test@hydraspace.com
- Password: password123

If it doesn't work, we can modify the auth flow to accept this test user without full Supabase auth.
