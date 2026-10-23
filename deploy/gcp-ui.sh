#!/usr/bin/env bash
# Solo CRM's UI on Cloud Run (instead of Vercel). The API stays at solocrm-amber.vercel.app (Turso).
#
#   PROJECT=<project> deploy/gcp-ui.sh
set -euo pipefail
cd "$(dirname "$0")/../frontend"

PROJECT="${PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-europe-west1}"
REPO=solocrm
IMAGE="$REGION-docker.pkg.dev/$PROJECT/$REPO/solocrm-ui:$(git rev-parse --short HEAD)"

gcloud artifacts repositories describe "$REPO" --project "$PROJECT" --location "$REGION" >/dev/null 2>&1 ||
  gcloud artifacts repositories create "$REPO" --project "$PROJECT" --location "$REGION" --repository-format docker
gcloud builds submit . --project "$PROJECT" --region "$REGION" --tag "$IMAGE"
gcloud run deploy solocrm-ui --project "$PROJECT" --region "$REGION" --image "$IMAGE" \
  --allow-unauthenticated --min-instances 0 --max-instances 2 --memory 128Mi --port 8080
gcloud run services describe solocrm-ui --project "$PROJECT" --region "$REGION" --format 'value(status.url)'
