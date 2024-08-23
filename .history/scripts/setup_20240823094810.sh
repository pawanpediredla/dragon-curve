#!/bin/bash

# Ensure the script is run with superuser privileges
if [ "$(id -u)" -ne "0" ]; then
  echo "This script must be run as root or with sudo" 1>&2
  exit 1
fi

echo "Starting setup..."

# Update package lists and install necessary packages
echo "Updating package lists..."
apt-get update -y

echo "Installing required packages..."
apt-get install -y \
  git \
  curl \
  build-essential \
  nodejs \
  npm \
  docker.io \
  docker-compose

# Clone the repository if it doesn't exist
REPO_DI
