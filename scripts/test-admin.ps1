$adminLogin = '{"email":"admin@typemaster.kh","password":"Admin1234!"}'
$auth = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
Write-Host "Logged in as:" $auth.user.displayName "Role:" $auth.user.role

$passages = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/admin/passages" -Headers @{ Authorization = "Bearer $($auth.accessToken)" }
Write-Host "Total passages visible to Admin:" $passages.totalElements

# Create a new bilingual passage as Admin
$newPassage = '{"locale":"km","title":"Admin Seeded Passage","content":"អត្ថបទនេះត្រូវបានបញ្ចូលដោយអ្នកគ្រប់គ្រងប្រព័ន្ធ ដើម្បីធ្វើតេស្តមុខងាររដ្ឋបាល។","difficulty":"INTERMEDIATE","category":"TEST","contentMode":"PARAGRAPH","status":"PUBLISHED"}'
$created = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/admin/passages" -Method Post -Body $newPassage -ContentType "application/json" -Headers @{ Authorization = "Bearer $($auth.accessToken)" }
Write-Host "Created new passage:" $created.title "Status:" $created.status "ID:" $created.id

# Check Audit Logs
$auditLogs = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/admin/audit-logs" -Headers @{ Authorization = "Bearer $($auth.accessToken)" }
Write-Host "Audit logs count:" $auditLogs.totalElements "Latest Action:" $auditLogs.content[0].action
