$srcDir = Join-Path $PSScriptRoot "src"
if (-not (Test-Path $srcDir)) {
    New-Item -ItemType Directory -Path $srcDir
}

Move-Item -Path "main.tsx" -Destination $srcDir -Force
Move-Item -Path "App.tsx" -Destination $srcDir -Force
Move-Item -Path "index.css" -Destination $srcDir -Force
