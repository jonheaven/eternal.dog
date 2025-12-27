# MongoDB Connection String Setup

## Common Issues with MongoDB Authentication

The "bad auth : authentication failed" error usually occurs when special characters in your MongoDB password aren't properly URL-encoded in the connection string.

## MongoDB Connection String Format

The connection string should be in this format:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## URL Encoding Special Characters

If your MongoDB password contains any special characters, you **must** URL-encode them:

| Character | URL-Encoded |
|-----------|-------------|
| `@`       | `%40`       |
| `#`       | `%23`       |
| `:`       | `%3A`       |
| `/`       | `%2F`       |
| `?`       | `%3F`       |
| `&`       | `%26`       |
| `=`       | `%3D`       |
| `%`       | `%25`       |
| ` ` (space)| `%20`       |
| `+`       | `%2B`       |

## Examples

### Example 1: Password with `@` symbol
If your password is `myP@ssw0rd`:
```
MONGO_URI=mongodb+srv://username:myP%40ssw0rd@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Example 2: Password with `#` symbol
If your password is `myP#ssw0rd`:
```
MONGO_URI=mongodb+srv://username:myP%23ssw0rd@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Example 3: Password with multiple special characters
If your password is `P@ss#w0rd!`:
```
MONGO_URI=mongodb+srv://username:P%40ss%23w0rd%21@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Quick Fix Steps

1. **Copy your MongoDB connection string** from MongoDB Atlas (or your MongoDB provider)

2. **Check if your password has special characters** - look for: `@`, `#`, `:`, `/`, `?`, `&`, `=`, `%`, spaces

3. **URL-encode the password**:
   - Option A: Use an online URL encoder (search "URL encode")
   - Option B: Use PowerShell: `[System.Web.HttpUtility]::UrlEncode("your_password")`

4. **Replace the password in your connection string** with the URL-encoded version

5. **Add to `.env` file**:
   ```
   MONGO_URI=your_encoded_connection_string_here
   ```

## PowerShell URL Encoding Example

If you're using PowerShell, you can encode your password:

```powershell
[System.Web.HttpUtility]::UrlEncode("your_password_here")
```

Or for the entire connection string, encode just the password part manually.

## Testing Your Connection String

After updating your `.env` file, restart your server:
```bash
npm run dev
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

If you still get authentication errors, double-check:
- ✅ Username is correct
- ✅ Password is properly URL-encoded
- ✅ Database name is correct
- ✅ Network access is allowed in MongoDB Atlas (if using Atlas)
- ✅ IP whitelist includes your IP (0.0.0.0/0 for all IPs in development)

## MongoDB Atlas Setup

If using MongoDB Atlas:
1. Go to **Database Access** → Create/Edit user
2. Ensure user has proper permissions
3. Go to **Network Access** → Add IP Address (use `0.0.0.0/0` for development)
4. Copy connection string from **Database** → Connect → Drivers
5. Replace `<password>` with your actual password (URL-encoded if needed)

