$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Administrator\Desktop\anchor-release'
$files = @(Get-ChildItem (Join-Path $root 'docs') -Recurse -Filter *.md | Where-Object { $_.FullName -notmatch '\\docs\\(en|fr|ru|hi|es|ar|ja|bn|de|id|pt|sw|ur|vi|zh)\\' })

Write-Output '=== [1] table column count mismatch ==='
$bad = 0
foreach ($f in $files) {
  $lines = Get-Content $f.FullName -Encoding UTF8
  $inTable = $false; $cols = 0; $ln = 0
  foreach ($line in $lines) {
    $ln++
    $t = $line.Trim()
    if ($t -match '^\|.*\|$') {
      $n = ($t.ToCharArray() | Where-Object { $_ -eq '|' }).Count
      if (-not $inTable) { $inTable = $true; $cols = $n }
      elseif ($n -ne $cols) {
        $bad++
        $snip = $t.Substring(0, [Math]::Min(40, $t.Length))
        Write-Output ("{0}:{1} cols {2} vs {3} | {4}" -f $f.Name, $ln, $n, $cols, $snip)
      }
    } else { $inTable = $false }
  }
}
if ($bad -eq 0) { Write-Output 'none' }

Write-Output ''
Write-Output '=== [2] unclosed code fences (odd ```) ==='
$cb = 0
foreach ($f in $files) {
  $c = (Select-String -Path $f.FullName -Pattern '^```' -Encoding UTF8 | Measure-Object).Count
  if ($c % 2 -ne 0) { $cb++; Write-Output ("{0}: {1} fences (odd)" -f $f.Name, $c) }
}
if ($cb -eq 0) { Write-Output 'none' }

Write-Output ''
Write-Output '=== [3] heading level jumps ==='
$jump = 0
foreach ($f in $files) {
  $prev = 0; $ln = 0
  foreach ($line in (Get-Content $f.FullName -Encoding UTF8)) {
    $ln++
    if ($line -match '^(#{1,6})\s') {
      $lvl = $Matches[1].Length
      if ($prev -gt 0 -and $lvl -gt ($prev + 1)) {
        $jump++
        $snip = $line.Trim().Substring(0, [Math]::Min(30, $line.Trim().Length))
        Write-Output ("{0}:{1} jump {2}->{3} | {4}" -f $f.Name, $ln, $prev, $lvl, $snip)
      }
      $prev = $lvl
    } elseif ($line.Trim() -ne '') { $prev = 0 }
  }
}
if ($jump -eq 0) { Write-Output 'none' }

Write-Output ''
Write-Output '=== [4] empty table header separator (| --- |) issues ==='
$sep = 0
foreach ($f in $files) {
  $lines = Get-Content $f.FullName -Encoding UTF8
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $t = $lines[$i].Trim()
    if ($t -match '^\|[-:|\s]+\|$' -and $t -notmatch '[^-|:\s]') {
      if ($i -eq 0) { $sep++; Write-Output ("{0}:{1} separator without header row" -f $f.Name, ($i + 1)) }
    }
  }
}
if ($sep -eq 0) { Write-Output 'none' }

Write-Output ''
Write-Output 'done'
