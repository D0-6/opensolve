$files = Get-ChildItem -Path "src/app" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    if ($file.FullName -match "src\\app\\layout.tsx" -or $file.FullName -match "src\\app\\page.tsx" -or $file.FullName -match "src\\app\\leaderboard\\page.tsx") {
        continue
    }

    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        
        # Backgrounds
        $content = $content -replace "bg-white", "bg-transparent"
        $content = $content -replace "bg-zinc-50", "bg-white/5"
        $content = $content -replace "bg-zinc-100", "bg-white/10"
        $content = $content -replace "bg-gray-50", "bg-white/5"
        $content = $content -replace "bg-gray-100", "bg-white/10"

        # Text Colors
        $content = $content -replace "text-zinc-900", "text-white"
        $content = $content -replace "text-zinc-800", "text-zinc-200"
        $content = $content -replace "text-zinc-700", "text-zinc-300"
        $content = $content -replace "text-zinc-600", "text-zinc-400"
        $content = $content -replace "text-zinc-500", "text-zinc-400"
        
        $content = $content -replace "text-gray-900", "text-white"
        $content = $content -replace "text-gray-800", "text-gray-200"
        $content = $content -replace "text-gray-700", "text-gray-300"
        $content = $content -replace "text-gray-600", "text-gray-400"
        $content = $content -replace "text-gray-500", "text-gray-400"
        
        # Borders
        $content = $content -replace "border-zinc-200", "border-white/10"
        $content = $content -replace "border-zinc-300", "border-white/20"
        $content = $content -replace "border-zinc-100", "border-white/5"
        
        $content = $content -replace "border-gray-200", "border-white/10"
        $content = $content -replace "border-gray-300", "border-white/20"
        $content = $content -replace "border-gray-100", "border-white/5"

        [System.IO.File]::WriteAllText($file.FullName, $content)
    } catch {
        Write-Host "Error processing $($file.FullName)"
    }
}

Write-Host "Dark mode conversion completed."
