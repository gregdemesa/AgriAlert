#!/bin/bash

# Configuration variables
echo "Enter your Google Cloud Project ID:"
read PROJECT_ID
SERVICE_NAME="agrialert"
REGION="us-central1"  # Change this to your preferred region

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t "gcr.io/$PROJECT_ID/$SERVICE_NAME" .

# Step 2: Configure Docker to use Google Cloud as a credential helper
echo "Configuring Docker authentication..."
gcloud auth configure-docker

# Step 3: Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Step 4: Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image "gcr.io/$PROJECT_ID/$SERVICE_NAME" \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "Deployment complete!"
echo "Your application should be available at the URL shown above."
