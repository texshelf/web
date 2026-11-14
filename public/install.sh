#!/bin/sh
# Installs texshelf and typshelf from the latest GitHub release.
#   curl -fsSL https://tex.jjsm.science/install.sh | sh
# Set TEXSHELF_INSTALL_DIR to choose the folder (default: ~/.local/bin)
# and TEXSHELF_VERSION to pin a release such as v0.1.0.
set -eu

repo="https://github.com/texshelf/texshelf"
dir="${TEXSHELF_INSTALL_DIR:-$HOME/.local/bin}"
version="${TEXSHELF_VERSION:-}"

fail() {
  echo "install.sh: $1" >&2
  exit 1
}

command -v curl > /dev/null || fail "curl is required"
command -v tar > /dev/null || fail "tar is required"

case "$(uname -s)" in
  Linux) os="unknown-linux-gnu" ;;
  Darwin) os="apple-darwin" ;;
  *) fail "unsupported system $(uname -s). On Windows, use install.ps1." ;;
esac
case "$(uname -m)" in
  x86_64 | amd64) arch="x86_64" ;;
  arm64 | aarch64) arch="aarch64" ;;
  *) fail "unsupported processor $(uname -m)" ;;
esac
target="$arch-$os"

if [ -z "$version" ]; then
  latest=$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$repo/releases/latest")
  version="${latest##*/}"
  case "$version" in
    v*) ;;
    *) fail "could not find the latest release at $repo/releases" ;;
  esac
fi

name="texshelf-$version-$target"
base="${TEXSHELF_DOWNLOAD_BASE:-$repo/releases/download/$version}"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

echo "Downloading $name"
curl -fsSL "$base/$name.tar.gz" -o "$tmp/$name.tar.gz" || fail "no build of $version for $target"
curl -fsSL "$base/$name.tar.gz.sha256" -o "$tmp/$name.tar.gz.sha256" || fail "the checksum file is missing"

expected=$(cut -d ' ' -f 1 "$tmp/$name.tar.gz.sha256")
if command -v sha256sum > /dev/null; then
  actual=$(sha256sum "$tmp/$name.tar.gz" | cut -d ' ' -f 1)
else
  actual=$(shasum -a 256 "$tmp/$name.tar.gz" | cut -d ' ' -f 1)
fi
[ "$expected" = "$actual" ] || fail "checksum mismatch; nothing was installed"

tar -xzf "$tmp/$name.tar.gz" -C "$tmp"
mkdir -p "$dir"
for program in texshelf typshelf; do
  cp "$tmp/$name/$program" "$dir/$program"
  chmod 755 "$dir/$program"
done

echo "Installed texshelf and typshelf $version in $dir"
case ":$PATH:" in
  *":$dir:"*) ;;
  *) echo "Add $dir to your PATH to run them from anywhere." ;;
esac
