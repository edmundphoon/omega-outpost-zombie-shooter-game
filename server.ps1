# ==============================================================================
# OUTPOST OMEGA - LOCAL TERMINAL WEB SERVER
# ==============================================================================
# Zero-dependency, high-performance static server built with .NET HttpListener.
# Serves game assets locally with proper MIME types, live request logging,
# and automatic browser launch.
# ==============================================================================

param(
    [int]$Port = 8080,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

# Clear terminal screen and show banner
Clear-Host
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host " 🧟 OUTPOST OMEGA: 3D DEFENSE ENGINE // LOCALHOST SERVER" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# MIME Type Mapping
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".wasm" = "application/wasm"
    ".txt"  = "text/plain; charset=utf-8"
    ".md"   = "text/markdown; charset=utf-8"
}

# Function to find available port
function Get-AvailablePort([int]$initialPort) {
    $currentPort = $initialPort
    while ($currentPort -lt ($initialPort + 50)) {
        try {
            $tcpListener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $currentPort)
            $tcpListener.Start()
            $tcpListener.Stop()
            return $currentPort
        } catch {
            $currentPort++
        }
    }
    return $initialPort
}

$activePort = Get-AvailablePort $Port
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$activePort/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "[ERROR] Failed to bind to $prefix. Try running with administrator privileges or specify another port: .\server.ps1 -Port 8081" -ForegroundColor Red
    exit 1
}

Write-Host " [STATUS]   Tactical Server Active" -ForegroundColor Green
Write-Host " [ROOT]     $root" -ForegroundColor Gray
Write-Host " [URL]      $prefix" -ForegroundColor Cyan
Write-Host " [DIST]     $($prefix)dist/index.html" -ForegroundColor DarkCyan
Write-Host " [EMBED]    $($prefix)embed.html" -ForegroundColor DarkCyan
Write-Host "-----------------------------------------------------------------------" -ForegroundColor Gray
Write-Host " 🚀 Press Ctrl+C in terminal to stop server." -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Launch default browser unless -NoBrowser switch is set
if (-not $NoBrowser) {
    try {
        Start-Process $prefix
    } catch {
        Write-Host "[INFO] Open your browser and navigate to: $prefix" -ForegroundColor Gray
    }
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or $rawUrl -eq "") {
            $rawUrl = "/index.html"
        }

        # Normalize relative path
        $relPath = $rawUrl.TrimStart("/").Replace("/", "\")
        $filePath = Join-Path $root $relPath

        # Security check: prevent directory traversal
        $fullPath = [System.IO.Path]::GetFullPath($filePath)
        if (-not $fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $msg = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden: Access Denied")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.Close()
            Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] 403 FORBIDDEN: $rawUrl" -ForegroundColor Red
            continue
        }

        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

            try {
                $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
                $response.ContentLength64 = $fileBytes.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
                Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] 200 OK: $rawUrl ($($fileBytes.Length) bytes)" -ForegroundColor Gray
            } catch {
                $response.StatusCode = 500
                Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] 500 ERROR: $rawUrl" -ForegroundColor Red
            }
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: Tactical Asset Missing ($rawUrl)")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] 404 NOT FOUND: $rawUrl" -ForegroundColor DarkYellow
        }

        $response.Close()
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
    Write-Host "`n[SERVER STOPPED] Local defense server shut down successfully." -ForegroundColor Yellow
}
