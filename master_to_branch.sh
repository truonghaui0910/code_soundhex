#!/bin/bash
echo "🔄 Syncing master to replit-agent branch..."

# Check for git locks first
if [ -f .git/index.lock ]; then
    echo "⚠️ Git lock detected, cleaning up..."
    rm -f .git/index.lock
    rm -f .git/refs/remotes/origin/*.lock
    rm -f .git/refs/heads/*.lock
    pkill -f git 2>/dev/null || true
    sleep 2
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Stash any uncommitted changes if exist
echo "💾 Stashing any uncommitted changes..."
git stash push -m "Auto-stash before sync - $(date)" || true

# Switch to master and pull latest
echo "🔄 Switching to master and pulling latest..."
git checkout master
git pull origin master

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull from master!"
    exit 1
fi

# Switch to replit-agent branch (create if not exists)
echo "🔄 Switching to replit-agent branch..."
if git show-ref --verify --quiet refs/heads/replit-agent; then
    git checkout replit-agent
else
    echo "🆕 Creating replit-agent branch from master..."
    git checkout -b replit-agent
fi

# Merge master into replit-agent
echo "🔀 Merging master into replit-agent..."
git merge master --no-ff -m "Sync master to replit-agent - $(date '+%Y-%m-%d %H:%M')"

if [ $? -ne 0 ]; then
    echo "❌ Merge conflict detected!"
    echo "📝 Please resolve conflicts manually:"
    echo "   1. Edit conflicted files"
    echo "   2. git add ."
    echo "   3. git commit -m 'Resolve merge conflicts'"
    echo "   4. git push origin replit-agent"
    exit 1
fi

# Push replit-agent branch to remote
echo "🚀 Pushing replit-agent branch..."
git push origin replit-agent

# Pop stashed changes if any
echo "🔓 Restoring stashed changes..."
git stash pop 2>/dev/null || echo "No stashed changes to restore"

echo "✅ Successfully synced master to replit-agent!"
echo "🎉 replit-agent branch now has latest changes from master"

# Show recent commits
echo ""
echo "📝 Recent commits on replit-agent:"
git log --oneline -5

# Show branch comparison
echo ""
echo "📊 Branch status:"
git log --oneline master..replit-agent | wc -l | xargs echo "Commits ahead of master:"
git log --oneline replit-agent..master | wc -l | xargs echo "Commits behind master:"