#!/bin/bash

# This script automates the deployment process by handling environment files and starting Docker services.

# 1. Remove the existing .env.example file to ensure a clean slate.
echo "Removing the old .env.production file..."
rm .env.production

# 2. Copy the good.env file to .env.example.
# This ensures that the production environment variables are correctly configured for the build.
echo "Copying good.env to .env.production..."
cp good.env .env.production

# 3. Start the Docker Compose services in detached mode (-d) using the production configuration.
# The --build flag forces a rebuild of the images, ensuring any changes are included.
echo "Starting Docker Compose services with the production configuration..."
docker compose -f docker-compose.prod.yml up --build -d

echo "Deployment process complete."