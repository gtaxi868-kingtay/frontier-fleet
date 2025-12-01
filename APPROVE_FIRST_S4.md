# How to Sign Up as S4 and Get Approved

## Option 1: Self-Approval (After Sign Up)

After you sign up as S4, you can approve yourself if you're the first S4:

1. **Sign up** with role "S4"
2. **Log in** (you'll see limited access)
3. Go to **Role Management** page (if accessible) OR
4. Run this SQL in Supabase SQL Editor to approve yourself:

```sql
-- Replace 'YOUR_EMAIL' with your actual email
UPDATE public.user_roles 
SET status = 'approved' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL'
) 
AND role = 'S4' 
AND status = 'pending';
```

## Option 2: Manual Approval (Recommended)

1. **Sign up** as S4
2. **Tell me your email** and I'll approve you via SQL
3. **Log in** and you'll have full S4 access
4. Use **Role Management** page to approve others

## Option 3: Use Role Management Page

If you can access the Role Management page after signing up (even with pending role), you can:
1. Sign up as S4
2. Log in
3. Navigate to `/role-management`
4. Find your own request in the "Pending Requests" table
5. Click "Approve" on your own request

## After Approval

Once your S4 role is approved:
- ✅ Full access to all inventory modules
- ✅ Can approve/reject role requests
- ✅ Can manage all inventory items
- ✅ Can view analytics and reports

**Sign up now and let me know your email - I'll approve you immediately!**

