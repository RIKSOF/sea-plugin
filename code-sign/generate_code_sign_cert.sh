#!/bin/bash
set -e  # Exit on error

# Usage:
#   generate_code_sign_cert.sh <country_code> <organization_name> <password> <cert_path>
#
#   <country_code>      : 2-letter country code
#   <organization_name> : Organization name for certificate
#   <password>          : Password for the key file
#   <cert_path>         : Path and name of certificate without extension.
#
# Example:
#   ./generate_code_sign_cert.sh US "RIKSOF Inc" secret /cert/s2a
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
    echo "Usage: $0 <country_code> <organization_name> <password> <cert_path>"
    exit 1
fi

COUNTRY_CODE="$1"
ORG_NAME="$2"
PASSWORD="$3"
CERT_NAME="$4"

# Ensure CERT_NAME is an absolute path
if [[ "$CERT_NAME" != /* ]]; then
    echo "Error: cert_path must be an absolute path (inside the container)."
    exit 1
fi

# Define certificate details
DAYS_VALID=3650  # 10 years validity
KEY_SIZE=4096
SUBJECT="/C=$COUNTRY_CODE/O=$ORG_NAME/CN=Code Signing Certificate"

echo "Generating a password-protected private key in PEM format..."
openssl genpkey -algorithm RSA -aes256 -pass pass:$PASSWORD -out "$CERT_NAME.key.pem" -pkeyopt rsa_keygen_bits:$KEY_SIZE

echo "Creating a certificate signing request (CSR)..."
openssl req -new -key "$CERT_NAME.key.pem" -out "$CERT_NAME.csr" -subj "$SUBJECT" -passin pass:$PASSWORD

echo "Generating a self-signed certificate in PEM format..."
openssl x509 -req -days $DAYS_VALID -in "$CERT_NAME.csr" -signkey "$CERT_NAME.key.pem" -out "$CERT_NAME.cert.pem" -extfile <(echo "extendedKeyUsage = codeSigning") -passin pass:$PASSWORD

echo "Converting PEM certificate to CRT (DER format)..."
openssl x509 -outform der -in "$CERT_NAME.cert.pem" -out "$CERT_NAME.cert.crt"

echo "Creating a PKCS#12 (.p12/.pfx) file..."
openssl pkcs12 -export -out "$CERT_NAME.p12" -inkey "$CERT_NAME.key.pem" -in "$CERT_NAME.cert.crt" -passin pass:$PASSWORD -passout pass:$PASSWORD

echo "Creating self-signed certificate for Mac OS"
rcodesign generate-self-signed-certificate --person-name "$ORG_NAME" --country-name $COUNTRY_CODE --pem-filename "${CERT_NAME}_macos" --p12-file "${CERT_NAME}_macos.pfx" --p12-password "$PASSWORD"

echo "Certificate and key files generated in $(dirname "$CERT_NAME"):"
echo "- Private Key (PEM, Encrypted): $CERT_NAME.key.pem"
echo "- Certificate (PEM): $CERT_NAME.cert.pem"
echo "- Certificate (CRT, DER format): $CERT_NAME.cert.crt"
echo "- PKCS#12 (.p12) File: $CERT_NAME.p12"
echo "Use the same password you entered when importing the certificate."
