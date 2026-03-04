param(
    [string]$FrontendUrl = "http://localhost:15173",
    [string]$BackendDocsUrl = "http://localhost:18000/docs",
    [string]$MediaUrl = "http://localhost:11984",
    [string]$LoginUrl = "http://localhost:18000/api/v1/auth/login"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Write-Result {
    param(
        [string]$Label,
        [bool]$Ok,
        [string]$Detail
    )
    $status = if ($Ok) { "PASS" } else { "FAIL" }
    Write-Host ("[{0}] {1} - {2}" -f $status, $Label, $Detail)
}

function Read-EnvValue {
    param(
        [string]$Path,
        [string]$Key
    )
    if (-not (Test-Path $Path)) { return $null }
    $line = Get-Content $Path | Where-Object { $_ -match ("^\s*" + [regex]::Escape($Key) + "=") } | Select-Object -First 1
    if (-not $line) { return $null }
    return ($line -split "=", 2)[1].Trim()
}

$overallOk = $true

try {
    $null = & docker version 2>$null
    Write-Result -Label "Docker daemon" -Ok $true -Detail "reachable"
}
catch {
    Write-Result -Label "Docker daemon" -Ok $false -Detail "not reachable"
    exit 1
}

try {
    $psOutput = & docker compose ps --format json
    if (-not $psOutput) { throw "No compose services found" }
    $services = $psOutput | ConvertFrom-Json
    foreach ($svc in $services) {
        $isUp = $svc.State -eq "running"
        if (-not $isUp) { $overallOk = $false }
        Write-Result -Label ("Container " + $svc.Service) -Ok $isUp -Detail $svc.State
    }
}
catch {
    $overallOk = $false
    Write-Result -Label "Compose status" -Ok $false -Detail $_.Exception.Message
}

function Check-Http {
    param(
        [string]$Label,
        [string]$Url
    )
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
        $ok = $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
        if (-not $ok) { $script:overallOk = $false }
        Write-Result -Label $Label -Ok $ok -Detail ("HTTP " + $response.StatusCode)
    }
    catch {
        $script:overallOk = $false
        Write-Result -Label $Label -Ok $false -Detail $_.Exception.Message
    }
}

Check-Http -Label "Frontend" -Url $FrontendUrl
Check-Http -Label "Backend docs" -Url $BackendDocsUrl
Check-Http -Label "Media service" -Url $MediaUrl

$envPath = Join-Path $root ".env"
$adminEmail = Read-EnvValue -Path $envPath -Key "BOOTSTRAP_ADMIN_EMAIL"
$adminPassword = Read-EnvValue -Path $envPath -Key "BOOTSTRAP_ADMIN_PASSWORD"

if ($adminEmail -and $adminPassword) {
    try {
        $body = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri $LoginUrl -Method Post -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 15
        $ok = $response.StatusCode -eq 200
        if (-not $ok) { $overallOk = $false }
        Write-Result -Label "Auth login" -Ok $ok -Detail ("HTTP " + $response.StatusCode + " (" + $adminEmail + ")")
    }
    catch {
        $overallOk = $false
        Write-Result -Label "Auth login" -Ok $false -Detail $_.Exception.Message
    }
}
else {
    $overallOk = $false
    Write-Result -Label "Auth login" -Ok $false -Detail "Missing BOOTSTRAP_ADMIN_EMAIL or BOOTSTRAP_ADMIN_PASSWORD in .env"
}

if ($overallOk) {
    Write-Host ""
    Write-Host "System health check passed."
    exit 0
}

Write-Host ""
Write-Host "System health check failed."
exit 1
