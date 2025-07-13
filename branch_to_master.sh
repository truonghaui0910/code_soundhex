#!/bin/bash
echo "🔄 Clean merge replit-agent to master..."

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

# If already on master, check if we need to merge anything
if [ "$CURRENT_BRANCH" = "master" ]; then
    echo "✅ Already on master branch"

    # Check if replit-agent is ahead of master
    AHEAD_COUNT=$(git rev-list --count master..replit-agent 2>/dev/null || echo "0")

    if [ "$AHEAD_COUNT" = "0" ]; then
        echo "📍 replit-agent is up to date with master, just pushing..."
        git add . && git commit -m "Direct changes on master - $(date)" || true
        git push origin master
        exit 0
    fi
fi

# Commit any pending changes on current branch
echo "📦 Committing any pending changes..."
git add . && git commit -m "Final changes before merge - $(date)" || true

# Switch to master
echo "🔄 Switching to master..."
git checkout master

# Option 1: Fast-forward merge if possible (cleaner)
echo "🔍 Checking if fast-forward merge is possible..."
if git merge-base --is-ancestor master replit-agent; then
    echo "✅ Using fast-forward merge (no extra commit)"
    git merge replit-agent --ff-only
    MERGE_STATUS=$?
else
    echo "⚠️ Fast-forward not possible, using regular merge"
    git merge replit-agent --no-ff -m "Merge replit-agent changes"
    MERGE_STATUS=$?
fi

if [ $MERGE_STATUS -ne 0 ]; then
    echo "❌ Merge failed! Please resolve conflicts manually."
    exit 1
fi

# Push to remote
echo "🚀 Pushing to remote master..."
git push origin master

if [ $? -ne 0 ]; then
    echo "❌ Push failed!"
    exit 1
fi

# Reset replit-agent to master to avoid future conflicts
echo "🧹 Syncing replit-agent with master..."
git checkout replit-agent
git reset --hard master
git push -f origin replit-agent || echo "⚠️ Could not force push replit-agent"
git checkout master

echo "✅ Clean merge completed!"
echo "📊 Git history should be cleaner now"

# Show recent commits (should be fewer)
echo ""
echo "📝 Recent commits on master:"
git log --oneline -3