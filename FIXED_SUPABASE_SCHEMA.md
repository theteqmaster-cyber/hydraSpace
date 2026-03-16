# Fixed Supabase Schema for HydraSpace

## The Issue
The error you're seeing is because Row Level Security (RLS) policies are enabled but authentication isn't fully working yet. Here are the fixes:

## Option 1: Temporarily Disable RLS (Quick Fix)
Run this in Supabase SQL Editor to temporarily disable RLS while testing:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
```

## Option 2: Fixed RLS Policies (Recommended)
Replace your existing policies with these corrected ones:

```sql
-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own courses" ON courses;
DROP POLICY IF EXISTS "Users can create own courses" ON courses;
DROP POLICY IF EXISTS "Users can update own courses" ON courses;
DROP POLICY IF EXISTS "Users can delete own courses" ON courses;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can view shared notes" ON notes;
DROP POLICY IF EXISTS "Users can create own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can create own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view own timetable" ON timetable_entries;
DROP POLICY IF EXISTS "Users can create own timetable" ON timetable_entries;
DROP POLICY IF EXISTS "Users can update own timetable" ON timetable_entries;
DROP POLICY IF EXISTS "Users can delete own timetable" ON timetable_entries;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;

-- Now create corrected policies
-- Users table policies (more permissive for signup)
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for users based on user_id" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update for users based on user_id" ON users FOR UPDATE USING (auth.uid() = id);

-- Courses policies
CREATE POLICY "Enable insert for authenticated users" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read for users based on user_id" ON courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable update for users based on user_id" ON courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON courses FOR DELETE USING (auth.uid() = user_id);

-- Notes policies (allow viewing shared notes)
CREATE POLICY "Enable insert for authenticated users" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read for users based on user_id" ON notes FOR SELECT USING (auth.uid() = user_id OR is_shared = true);
CREATE POLICY "Enable update for users based on user_id" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Calendar events policies
CREATE POLICY "Enable insert for authenticated users" ON calendar_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read for users based on user_id" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable update for users based on user_id" ON calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Timetable policies
CREATE POLICY "Enable insert for authenticated users" ON timetable_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read for users based on user_id" ON timetable_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable update for users based on user_id" ON timetable_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON timetable_entries FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Enable insert for authenticated users" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read for users based on user_id" ON reports FOR SELECT USING (auth.uid() = reporter_id);
```

## Option 3: Check Environment Variables
Make sure your `.env.local` file has the correct Supabase URL and keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Quick Test
After applying the fix, try signing up again. If you still get errors, check the Supabase logs for the exact error message.

## Most Likely Issue
The most common issue is that the `users` table policy is too restrictive during signup. The fixed policies above allow anyone to insert a user record (which is needed for signup) but restrict read/update/delete to the actual user.

Try Option 2 first as it's the proper long-term fix!
