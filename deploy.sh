#!/bin/bash
set -e

BUCKET="bookio-static-website"
REGION="us-east-1"

echo "Building..."
npm run build

echo "Uploading to s3://$BUCKET..."
aws s3 sync dist/ s3://$BUCKET/ --delete --region $REGION

echo "Done: http://$BUCKET.s3-website-$REGION.amazonaws.com"
