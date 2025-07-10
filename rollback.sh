#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$2"
        exit 1
    fi
}

# Function to confirm action
confirm_action() {
    echo -e "${YELLOW}WARNING: This will rollback your application to the backup version!${NC}"
    echo "Current containers will be stopped and replaced with backup version."
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Rollback cancelled."
        exit 0
    fi
}

echo "===================================="
echo "SoundHex Application Rollback"
echo "===================================="

# Check if docker is running
print_status "Checking Docker status..."
docker info >/dev/null 2>&1
check_status "Docker is running" "Docker is not running. Please start Docker service."

# Confirm rollback action
confirm_action

# Check if backup image exists in registry
print_status "Checking if backup image exists..."
docker manifest inspect ghcr.io/vtdocker/soundhex_app:backup >/dev/null 2>&1
if [ $? -ne 0 ]; then
    print_error "Backup image not found in registry!"
    echo "Make sure you have run the build script at least once to create a backup."
    exit 1
fi
print_success "Backup image found in registry"

# Stop current containers
print_status "Stopping current containers..."
docker compose down 2>/dev/null || true

# Check if rollback compose file exists
if [ ! -f "docker-compose.rollback.yml" ]; then
    print_error "docker-compose.rollback.yml not found!"
    echo "Please make sure docker-compose.rollback.yml is in the current directory."
    exit 1
fi

# Pull backup image
print_status "Pulling backup image..."
docker pull ghcr.io/vtdocker/soundhex_app:backup
check_status "Successfully pulled backup image" "Failed to pull backup image"

# Start containers with backup version
print_status "Starting containers with backup version..."
docker compose -f docker-compose.rollback.yml up -d --remove-orphans
check_status "Successfully started containers" "Failed to start containers"

# Check container health
print_status "Checking container status..."
sleep 5
CONTAINER_STATUS=$(docker compose -f docker-compose.rollback.yml ps --services --filter "status=running")
if [ -n "$CONTAINER_STATUS" ]; then
    print_success "All containers are running"
else
    print_error "Some containers failed to start"
    echo "Container logs:"
    docker compose -f docker-compose.rollback.yml logs
    exit 1
fi

# Show running containers
print_status "Current running containers:"
docker compose -f docker-compose.rollback.yml ps

echo ""
echo "===================================="
print_success "Rollback completed successfully!"
echo "Application has been rolled back to backup version"
echo "Application is running at: http://localhost:8501"
echo "===================================="

# Show additional info
echo ""
echo "What happened:"
echo "  1. Current containers were stopped"
echo "  2. Backup image was pulled from registry"
echo "  3. Containers were started with backup version"
echo ""
echo "Commands you can use:"
echo "  View logs:           docker compose -f docker-compose.rollback.yml logs -f"
echo "  Check status:        docker compose -f docker-compose.rollback.yml ps"
echo "  Stop rollback:       docker compose -f docker-compose.rollback.yml down"
echo "  Return to latest:    docker compose up -d"