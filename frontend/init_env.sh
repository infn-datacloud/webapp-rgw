#!/bin/sh

TMP_FILE=/tmp/env.js
SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)

# If we are in development mode
if [ -f "${SCRIPT_DIR}/package.json" ]; 
  then
    SCRIPT_DIR="${SCRIPT_DIR}/public"
    TEMPLATE_FILE="${SCRIPT_DIR}/env.template.js"
    ENV_FILE="${SCRIPT_DIR}/env.js"
  else
  TEMPLATE_FILE="/usr/share/nginx/html/env.template.js"
  ENV_FILE="/usr/share/nginx/html/env.js"
fi


echo "Initialize environment variables"

cp "$TEMPLATE_FILE" "$TMP_FILE"

sed -i -e "s|IAM_AUTHORITY_VALUE|${IAM_AUTHORITY}|g" "$TMP_FILE"
sed -i -e "s|IAM_CLIENT_ID_VALUE|${IAM_CLIENT_ID}|g" "$TMP_FILE"
sed -i -e "s|IAM_REDIRECT_URI_VALUE|${IAM_REDIRECT_URI}|g" "$TMP_FILE"
sed -i -e "s|IAM_SCOPE_VALUE|${IAM_SCOPE}|g" "$TMP_FILE"
sed -i -e "s|IAM_AUDIENCE_VALUE|${IAM_AUDIENCE}|g" "$TMP_FILE"
sed -i -e "s|S3_ENDPOINT_VALUE|${S3_ENDPOINT}|g" "$TMP_FILE"
sed -i -e "s|S3_REGION_VALUE|${S3_REGION}|g" "$TMP_FILE"
sed -i -e "s|S3_ROLE_ARN_VALUE|${S3_ROLE_ARN}|g" "$TMP_FILE"

mv "$TMP_FILE" "$ENV_FILE"
