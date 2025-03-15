#!/bin/bash
set -e  # Exit on error

# Usage:
#   sign_macos.sh <executable_path> <p12_file> <p12_password> <identifier>
#
# Example:
#   sign_macos.sh /output/my_macos_bin /output/developer-id.p12 /output/certificate-password "com.example.mybinary"
#
# Explanation:
#   - <executable_path>  : Path to the Mach-O file or .app folder to sign
#   - <p12/pfx_file>     : Path to your Apple Developer ID certificate in .p12
#   - <password>         : Password for the .p12
#   - <identifier>       : Your bundle identifier (e.g. "com.example.mybinary")

if [ $# -lt 4 ]; then
    echo "Usage: $0 <executable_path> <p12/pfx_file> <password> <identifier>"
    exit 1
fi

EXECUTABLE_PATH="$1"
P12_FILE="$2"
P12_PASSWORD="$3"
IDENTIFIER="$4"

# Check that files exist
if [ ! -f "$EXECUTABLE_PATH" ]; then
    echo "Error: Cannot find executable at '$EXECUTABLE_PATH'"
    exit 1
fi
if [ ! -f "$P12_FILE" ]; then
    echo "Error: Cannot find p12 file at '$P12_FILE'"
    exit 1
fi

echo "Signing macOS binary using rcodesign..."
file "$EXECUTABLE_PATH"  # Display info about the file

rcodesign sign \
  --p12-file "$P12_FILE" \
  --p12-password "$P12_PASSWORD" \
  --code-signature-flags runtime \
  --binary-identifier "$IDENTIFIER" \
  "$EXECUTABLE_PATH" \
  "${EXECUTABLE_PATH}_signed"

echo "Successfully signed $EXECUTABLE_PATH"

