while ($true) {
  $clientPid = $(Get-NetTCPConnection | ? { $_.LocalPort -eq 3000 -and $_.State -eq "Listen" }).OwningProcess
  if ($clientPid) {
    break
  }

  Start-Sleep 1
}

echo "Client PID is $clientPid"

Set-Item env:DEV_MODE 1
client\node_modules\.bin\electron client\public\server.js

Stop-Process $clientPid
