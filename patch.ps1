(Get-Content src/app/tour/[id]/page.tsx) -replace '(?ms)    where: \{ id: params\.id \},.*?  \}\);', '' | Set-Content src/app/tour/[id]/page.tsx
