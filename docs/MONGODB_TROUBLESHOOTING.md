# MongoDB "Bad Auth" Error - Complete Troubleshooting Guide

## Current Error
```
✗ MongoDB connection error: bad auth : authentication failed
```

## Your Connection String (Should be in server/.env)
```
MONGO_URI=mongodb+srv://jheaven_db_user:SNef7yMmWuG7BneS@eternal-dog-cluster.wodhvzc.mongodb.net/eternal-dog?appName=eternal-dog-cluster
```

## Step-by-Step Fix

### ✅ STEP 1: Network Access (MOST COMMON ISSUE - 90% of cases)

**Even with correct credentials, MongoDB Atlas will reject connections if your IP isn't whitelisted.**

1. Go to: https://cloud.mongodb.com
2. Select your project
3. Click **"Network Access"** in the left sidebar
4. Click **"Add IP Address"** button
5. Click **"Allow Access from Anywhere"** button (or type `0.0.0.0/0`)
6. Click **"Confirm"**
7. **Wait 2-3 minutes** for changes to propagate

**Verify it worked:**
- You should see an entry like: `0.0.0.0/0` in your Network Access list
- Status should be "Active"

---

### ✅ STEP 2: Verify Database User

1. Go to: https://cloud.mongodb.com → **"Database Access"**
2. Find user: `jheaven_db_user`
3. Click **"Edit"** on that user
4. Check the password - it should be: `SNef7yMmWuG7BneS`

**If password is wrong:**
1. Click **"Edit Password"**
2. Enter new password: `SNef7yMmWuG7BneS`
3. Confirm password: `SNef7yMmWuG7BneS`
4. Click **"Update User"**

**Verify permissions:**
- User should have **"Read and write to any database"** permissions
- Or at minimum: **"Read and write"** to the `eternal-dog` database

---

### ✅ STEP 3: Get Fresh Connection String from Atlas

Sometimes Atlas connection strings are more reliable:

1. Go to: https://cloud.mongodb.com → **"Database"**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and **"Mongoose"**
5. Copy the connection string
6. Replace `<password>` with: `SNef7yMmWuG7BneS`
7. Add database name: Insert `/eternal-dog` before the `?`

**Example:**
```
mongodb+srv://jheaven_db_user:SNef7yMmWuG7BneS@eternal-dog-cluster.wodhvzc.mongodb.net/eternal-dog?appName=eternal-dog-cluster
```

---

### ✅ STEP 4: Update server/.env

Make sure your `server/.env` file has:

```env
MONGO_URI=mongodb+srv://jheaven_db_user:SNef7yMmWuG7BneS@eternal-dog-cluster.wodhvzc.mongodb.net/eternal-dog?appName=eternal-dog-cluster
```

**Common mistakes:**
- ❌ `WMONGO_URI=` (extra W)
- ❌ Missing password
- ❌ Missing database name
- ❌ Extra spaces or quotes

---

### ✅ STEP 5: Test Connection

Run the debug script:
```bash
cd server
node debug-mongo.js
```

Or restart your server:
```bash
npm run dev
```

---

## Still Not Working?

### Option A: Create a New Database User

1. Go to: Database Access → **"Add New Database User"**
2. Authentication: **"Password"**
3. Username: `eternal_dog_user` (or any name)
4. Password: Create a simple password (no special characters)
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**
7. Update your `.env` with the new username/password

### Option B: Reset User Password

1. Go to: Database Access
2. Click **"Edit"** on `jheaven_db_user`
3. Click **"Edit Password"**
4. Enter a new simple password (no special characters)
5. Update your `.env` file with the new password

### Option C: Check Cluster Status

1. Go to: Database → Your cluster
2. Make sure cluster is **"Running"** (not paused)
3. If paused, click **"Resume"**

---

## Quick Checklist

- [ ] Network Access has `0.0.0.0/0` added
- [ ] Network Access status is "Active"
- [ ] Database user `jheaven_db_user` exists
- [ ] Password matches: `SNef7yMmWuG7BneS`
- [ ] User has "Read and write to any database" permissions
- [ ] Cluster is running (not paused)
- [ ] `.env` file has correct `MONGO_URI` (no typos)
- [ ] Waited 2-3 minutes after Network Access changes
- [ ] Restarted server after making changes

---

## Expected Success Message

When it works, you should see:
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

---

## Still Stuck?

1. Double-check Network Access is set to `0.0.0.0/0`
2. Try creating a completely new database user with a simple password
3. Get a fresh connection string directly from Atlas
4. Make sure you're editing the correct project in MongoDB Atlas

