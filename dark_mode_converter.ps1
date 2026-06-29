$files = Get-ChildItem -Path "src/app" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    if ($file.FullName -match "src\\app\\layout.tsx" -or $file.FullName -match "src\\app\\page.tsx" -or $file.FullName -match "src\\app\\leaderboard\\page.tsx") {
        continue
    }

    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        
        # Replace the dark blue that was used in light mode with bright blue for dark mode
        $content = $content -replace "text-\[#1a3a5c\]", "text-blue-400"
        $content = $content -replace "border-\[#1a3a5c\]", "border-blue-400"
        $content = $content -replace "bg-\[#1a3a5c\]", "bg-blue-600"
        $content = $content -replace "hover:text-\[#1a3a5c\]", "hover:text-blue-400"
        $content = $content -replace "hover:border-\[#1a3a5c\]", "hover:border-blue-400"
        $content = $content -replace "hover:bg-\[#1a3a5c\]", "hover:bg-blue-500"

        [System.IO.File]::WriteAllText($file.FullName, $content)
    } catch {
        Write-Host "Error processing $($file.FullName)"
    }
}

Write-Host "Dark blue conversion completed."
