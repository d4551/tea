$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ConfigValues = @{}
Get-Content (Join-Path $RootDir ".env.example") | ForEach-Object {
  if ($_ -match "^(?<key>[A-Z0-9_]+)=(?<value>.+)$") {
    $ConfigValues[$Matches.key] = $Matches.value
  }
}
$ExpectedPrefix = ($ConfigValues["BUN_SUPPORTED_RANGE"] -replace "\.x$", ".")
$InstallVersion = $ConfigValues["BUN_INSTALL_VERSION"]

function Ensure-Bun {
  $bunCommand = Get-Command bun -ErrorAction SilentlyContinue
  if ($null -ne $bunCommand) {
    $currentVersion = (& bun --version).Trim()
    if ($currentVersion.StartsWith($ExpectedPrefix)) {
      return
    }
  }

  iex "& {$(irm https://bun.com/install.ps1)} -Version $InstallVersion"
  $env:Path = "$env:USERPROFILE\.bun\bin;$env:Path"
}

Ensure-Bun
Set-Location $RootDir
bun run setup
