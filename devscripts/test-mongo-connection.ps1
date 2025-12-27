# MongoDB Connection String Tester
# This helps diagnose MongoDB connection issues

Write-Host "🔍 MongoDB Connection Diagnostic" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$connectionString = Read-Host "Paste your MongoDB connection string here"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "❌ Connection string cannot be empty!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Analyzing connection string..." -ForegroundColor Yellow
Write-Host ""

# Parse the connection string
if ($connectionString -match 'mongodb\+srv://([^:]+):([^@]+)@([^/]+)/([^?]+)?') {
    $username = $matches[1]
    $password = $matches[2]
    $cluster = $matches[3]
    $database = if ($matches[4]) { $matches[4] } else { "(missing)" }
    
    Write-Host "✅ Connection string format looks valid" -ForegroundColor Green
    Write-Host ""
    Write-Host "Parsed components:" -ForegroundColor Cyan
    Write-Host "  Username: $username" -ForegroundColor White
    Write-Host "  Password: $($password.Substring(0, [Math]::Min(4, $password.Length)))****" -ForegroundColor White
    Write-Host "  Cluster: $cluster" -ForegroundColor White
    Write-Host "  Database: $database" -ForegroundColor White
    Write-Host ""
    
    if ($database -eq "(missing)") {
        Write-Host "⚠️  WARNING: Database name is missing!" -ForegroundColor Yellow
        Write-Host "   Your connection string should include a database name:" -ForegroundColor Yellow
        Write-Host "   mongodb+srv://username:password@cluster.mongodb.net/database?params" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "📋 Recommended format:" -ForegroundColor Cyan
    if ($database -eq "(missing)") {
        $recommended = "mongodb+srv://$username`:$password@$cluster/eternal-dog?retryWrites=true&w=majority"
    } else {
        $recommended = $connectionString
    }
    Write-Host $recommended -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🔧 Things to check in MongoDB Atlas:" -ForegroundColor Cyan
    Write-Host "1. Go to Database Access → Verify user '$username' exists" -ForegroundColor White
    Write-Host "2. Verify the password is correct" -ForegroundColor White
    Write-Host "3. Go to Network Access → Add IP Address (use 0.0.0.0/0 for development)" -ForegroundColor White
    Write-Host "4. Make sure you selected the correct cluster" -ForegroundColor White
    
} else {
    Write-Host "❌ Connection string format appears invalid" -ForegroundColor Red
    Write-Host ""
    Write-Host "Expected format:" -ForegroundColor Yellow
    Write-Host "mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority" -ForegroundColor White
    Write-Host ""
    Write-Host "Your connection string:" -ForegroundColor Yellow
    Write-Host $connectionString -ForegroundColor White
}

