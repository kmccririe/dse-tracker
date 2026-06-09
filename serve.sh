#!/bin/bash
# Starts the DSE Tracker server with Aperture routing.
# AI calls go server-side (no CORS issues).
PORT=${1:-8080}
cd "$(dirname "$0")"
ANTHROPIC_BEDROCK_BASE_URL=http://ai/bedrock \
ANTHROPIC_MODEL=us.anthropic.claude-opus-4-6-v1 \
node server.js $PORT
