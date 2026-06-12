# PowerShell backup script template (mysqldump example)
Param()
$BackupDir = $env:BACKUP_DIR -or Join-Path -Path $PSScriptRoot -ChildPath 'backups'
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }
$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$Filename = Join-Path $BackupDir "vitacora-backup-$Timestamp.sql.gz"
Write-Host "Running mysqldump..."
$mysqlHost = $env:MYSQL_HOST -or 'localhost'
$mysqlUser = $env:MYSQL_USER -or 'root'
$mysqlPass = $env:MYSQL_PASSWORD -or ''
$database = $env:DB_NAME -or 'vitacora'

$dumpCmd = "mysqldump -h $mysqlHost -u $mysqlUser -p$mysqlPass $database"
$gzipCmd = "gzip > `"$Filename`""

Write-Host "Note: This script assumes mysqldump and gzip are available in PATH."
Write-Host "Output: $Filename"
