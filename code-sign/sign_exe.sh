#!/bin/bash
set -e  # Exit on error

# Usage:
#   sign_exe.sh <path_to_exe> <key_file> <password> <application_name> <url>
#
#   <mach-o_path>       : Path to your macOS binary or .app folder
#   <key_file>          : Path to a PEM or PKCS#12 file containing your private key (optional if using --adhoc)
#   <password>          : Password for the key file (optional if not password-protected)
#   <application_name>  : Name of the application
#   <url>               : URL for the application
#
# Example:
#   ./sign_exe.sh /output/s2a.exe /output/s2a.pfx mysecret s2a https://www.s2a.io
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ]; then
    echo "Usage: $0 <path_to_exe> <key_file> <password> <application_name> <url>"
    exit 1
fi

EXE_PATH="$1"
CERT_PFX="$2"
PASSWORD="$3"
APP_NAME="$4"
URL="$5"

# Validate certificate existence
if [ ! -f "$CERT_PFX" ]; then
    echo "Error: Code signing certificate not found at $CERT_PFX"
    exit 1
fi

# Generate output filename (_signed.exe)
SIGNED_EXE_PATH="${EXE_PATH%.exe}_signed.exe"

echo "Signing $EXE_PATH using osslsigncode..."
osslsigncode sign -pkcs12 "$CERT_PFX" \
    -pass "$PASSWORD" \
    -n "$APP_NAME" \
    -i "$URL" \
    -in "$EXE_PATH" \
    -out "$SIGNED_EXE_PATH"

echo "Signed file created: $SIGNED_EXE_PATH"
