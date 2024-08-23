#!/bin/bash

set -e

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print a message with a timestamp
print_message() {
  local message="$1"
  echo -e "${YELLOW}$(date +'%Y-%m-%d %H:%M:%S') ${message}${NC}"
}

# Print error message and exit
print_error() {
  local message="$1"
  echo -e "${RED}${message}${NC}" >&2
  exit 1
}

print_message "Starting build process..."

# Step 1: Install dependencies
print_message "Installing dependencies..."
npm install || print_error "Failed to install dependencies"

# Step 2: Compile TypeScript (if applicable)
# Uncomment the following lines if using TypeScript
# print_message "Compiling TypeScript..."
# npx tsc || print_error "TypeScript compilation failed"

# Step 3: Run linting
print_message "Running linting..."
npx eslint . || print_error "Linting failed"

# Step 4: Run tests
print_message "Running tests..."
npx jest || print_error "Tests failed"

# Step 5: Build the project
print_message "Building the project..."
npm run build || print_error "Build failed"

# Step 6: Prepare assets (if applicable)
# Add any asset preparation commands here
# print_message "Preparing assets..."
# npm run prepare-assets || print_error "Asset preparation failed"

print_message "Build process completed successfully."
