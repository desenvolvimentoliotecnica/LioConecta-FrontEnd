# Pack UniLio SCORM demo fixture — imsmanifest.xml at ZIP root
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDir = Join-Path $root 'unilio-scorm-demo'
$zipPath = Join-Path $root 'unilio-scorm-demo.zip'

if (-not (Test-Path $sourceDir)) {
    throw "Source folder not found: $sourceDir"
}

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$staging = Join-Path ([System.IO.Path]::GetTempPath()) ("unilio-scorm-pack-" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $staging -Force | Out-Null

try {
    Get-ChildItem -Path $sourceDir -Recurse -File |
        Where-Object { $_.Name -ne '_planner-task.json' } |
        ForEach-Object {
            $relative = $_.FullName.Substring($sourceDir.Length).TrimStart('\', '/')
            $dest = Join-Path $staging $relative
            $destDir = Split-Path $dest -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item $_.FullName $dest -Force
        }

    Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $zipPath -CompressionLevel Optimal
    $size = (Get-Item $zipPath).Length
    Write-Host "Created $zipPath ($size bytes)"
}
finally {
    if (Test-Path $staging) {
        Remove-Item $staging -Recurse -Force
    }
}
