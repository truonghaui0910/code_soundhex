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

echo "===================================="
echo "Deploying SoundHex Application"
echo "===================================="

# Check if docker is running
print_status "Checking Docker status..."
docker info >/dev/null 2>&1
check_status "Docker is running" "Docker is not running. Please start Docker service."

# Check if logged in to ghcr.io
print_status "Checking GitHub Container Registry authentication..."
docker pull ghcr.io/vtdocker/soundhex_app:latest >/dev/null 2>&1
if [ $? -ne 0 ]; then
    print_warning "Not authenticated with ghcr.io or image not found"
    print_status "Attempting to login to GitHub Container Registry..."
    echo "Please enter your GitHub username and Personal Access Token"
    docker login ghcr.io
    check_status "Successfully logged in to ghcr.io" "Failed to login to ghcr.io"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker compose down 2>/dev/null || true

# Pull latest image
print_status "Pulling latest image from registry..."
docker compose pull
check_status "Successfully pulled latest image" "Failed to pull image"

# Start containers
print_status "Starting containers..."
docker compose up -d --remove-orphans
check_status "Successfully started containers" "Failed to start containers"

# Check container health
print_status "Checking container status..."
sleep 5
CONTAINER_STATUS=$(docker compose ps --services --filter "status=running")
if [ -n "$CONTAINER_STATUS" ]; then
    print_success "All containers are running"
else
    print_error "Some containers failed to start"
    echo "Container logs:"
    docker compose logs
    exit 1
fi

# Show running containers
print_status "Current running containers:"
docker compose ps

echo ""
echo "===================================="
print_success "Deployment completed successfully!"
echo "Application is running at: http://localhost:8501"
echo "===================================="

# Show logs option
echo ""
echo "Commands you can use:"
echo "  View logs:           docker compose logs -f"
echo "  Stop application:    docker compose down"
echo "  Restart:             ./deploy.sh"
echo "  Check status:        docker compose ps"