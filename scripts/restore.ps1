Param()
$RestoreFile = $env:RESTORE_FILE
if (-not $RestoreFile) {
  Write-Host "Usage: $env:RESTORE_FILE=path\to\backup pwsh ./scripts/restore.ps1"
  exit 2
}

if ($RestoreFile -like "*.sqlite.gz") {
  Write-Host "Restoring SQLite backup..."
  $tmp = [System.IO.Path]::GetTempFileName()
  & gzip -dc $RestoreFile > $tmp
  $dbFile = $env:DB_CONNECTION -or Join-Path -Path $PSScriptRoot -ChildPath '..\data\vitacora.sqlite'
  $dbDir = Split-Path $dbFile -Parent
  if (-not (Test-Path $dbDir)) { New-Item -ItemType Directory -Path $dbDir | Out-Null }
  Move-Item -Force $tmp $dbFile
  Write-Host "Restored SQLite DB to $dbFile"
  exit 0
}

if ($RestoreFile -like "*.sql.gz") {
  Write-Host "Restoring MySQL/MariaDB SQL backup (gzip-compressed)..."
  if (-not $env:MYSQL_HOST -or -not $env:MYSQL_USER) {
    Write-Host "Please set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD and DB_NAME environment variables." -ForegroundColor Yellow
    exit 2
  }
  # Ensure gzip and mysql in PATH
  gzip -dc $RestoreFile | mysql -h $env:MYSQL_HOST -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD $env:DB_NAME
  Write-Host "Restore completed to $($env:MYSQL_HOST)/$($env:DB_NAME)"
  exit 0
}

Write-Host "Unknown backup format for $RestoreFile" -ForegroundColor Red
exit 2
