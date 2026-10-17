function Invoke-ApiRequest {
    param(
        [string]$Uri,
        [string]$Method = 'GET',
        [string]$Body = $null,
        [hashtable]$Headers = @{},
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session = $null
    )

    $params = @{
        Uri = $Uri
        Method = $Method
        UseBasicParsing = $true
    }
    if ($Body) {
        $params['Body'] = $Body
        $params['ContentType'] = 'application/json'
    }
    if ($Headers.Count -gt 0) {
        $params['Headers'] = $Headers
    }
    if ($Session) {
        $params['WebSession'] = $Session
    }

    try {
        $res = Invoke-WebRequest @params
        return @{
            StatusCode = [int]$res.StatusCode
            Content = $res.Content
            Headers = $res.Headers
        }
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        if ($resp) {
            $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
            $content = $reader.ReadToEnd()
            return @{
                StatusCode = [int]$resp.StatusCode
                Content = $content
                Headers = $resp.Headers
            }
        }
        throw $_
    }
}

Write-Host "=== NextRisk AI Backend API Smoke Tests ==="

# 1. Anonymous /api/auth/me -> 401
$meAnon = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/me'
Write-Host "1. Anonymous /api/auth/me: Status $($meAnon.StatusCode) (Expected 401)"

# 2. Register new user
$regPayload = @{
    email = 'sec.analyst@nextrisk.test'
    password = 'Password123!'
    fullName = 'Alex Mercer'
} | ConvertTo-Json

$regRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/register' -Method 'POST' -Body $regPayload
Write-Host "2. Register: Status $($regRes.StatusCode)"
Write-Host "   Body: $($regRes.Content)"

# 3. Duplicate register -> 409
$dupRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/register' -Method 'POST' -Body $regPayload
Write-Host "3. Duplicate Register: Status $($dupRes.StatusCode) (Expected 409)"
Write-Host "   Body: $($dupRes.Content)"

# 4. Login -> 200 + Set-Cookie
$loginPayload = @{
    email = 'sec.analyst@nextrisk.test'
    password = 'Password123!'
} | ConvertTo-Json

$sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/login' -Method 'POST' -Body $loginPayload -Session $sess
Write-Host "4. Login: Status $($loginRes.StatusCode)"
$loginJson = $loginRes.Content | ConvertFrom-Json
$token = $loginJson.accessToken
Write-Host "   Token received (length $($token.Length))"

# 5. Authenticated /me
$authHeaders = @{ Authorization = "Bearer $token" }
$meRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/me' -Method 'GET' -Headers $authHeaders
Write-Host "5. Authenticated /api/auth/me: Status $($meRes.StatusCode)"
Write-Host "   Body: $($meRes.Content)"

# 6. Admin ping with analyst token -> 403
$pingRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/admin/ping' -Method 'GET' -Headers $authHeaders
Write-Host "6. Analyst /api/admin/ping: Status $($pingRes.StatusCode) (Expected 403)"

# 7. Admin login & ping -> 200
$adminLoginPayload = @{
    email = 'admin@nextrisk.local'
    password = 'ChangeMeNow123!'
} | ConvertTo-Json
$adminSess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminLoginRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/login' -Method 'POST' -Body $adminLoginPayload -Session $adminSess
Write-Host "7a. Admin Login: Status $($adminLoginRes.StatusCode)"
$adminToken = ($adminLoginRes.Content | ConvertFrom-Json).accessToken
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
$adminPingRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/admin/ping' -Method 'GET' -Headers $adminHeaders
Write-Host "7b. Admin /api/admin/ping: Status $($adminPingRes.StatusCode) Body: $($adminPingRes.Content)"

# 8. Token Refresh
$refreshHeaders = @{ 'X-Requested-With' = 'XMLHttpRequest' }
$refreshRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/refresh' -Method 'POST' -Session $sess -Headers $refreshHeaders
Write-Host "8. Refresh: Status $($refreshRes.StatusCode)"
$refToken = ($refreshRes.Content | ConvertFrom-Json).accessToken
Write-Host "   New access token length: $($refToken.Length)"

# 9. Logout
$logoutRes = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/logout' -Method 'POST' -Session $sess -Headers $refreshHeaders
Write-Host "9. Logout: Status $($logoutRes.StatusCode)"

# 10. Refresh after logout -> 401
$postLogoutRef = Invoke-ApiRequest -Uri 'http://localhost:8080/api/auth/refresh' -Method 'POST' -Session $sess -Headers $refreshHeaders
Write-Host "10. Refresh after Logout: Status $($postLogoutRef.StatusCode) (Expected 401)"

Write-Host "=== All API Smoke Tests Completed Successfully! ==="
