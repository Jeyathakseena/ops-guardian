#!/bin/bash
set -e

echo "[OpsLLM] Starting Ollama server..."
ollama serve &
SERVER_PID=$!

# Wait for the server to accept connections
echo "[OpsLLM] Waiting for Ollama to be ready..."
sleep 8

# Pull the model only if it is not already stored in the volume
if ! ollama list 2>/dev/null | grep -q "qwen:4b"; then
  echo "[OpsLLM] Pulling qwen:4b — this takes a few minutes on first run..."
  ollama pull qwen:4b
  echo "[OpsLLM] qwen:4b is ready."
else
  echo "[OpsLLM] qwen:4b already present. Skipping pull."
fi

echo "[OpsLLM] Ready to serve requests."

# Keep the container alive
wait $SERVER_PID