$loginBody = '{"email":"protypist@typemaster.kh","password":"Password123!"}'
$auth = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $auth.accessToken
Write-Host "Logged in as:" $auth.user.displayName

$roomReq = '{"locale":"en","difficulty":"BEGINNER","maxPlayers":5,"isPrivate":false}'
$headers = @{ Authorization = "Bearer $token" }
$room = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/rooms" -Method Post -Body $roomReq -ContentType "application/json" -Headers $headers
Write-Host "Room created with code:" $room.roomCode "status:" $room.status

# Mark ready
$ready = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/rooms/$($room.roomCode)/ready" -Method Post -Headers $headers
Write-Host "Marked ready, status:" $ready.status

# Send 50% progress
$len = $room.passageContent.Length
$half = [math]::Floor($len / 2)
$prog1 = "{`"roomCode`":`"$($room.roomCode)`",`"progressCharacters`":$half,`"correctCharacters`":$half,`"incorrectCharacters`":0}"
$part1 = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/rooms/$($room.roomCode)/progress" -Method Post -Body $prog1 -ContentType "application/json" -Headers $headers
Write-Host "Progress half way:" $part1.progressCharacters "status:" $part1.status

# Finish race
$prog2 = "{`"roomCode`":`"$($room.roomCode)`",`"progressCharacters`":$len,`"correctCharacters`":$len,`"incorrectCharacters`":0}"
$part2 = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/rooms/$($room.roomCode)/progress" -Method Post -Body $prog2 -ContentType "application/json" -Headers $headers
Write-Host "Finished race! Placement:" $part2.placement "WPM:" $part2.finalWpm "CPM:" $part2.finalCpm "Status:" $part2.status
