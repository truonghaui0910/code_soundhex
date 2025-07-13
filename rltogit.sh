#!/bin/bash
echo "🔄 Merging replit branch to master..."

# Check what branches exist
echo "📍 Available branches:"
git branch -a

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ensure all changes are committed
echo "📦 Committing any pending changes..."
git add . && git commit -m "Final replit changes - $(date)" || true

# Check if replit branch exists
if git show-ref --verify --quiet refs/heads/replit; then
    echo "✅ Replit branch exists"
    REPLIT_BRANCH="replit"
elif [ "$CURRENT_BRANCH" != "master" ]; then
    echo "✅ Using current branch: $CURRENT_BRANCH"
    REPLIT_BRANCH="$CURRENT_BRANCH"
else
    echo "❌ No replit branch found and already on master"
    echo "🎯 Just pushing current changes to master..."
    git push origin master
    exit 0
fi

# Switch to master and merge
echo "🔄 Switching to master..."
git checkout master

if [ $? -ne 0 ]; then
    echo "❌ Failed to switch to master branch!"
    exit 1
fi

echo "🔀 Merging $REPLIT_BRANCH into master..."
git merge $REPLIT_BRANCH --no-ff -m "Merge $REPLIT_BRANCH to master - $(date '+%Y-%m-%d %H:%M')"

if [ $? -ne 0 ]; then
    echo "❌ Merge failed! Please resolve conflicts manually."
    exit 1
fi

# Push to remote
echo "🚀 Pushing to remote master..."
git push origin master

if [ $? -ne 0 ]; then
    echo "❌ Push failed! Please check your remote access."
    exit 1
fi

# Optional: Reset replit branch to master
if [ "$REPLIT_BRANCH" = "replit" ]; then
    echo "🧹 Resetting replit branch to master..."
    git checkout replit
    git reset --hard master
    git push -f origin replit || echo "⚠️ Could not force push replit branch"
    git checkout master
fi

echo "✅ Successfully merged $REPLIT_BRANCH to master and pushed!"
echo "🎉 All changes are now in master branch on remote repository."

# Show recent commits
echo ""
echo "📝 Recent commits on master:"
git log --oneline -5