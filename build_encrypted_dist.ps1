# ==============================================================================
# Outpost Omega - Encrypted Standalone & Embed Distribution Bundler
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " OUTPOST OMEGA: ENCRYPTED BUNDLE BUILDER" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan

$workspaceDir = Get-Location
$distDir = Join-Path $workspaceDir "dist"
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

# Copy offline vendor libraries to dist folder
$threeSrc = Join-Path $workspaceDir "three.min.js"
$pakoSrc = Join-Path $workspaceDir "pako.min.js"
if (Test-Path $threeSrc) { Copy-Item -Path $threeSrc -Destination (Join-Path $distDir "three.min.js") -Force }
if (Test-Path $pakoSrc)  { Copy-Item -Path $pakoSrc  -Destination (Join-Path $distDir "pako.min.js")  -Force }

$indexPath = Join-Path $workspaceDir "index.html"
$stylePath = Join-Path $workspaceDir "style.css"
$gamePath = Join-Path $workspaceDir "game.js"

Write-Host "[1/5] Reading source files..." -ForegroundColor Gray
$htmlRaw = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
$cssRaw  = [System.IO.File]::ReadAllText($stylePath, [System.Text.Encoding]::UTF8)
$jsRaw   = [System.IO.File]::ReadAllText($gamePath,  [System.Text.Encoding]::UTF8)

Write-Host "[2/5] Extracting DOM template and assets..." -ForegroundColor Gray
$bodyMatch = [regex]::Match($htmlRaw, '(?s)<body[^>]*>(.*?)</body>')
$bodyContent = if ($bodyMatch.Success) { $bodyMatch.Groups[1].Value } else { $htmlRaw }
$bodyContent = [regex]::Replace($bodyContent, '(?i)<script\s+src=["'']game\.js["'']\s*></script>', '')

$titleMatch = [regex]::Match($htmlRaw, '(?i)<title>(.*?)</title>')
$pageTitle = if ($titleMatch.Success) { $titleMatch.Groups[1].Value } else { "Zombie Defender 3D - Outpost Omega" }

Write-Host "[3/5] Minifying and compressing code payload..." -ForegroundColor Gray
$combinedPayload = [PSCustomObject]@{
    html = $bodyContent
    css  = $cssRaw
    js   = $jsRaw
} | ConvertTo-Json -Compress

$payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($combinedPayload)

$memoryStream = New-Object System.IO.MemoryStream
$gzipStream = New-Object System.IO.Compression.GZipStream($memoryStream, [System.IO.Compression.CompressionMode]::Compress)
$gzipStream.Write($payloadBytes, 0, $payloadBytes.Length)
$gzipStream.Close()
$compressedBytes = $memoryStream.ToArray()
$memoryStream.Close()

Write-Host "[4/5] Applying multi-byte rolling cryptographic encryption..." -ForegroundColor Gray
$keyString = "OmegaDefenseSystem_AlphaCipher_99482XqL_2026"
$keyBytes = [System.Text.Encoding]::UTF8.GetBytes($keyString)
$encryptedBytes = New-Object byte[] $compressedBytes.Length

for ($i = 0; $i -lt $compressedBytes.Length; $i++) {
    $k = $keyBytes[$i % $keyBytes.Length]
    $encryptedBytes[$i] = [byte](($compressedBytes[$i] -bxor $k) -bxor (($i * 37 + 13) % 256))
}

$encryptedBase64 = [Convert]::ToBase64String($encryptedBytes)
Write-Host "      Original Size:   $("{0:N0}" -f $payloadBytes.Length) bytes" -ForegroundColor DarkGray
Write-Host "      Encrypted Size:  $("{0:N0}" -f $encryptedBase64.Length) chars" -ForegroundColor DarkGray

Write-Host "[5/5] Generating standalone encrypted package & embed files..." -ForegroundColor Gray

$runtimeLoader = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>$pageTitle</title>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <!-- Offline Local Priority with CDN Fallback -->
    <script src="three.min.js"></script>
    <script>if (typeof THREE === 'undefined') document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>');</script>
    <script src="pako.min.js"></script>
    <script>if (typeof pako === 'undefined') document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"><\/script>');</script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0f18; font-family: 'Rajdhani', sans-serif; color: #fff; }
        #omega-boot-screen {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: radial-gradient(circle at center, #0f172a 0%, #030712 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 999999; font-family: 'Share Tech Mono', monospace; text-align: center; padding: 20px;
        }
        .boot-shield {
            width: 70px; height: 70px; margin-bottom: 20px;
            border: 2px solid #00f0ff; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 25px rgba(0,240,255,0.4), inset 0 0 15px rgba(0,240,255,0.2);
            animation: pulseShield 1.5s infinite alternate; font-size: 28px;
        }
        @keyframes pulseShield { from { transform: scale(0.95); opacity: 0.8; } to { transform: scale(1.05); opacity: 1; filter: drop-shadow(0 0 10px #00f0ff); } }
        .boot-title { font-size: 22px; font-weight: 800; letter-spacing: 3px; color: #00f0ff; text-shadow: 0 0 12px rgba(0,240,255,0.6); margin-bottom: 6px; }
        .boot-subtitle { font-size: 11px; color: #94a3b8; letter-spacing: 2px; margin-bottom: 24px; text-transform: uppercase; }
        .boot-bar-box { width: 280px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; position: relative; margin-bottom: 12px; }
        .boot-bar-fill { width: 0%; height: 100%; background: linear-gradient(90deg, #00f0ff, #38bdf8, #818cf8); transition: width 0.2s ease-out; box-shadow: 0 0 10px #00f0ff; }
        .boot-log { font-size: 11px; color: #38bdf8; letter-spacing: 1px; min-height: 16px; }
    </style>
</head>
<body>
    <div id="omega-boot-screen">
        <div class="boot-shield">&#128737;</div>
        <div class="boot-title">OUTPOST OMEGA</div>
        <div class="boot-subtitle">CLASSIFIED DEFENSE ENGINE // SECURE BOOT</div>
        <div class="boot-bar-box"><div id="boot-fill" class="boot-bar-fill"></div></div>
        <div id="boot-log" class="boot-log">INITIALIZING HARDWARE GRID...</div>
    </div>

    <script>
    (function(){
        'use strict';
        // Anti-Inspection & DevTools Tamper Protections
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 123 || 
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || 
                (e.ctrlKey && e.keyCode === 85) || 
                (e.ctrlKey && e.keyCode === 83)) { 
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });

        // Security & Anti-Tampering
        window.addEventListener('devtoolschange', function(e) {
            console.warn("%c[OUTPOST OMEGA SECURITY] DEVTOOLS ACTIVITY DETECTED.", "color:#ef4444;font-size:14px;font-weight:bold;");
        });

        var _K = "$keyString";
        var _P = "$encryptedBase64";

        var logEl = document.getElementById('boot-log');
        var fillEl = document.getElementById('boot-fill');

        function updateProgress(pct, msg) {
            if (fillEl) fillEl.style.width = pct + '%';
            if (logEl) logEl.textContent = msg;
        }

        setTimeout(function() {
            updateProgress(35, "AUTHENTICATING SECURITY CERTS...");
            setTimeout(function() {
                updateProgress(65, "DECRYPTING TACTICAL ENGINE...");
                setTimeout(function() {
                    try {
                        var binaryStr = atob(_P);
                        var len = binaryStr.length;
                        var encryptedBytes = new Uint8Array(len);
                        for (var i = 0; i < len; i++) {
                            encryptedBytes[i] = binaryStr.charCodeAt(i);
                        }

                        var keyBytes = [];
                        for (var k = 0; k < _K.length; k++) keyBytes.push(_K.charCodeAt(k));

                        var compressed = new Uint8Array(len);
                        for (var j = 0; j < len; j++) {
                            var keyByte = keyBytes[j % keyBytes.length];
                            compressed[j] = (encryptedBytes[j] ^ ((j * 37 + 13) % 256)) ^ keyByte;
                        }

                        var decompressedJson = pako.inflate(compressed, { to: 'string' });
                        var payload = JSON.parse(decompressedJson);

                        updateProgress(90, "MOUNTING SUBSYSTEMS...");

                        var styleEl = document.createElement('style');
                        styleEl.textContent = payload.css;
                        document.head.appendChild(styleEl);

                        var bootScreen = document.getElementById('omega-boot-screen');
                        var container = document.createElement('div');
                        container.innerHTML = payload.html;
                        while (container.firstChild) {
                            document.body.appendChild(container.firstChild);
                        }

                        updateProgress(100, "GRID ONLINE // ENGAGING DEFENSES");

                        setTimeout(function() {
                            if (bootScreen && bootScreen.parentNode) {
                                bootScreen.style.transition = 'opacity 0.4s ease';
                                bootScreen.style.opacity = '0';
                                setTimeout(function() {
                                    bootScreen.parentNode.removeChild(bootScreen);
                                }, 400);
                            }
                            var scriptEl = document.createElement('script');
                            scriptEl.type = 'text/javascript';
                            scriptEl.textContent = payload.js;
                            document.body.appendChild(scriptEl);
                        }, 250);

                    } catch (err) {
                        console.error("[SECURE LOADER ERROR]", err);
                        updateProgress(100, "LOAD FAILED: PLEASE REFRESH");
                    }
                }, 100);
            }, 100);
        }, 100);
    })();
    </script>
</body>
</html>
"@

$distIndexPath = Join-Path $distDir "index.html"
[System.IO.File]::WriteAllText($distIndexPath, $runtimeLoader, [System.Text.Encoding]::UTF8)

$embedWrapper = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outpost Omega - Embedded Player</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
        .game-frame-wrapper {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
        }
        iframe {
            width: 100%; height: 100%; border: none; outline: none;
        }
    </style>
</head>
<body>
    <div class="game-frame-wrapper">
        <iframe src="index.html" allow="autoplay; fullscreen; pointer-lock" allowfullscreen></iframe>
    </div>
</body>
</html>
"@

$distEmbedPath = Join-Path $distDir "embed.html"
[System.IO.File]::WriteAllText($distEmbedPath, $embedWrapper, [System.Text.Encoding]::UTF8)

$embedSnippet = @"
<!-- ======================================================================= -->
<!-- OUTPOST OMEGA: 3D DEFENSE ENGINE - SECURE EMBED CODE                    -->
<!-- Paste this code into your website, blog, CMS, or portal HTML            -->
<!-- ======================================================================= -->

<div style="position: relative; width: 100%; max-width: 1200px; height: 750px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 0 35px rgba(0, 240, 255, 0.35); border: 1.5px solid rgba(0, 240, 255, 0.4); background: #0a0f18;">
    <iframe 
        src="index.html" 
        title="Outpost Omega 3D Defender" 
        width="100%" 
        height="100%" 
        style="border: none; width: 100%; height: 100%; display: block;" 
        allow="autoplay; fullscreen; pointer-lock" 
        allowfullscreen>
    </iframe>
</div>

<!-- Responsive 16:9 Aspect Ratio Embed Alternative (for Mobile/Tablets): -->
<!--
<div style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 0 30px rgba(0,240,255,0.3); border: 1px solid rgba(0,240,255,0.4); background: #0a0f18;">
    <iframe 
        src="index.html" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
        allow="autoplay; fullscreen; pointer-lock" 
        allowfullscreen>
    </iframe>
</div>
-->
"@

$distSnippetPath = Join-Path $distDir "embed_snippet.html"
[System.IO.File]::WriteAllText($distSnippetPath, $embedSnippet, [System.Text.Encoding]::UTF8)

$rootEmbedPath = Join-Path $workspaceDir "embed.html"
[System.IO.File]::WriteAllText($rootEmbedPath, $embedWrapper, [System.Text.Encoding]::UTF8)

Write-Host "=====================================================" -ForegroundColor Green
Write-Host " BUILD COMPLETE! DISTRIBUTABLE ASSETS GENERATED:" -ForegroundColor Green
Write-Host "  1. Standalone Encrypted Game:  dist\index.html" -ForegroundColor Yellow
Write-Host "  2. Responsive Embed Player:    dist\embed.html" -ForegroundColor Yellow
Write-Host "  3. HTML Iframe Embed Code:     dist\embed_snippet.html" -ForegroundColor Yellow
Write-Host "  4. Workspace Embed Preview:    embed.html" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Green
