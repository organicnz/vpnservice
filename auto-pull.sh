#!/bin/bash

echo "🔄 Automatically pulling latest changes..."
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "📥 Changes detected, pulling updates..."
  git pull
  echo "✅ Pull completed successfully!"
else
  echo "✅ Already up to date!"
fi 