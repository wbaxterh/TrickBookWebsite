param(
  [int]$BatchSize = 10,
  [int]$PauseSeconds = 150,
  [int]$StartSeason = 2025,
  [int]$StartOffset = 40
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $repoRoot 'data\snowboard-films'
$statePath = Join-Path $dataDir 'backfill-state.json'
$logPath = Join-Path $dataDir 'backfill.log'
$sshKey = 'C:\Users\wesle\.ssh\weshuber.pem'
$remote = 'ubuntu@api.thetrickbook.com'
$remoteRepo = '/home/ubuntu/TB-Backend'

function Write-BackfillLog([string]$Message) {
  $line = "$(Get-Date -Format o) $Message"
  Add-Content -LiteralPath $logPath -Value $line
}

function Save-State([int]$Season, [int]$Offset, [string]$Status, [string]$BatchFile) {
  $state = [ordered]@{
    season = $Season
    offset = $Offset
    batchSize = $BatchSize
    status = $Status
    batchFile = $BatchFile
    updatedAt = (Get-Date).ToUniversalTime().ToString('o')
  }
  $state | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding utf8
}

Set-Location $repoRoot
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

$season = $StartSeason
$offset = $StartOffset
if (Test-Path -LiteralPath $statePath) {
  $saved = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  if ($saved.status -ne 'complete') {
    $season = [int]$saved.season
    $offset = [int]$saved.offset
  }
}

try {
  while ($season -ge 1988) {
    $batchNumber = [math]::Floor($offset / $BatchSize) + 1
    $batchName = "batch-$season-$($batchNumber.ToString('0000')).json"
    $batchPath = Join-Path $dataDir $batchName
    Save-State $season $offset 'scraping' $batchName
    Write-BackfillLog "Scraping season=$season offset=$offset limit=$BatchSize"

    & node scripts\scrape-snowboardingfilms.js "--season=$season" "--offset=$offset" "--limit=$BatchSize" "--output=$batchPath" *>> $logPath
    if ($LASTEXITCODE -ne 0) { throw "Scraper failed for $season offset $offset" }

    $batch = Get-Content -LiteralPath $batchPath -Raw | ConvertFrom-Json
    $count = @($batch.films).Count
    if ($count -eq 0) {
      Remove-Item -LiteralPath $batchPath
      $season--
      $offset = 0
      Save-State $season $offset 'advancing-season' ''
      continue
    }

    $remoteBatch = "/tmp/$batchName"
    Save-State $season $offset 'importing' $batchName
    & scp -i $sshKey $batchPath "${remote}:$remoteBatch" *>> $logPath
    if ($LASTEXITCODE -ne 0) { throw "SCP failed for $batchName" }

    $remoteCommand = "source ~/.nvm/nvm.sh && cd $remoteRepo && node scripts/import-snowboard-film-batch.js $remoteBatch && node scripts/import-snowboard-film-batch.js $remoteBatch --apply"
    & ssh -i $sshKey $remote $remoteCommand *>> $logPath
    if ($LASTEXITCODE -ne 0) { throw "Remote import failed for $batchName" }

    $published = @($batch.films | Where-Object { $_.isPublished }).Count
    Write-BackfillLog "Imported ${batchName}: collected=$count published=$published review=$($count - $published)"

    if ($count -lt $BatchSize) {
      $season--
      $offset = 0
    } else {
      $offset += $BatchSize
    }
    Save-State $season $offset 'waiting' $batchName
    Start-Sleep -Seconds $PauseSeconds
  }

  Save-State $season $offset 'complete' ''
  Write-BackfillLog 'Backfill complete.'
} catch {
  Save-State $season $offset 'failed' ''
  Write-BackfillLog "FAILED: $($_.Exception.Message)"
  throw
}
