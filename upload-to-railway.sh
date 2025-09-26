#!/bin/bash
echo "🚂 Railway Database Upload Script"
echo "=================================="

# Step 1: Connect to Railway and upload the database
echo "📤 Uploading database to Railway volume..."

# This will open Railway shell where you can run commands
echo "Run these commands in Railway shell:"
echo ""
echo "1. mkdir -p /app/data"
echo "2. cd /app/data"
echo "3. Exit shell and use railway run to upload files"
echo ""

# Alternative: Use railway run to execute upload commands
echo "Or use this command to upload via railway run:"
echo "railway run --attach bash -c 'mkdir -p /app/data && cd /app/data'"

echo ""
echo "⚠️  IMPORTANT: Make sure your volume is mounted at /app/data"
echo "⚠️  The database files need to be at /app/data/basecamp-agent.db3"
