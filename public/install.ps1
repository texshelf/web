# Installs texshelf and typshelf from the latest GitHub release.
#   irm https://tex.jjsm.science/install.ps1 | iex
# Set $env:TEXSHELF_INSTALL_DIR to choose the folder
# and $env:TEXSHELF_VERSION to pin a release such as v0.1.0.
$ErrorActionPreference = "Stop"

$repo = "https://github.com/texshelf/texshelf"
$dir = if ($env:TEXSHELF_INSTALL_DIR) { $env:TEXSHELF_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "texshelf\bin" }
$version = $env:TEXSHELF_VERSION

if ($env:PROCESSOR_ARCHITECTURE -ne "AMD64" -and $env:PROCESSOR_ARCHITECTURE -ne "ARM64") {
    throw "Unsupported processor $($env:PROCESSOR_ARCHITECTURE)"
}
$target = "x86_64-pc-windows-msvc"

if (-not $version) {
    $release = Invoke-RestMethod "https://api.github.com/repos/texshelf/texshelf/releases/latest"
    $version = $release.tag_name
}

$name = "texshelf-$version-$target"
$base = "$repo/releases/download/$version"
$tmp = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid())
New-Item -ItemType Directory -Path $tmp | Out-Null

try {
    Write-Host "Downloading $name"
    Invoke-WebRequest "$base/$name.zip" -OutFile "$tmp\$name.zip"
    Invoke-WebRequest "$base/$name.zip.sha256" -OutFile "$tmp\$name.zip.sha256"

    $expected = ((Get-Content "$tmp\$name.zip.sha256" -Raw).Trim() -split "\s+")[0]
    $actual = (Get-FileHash "$tmp\$name.zip" -Algorithm SHA256).Hash
    if ($expected -ne $actual) {
        throw "Checksum mismatch; nothing was installed"
    }

    Expand-Archive "$tmp\$name.zip" -DestinationPath $tmp
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Copy-Item "$tmp\$name\texshelf.exe", "$tmp\$name\typshelf.exe" -Destination $dir -Force
}
finally {
    Remove-Item $tmp -Recurse -Force
}

Write-Host "Installed texshelf and typshelf $version in $dir"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($userPath -split ";") -notcontains $dir) {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$dir", "User")
    Write-Host "Added $dir to your PATH. Open a new terminal to use it."
}
