
-- Check existing policies on both tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('posts', 'users')
ORDER BY tablename, policyname;

-- Also check if RLS is enabled on both tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('posts', 'users');
