#!/bin/bash

# Safe deployment script for Majic-Photo.com
# Preserves all user data and minimizes downtime

# Configuration
REMOTE_USER="your-username"
REMOTE_HOST="your-vm-ip"
REMOTE_PATH="/path/to/StagingPhotos"
LOCAL_PATH="."

echo "🚀 Starting safe deployment to production..."

# Step 1: Sync files to remote (excluding unnecessary files)
echo "📦 Syncing files to remote server..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude '.env.development' \
  --exclude 'mongo-backup' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  $LOCAL_PATH/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Step 2: Execute remote commands
echo "🔄 Restarting services on remote server..."
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
  cd /path/to/StagingPhotos
  
  # Check if containers are running
  if docker compose ps | grep -q "backend"; then
    echo "✅ Containers detected, performing hot reload..."
    
    # Restart only the backend container (preserves all data)
    docker compose restart backend
    
    echo "⏳ Waiting for backend to be healthy..."
    sleep 5
    
    # Check if backend is running
    if docker compose ps | grep -q "backend.*Up"; then
      echo "✅ Backend restarted successfully!"
    else
      echo "⚠️  Backend may have issues, checking logs..."
      docker compose logs --tail=20 backend
    fi
  else
    echo "📍 Containers not running, starting fresh..."
    docker compose up -d --build backend
  fi
  
  echo "✅ Deployment complete!"
  echo "📊 Current container status:"
  docker compose ps
ENDSSH

echo "🎉 Deployment finished!"
echo "💡 Note: MongoDB and storage data are preserved in Docker volumes"