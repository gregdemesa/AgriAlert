# PowerShell script to deploy to Google Cloud Run

# Configuration variables
$PROJECT_ID = Read-Host -Prompt "Enter your Google Cloud Project ID"
$SERVICE_NAME = "agrialert"
$REGION = "us-central1"  # Change this to your preferred region

# Step 1: Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Green
docker build -t "gcr.io/$PROJECT_ID/$SERVICE_NAME" .

# Step 2: Configure Docker to use Google Cloud as a credential helper
Write-Host "Configuring Docker authentication..." -ForegroundColor Green
gcloud auth configure-docker

# Step 3: Push the image to Google Container Registry
Write-Host "Pushing image to Google Container Registry..." -ForegroundColor Green
docker push "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Step 4: Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Green
gcloud run deploy $SERVICE_NAME `
  --image "gcr.io/$PROJECT_ID/$SERVICE_NAME" `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your application should be available at the URL shown above." -ForegroundColor Green
