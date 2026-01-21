# ONIUM Admin Setup Instructions

## Creating an Admin User

To access the admin dashboard, you need to create an admin user account using Supabase Auth.

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard     
2. Navigate to **Authentication** > **Users**
3. Click **Add User** and create a new user with:
   - Email: `admin@onium.com` (or any email you prefer)
   - Password: Choose a secure password
4. Click **Create User**

Project Name: Onium
Project Password: Onium@Website12

### Option 2: Using SQL

Run this in your Supabase SQL Editor:

```sql
-- This will create an admin user
-- Make sure to change the email and password
SELECT auth.signup(
  email := 'admin@onium.com',
  password := 'YourSecurePassword123'
);
```

## Accessing the Admin Dashboard

1. Navigate to `/admin` on your website
2. Log in with the email and password you created
3. You'll be redirected to `/admin/dashboard`

## Admin Features

- **Products Management**: Create, edit, and delete products
- **Deals Management**: Manage the homepage deal slider images
- **Orders Management**: View and update customer orders

## Default Admin Credentials (if created via SQL above)

- Email: `admin@onium.com`
- Password: `YourSecurePassword123`

Remember to change these credentials after first login for security!
