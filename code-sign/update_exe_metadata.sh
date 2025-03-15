#!/bin/bash

set -e  # Exit on error

# Check if all required arguments are provided
if [ "$#" -ne 9 ]; then
    echo "Usage: $0 <CompanyName> <FileDescription> <FileVersion> <InternalName> <LegalCopyright> <OriginalFilename> <ProductName> <ProductVersion> <ExecutablePath>"
    exit 1
fi

COMPANY_NAME="$1"
FILE_DESCRIPTION="$2"
FILE_VERSION="$3"
INTERNAL_NAME="$4"
LEGAL_COPYRIGHT="$5"
ORIGINAL_FILENAME="$6"
PRODUCT_NAME="$7"
PRODUCT_VERSION="$8"
EXE_PATH="$9"

# Ensure the EXE file exists
if [ ! -f "$EXE_PATH" ]; then
    echo "Error: Executable file not found at $EXE_PATH"
    exit 1
fi

# Define paths
RC_FILE="/project/exe_metadata.rc"
RES_FILE="/project/exe_metadata.res"
EXE_OUTPUT="${EXE_PATH%.exe}_updated.exe"
INCLUDE_PATH="/usr/x86_64-w64-mingw32/include"

# Convert version format from `2.0.1` to `2,0,1,0`
FILE_VERSION_RC=$(echo "$FILE_VERSION" | sed 's/\./,/g'),0
PRODUCT_VERSION_RC=$(echo "$PRODUCT_VERSION" | sed 's/\./,/g'),0

cat <<EOF > "$RC_FILE"
#include <windows.h>

VS_VERSION_INFO VERSIONINFO
FILEVERSION $FILE_VERSION_RC
PRODUCTVERSION $PRODUCT_VERSION_RC
FILEFLAGSMASK 0x3fL
FILEFLAGS 0x0L
FILEOS VOS_NT_WINDOWS32
FILETYPE VFT_APP
FILESUBTYPE VFT2_UNKNOWN

BEGIN
    BLOCK "StringFileInfo"
    BEGIN
        BLOCK "040904b0"
        BEGIN
            VALUE "CompanyName", "$COMPANY_NAME"
            VALUE "FileDescription", "$FILE_DESCRIPTION"
            VALUE "FileVersion", "$FILE_VERSION"
            VALUE "InternalName", "$INTERNAL_NAME"
            VALUE "LegalCopyright", "$LEGAL_COPYRIGHT"
            VALUE "OriginalFilename", "$ORIGINAL_FILENAME"
            VALUE "ProductName", "$PRODUCT_NAME"
            VALUE "ProductVersion", "$PRODUCT_VERSION"
        END
    END
    BLOCK "VarFileInfo"
    BEGIN
        VALUE "Translation", 0x0409, 1200
    END
END
EOF

echo "Generated RC file at: $RC_FILE"
echo "==== RC FILE CONTENTS ===="
cat "$RC_FILE"
echo "=========================="

# Compile the `.rc` file into a `.res` using windres with explicit target format
echo "Running windres..."
x86_64-w64-mingw32-windres \
    -v \
    --target=pe-x86-64 \
    -I"$INCLUDE_PATH" \
    -i "$RC_FILE" \
    -O coff \
    -o "$RES_FILE" || {
        echo "windres failed; see error above."
        exit 1
    }

if [ ! -f "$RES_FILE" ]; then
    echo "Error: windres did not produce the .res file."
    exit 1
fi

echo "Successfully generated .res file at: $RES_FILE"

# Attach the `.res` file to the EXE using objcopy
echo "Adding resource section to $EXE_PATH..."
x86_64-w64-mingw32-objcopy --add-section .rsrc="$RES_FILE" "$EXE_PATH" "$EXE_OUTPUT"

if [ ! -f "$EXE_OUTPUT" ]; then
    echo "Error: Failed to create updated EXE."
    exit 1
fi

# Replace the original EXE with the updated one
mv "$EXE_OUTPUT" "$EXE_PATH"

echo "EXE metadata updated successfully for: $EXE_PATH"
