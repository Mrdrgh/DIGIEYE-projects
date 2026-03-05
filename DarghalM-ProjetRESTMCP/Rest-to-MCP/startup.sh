#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script directory: $SCRIPT_DIR"

cleanup() {
    echo "Cleaning up..."
    jobs -p | xargs -r kill
    exit
}
trap cleanup EXIT INT TERM

cd "$SCRIPT_DIR/server"
echo "Current directory: $(pwd)"

if [ -f "package.json" ]; then
    echo "Installing dependencies for REST server..."
    npm install
    
    echo "Starting REST server..."
    npm run dev &
    REST_PID=$!
    echo "REST server started with PID: $REST_PID"
else
    echo "Error: package.json not found in REST server directory"
    exit 1
fi

cd "$SCRIPT_DIR/MCPServer"
echo "Current directory: $(pwd)"

if [ -f "package.json" ]; then
    echo "Installing dependencies for MCP server..."
    npm install
    
    if npm run | grep -q "server:build"; then
        echo "Building MCP server..."
        npm run server:build
    fi
    
    echo "Starting MCP server..."
    npm run server:dev &
    MCP_PID=$!
    echo "MCP server started with PID: $MCP_PID"
else
    echo "Error: package.json not found in MCP server directory"
    kill $REST_PID
    exit 1
fi

wait