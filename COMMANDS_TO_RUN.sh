#!/bin/bash

# Herb-Tracechain Frontend - Phase 5 Setup Commands
# This script contains all commands needed to set up and run the frontend

set -e

echo "=========================================="
echo "Herb-Tracechain Frontend Setup"
echo "=========================================="

# Navigate to project directory
cd "$(dirname "$0")"

echo ""
echo "Step 1: Installing dependencies..."
pnpm install

echo ""
echo "Step 2: Building the project..."
pnpm build

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the development server, run:"
echo "  pnpm dev"
echo ""
echo "To start the production server, run:"
echo "  pnpm start"
echo ""
echo "=========================================="
echo "Environment Variables Required:"
echo "=========================================="
echo "VITE_API_URL: Backend API URL (default: http://localhost:5000)"
echo ""
echo "Example .env file:"
echo "VITE_API_URL=http://localhost:5000"
echo ""
echo "=========================================="
echo "Routes:"
echo "=========================================="
echo "/login                    - Login page"
echo "/collector                - Collector dashboard"
echo "/processor                - Processor dashboard"
echo "/admin                    - Admin dashboard"
echo "/verify/:herbId           - Public verification page (no auth required)"
echo ""
echo "=========================================="
echo "Demo Credentials:"
echo "=========================================="
echo "Collector: collector@example.com / password"
echo "Processor: processor@example.com / password"
echo "Admin:     admin@example.com / password"
echo ""
echo "=========================================="
