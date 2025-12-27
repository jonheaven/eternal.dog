# MongoDB Password URL Encoder
# Usage: .\encode-mongo-password.ps1

Add-Type -AssemblyName System.Web

Write-Host "🔐 MongoDB Password URL Encoder" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for password
$password = Read-Host "Enter your MongoDB password"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "❌ Password cannot be empty!" -ForegroundColor Red
    exit 1
}

# URL encode the password
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)

Write-Host ""
Write-Host "✅ Encoded Password:" -ForegroundColor Green
Write-Host $encodedPassword -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 Use this in your MONGO_URI:" -ForegroundColor Cyan
Write-Host ""
Write-Host "mongodb+srv://username:$encodedPassword@cluster.mongodb.net/database?retryWrites=true&w=majority" -ForegroundColor White
Write-Host ""

Write-Host "💡 Copy the ENTIRE connection string above and replace your MONGO_URI in server/.env" -ForegroundColor Yellow

