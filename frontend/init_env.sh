#!/bin/sh

TEMPLATE_FILE="/usr/share/nginx/html/env.template.js"
ENV_FILE="/usr/share/nginx/html/env.js"

echo "Initialize environment variables"

cp $TEMPLATE_FILE $ENV_FILE

sed -i -e "s/IAM_AUTHORITY_VALUE/${IAM_AUTHORITY}/g" $ENV_FILE
sed -i -e "s/IAM_CLIENT_ID_VALUE/${IAM_CLIENT_ID}/g" $ENV_FILE
sed -i -e "s/IAM_REDIRECT_URI_VALUE/${IAM_REDIRECT_URI}/g" $ENV_FILE
sed -i -e "s/IAM_SCOPE_VALUE/${IAM_SCOPE}/g" $ENV_FILE
sed -i -e "s/IAM_AUDIENCE_VALUE/${IAM_AUDIENCE}/g" $ENV_FILE
sed -i -e "s/S3_ENDPOINT_VALUE/${S3_ENDPOINT}/g" $ENV_FILE
sed -i -e "s/S3_REGION_VALUE/${S3_REGION}/g" $ENV_FILE
