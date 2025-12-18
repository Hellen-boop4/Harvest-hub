# Product Setup Module - Admin Access Guide

## What's the Error?

When trying to create a product, you're seeing:
```
Unexpected token '<', "<!DOCTYPE "...is not valid JSON
```

This means your user account doesn't have the `admin` role, and the Product Setup module requires admin access.

## How to Fix It

### Option 1: Use the Admin Setup Helper (Recommended)

1. **Register a user account**
   - Go to Login page
   - Click "Register" 
   - Create a new account with any username/password

2. **Go to Admin Setup**
   - Login with your account
   - Look for "Admin Setup" link in the top navigation bar
   - Enter your username and click "Promote to Admin"

3. **Try Creating a Product**
   - Go to "Products Setup" in the navigation
   - Click "New Product"
   - You should now see the form (not the "Admin Access Required" error)

### Option 2: Use Environment Variable (For Development)

If you're setting up locally for development:

1. **Create/Edit `.env` file** in the root directory:
   ```
   SEED_DEFAULT_ADMIN=true
   ```

2. **Restart the backend server**
   ```bash
   npm run dev
   ```

3. **Login with default admin credentials:**
   - Username: `admin`
   - Password: `admin`

4. **Go directly to Products Setup**

## What is the Admin Role?

The admin role is required for the **Product Setup module** because it's a critical administrative feature. Admins can:

- Create new loan and savings products
- Define product parameters (interest rates, contribution amounts, etc.)
- Manage product settings

Regular users can:
- Create farmer accounts from existing products
- Apply for loans through products
- View product details

## Product Setup Workflow

Once you're an admin:

1. **Create a Product**
   - Go to Products Setup → New Product
   - Choose Savings or Credit product type
   - Fill in product details:
     - **Savings**: Expected Contribution, Minimum Contribution
     - **Credit**: Interest Rate, Minimum/Maximum Loan Amount, Loan Term
   - Click "Create Product"

2. **Use the Product to Create Accounts**
   - Go to Farmer Profile
   - Scroll to "Quick Actions"
   - Click "Create Account" to auto-create an account based on product settings

3. **Monitor Dashboard**
   - Dashboard updates in real-time as products, accounts, and loans are created
   - Check Finance Dashboard for portfolio overview
   - View Loans Dashboard for active loan tracking

## Troubleshooting

### Still Getting Admin Error?
- Make sure you clicked "Promote to Admin" successfully in Admin Setup
- The success toast should appear at the bottom
- Try logging out and logging back in
- Clear browser cache and reload

### Product Not Appearing in ProductList?
- Check that socket.io is connected (no errors in browser console)
- Verify the product was created (check backend logs for `"Product saved successfully"`)
- Refresh the Products Setup page

### Need More Help?
Check the browser console (F12) for detailed error messages and backend logs.
