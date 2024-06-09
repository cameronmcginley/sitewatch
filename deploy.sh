#!/bin/bash

# Ensure the script stops on errors
set -e

# Variables
LAMBDA_FUNCTION_NAME="FalloutStore"
AWS_REGION="us-east-2"
AWS_ACCOUNT_ID="992382695229"
ECR_REPOSITORY="falloutstoreecr"
IMAGE_TAG="latest"
IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"

# Step 1: Authenticate Docker to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 2: Build the Docker image
docker build --platform linux/amd64 -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

# Step 3: Tag the Docker image for ECR
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${IMAGE_URI}

# Step 4: Push the image to ECR
docker push ${IMAGE_URI}

# Step 5: Update the Lambda function to use the new image
aws lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --image-uri ${IMAGE_URI} --region ${AWS_REGION}

echo "Successfully deployed"
