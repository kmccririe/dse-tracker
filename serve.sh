#!/bin/bash
# Serves DSE Tracker on localhost so Aperture CORS works.
PORT=${1:-8080}
echo "DSE Tracker → http://localhost:$PORT"
echo "Press Ctrl+C to stop."
cd "$(dirname "$0")"
python3 -m http.server $PORT
