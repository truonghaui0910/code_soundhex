#!/bin/bash
echo "Merging replit branch to main..."

# Ensure all changes are committed
git add . && git commit -m "Final replit changes" || true

# Switch to main and merge
git checkout main
git merge replit --no-ff -m "Merge replit branch - $(date '+%Y-%m-%d %H:%M')"

# Push to remote
git push origin main

echo "Successfully merged replit to main!"
echo "Ready to pull on your local machine!"