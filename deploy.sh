# #!/bin/bash

# # Ensure the script stops on errors
# set -e

# # Variables
# LAMBDA_FUNCTION_NAME="FalloutStore"
# AWS_REGION="us-east-2"

# # Step 1: Build the Docker image
# docker build -t lambda-build .

# # Step 2: Run the Docker container to create the deployment package
# docker run --rm -v $(pwd):/app lambda-build

# # Step 3: Deploy to AWS Lambda
# aws lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --zip-file fileb://lambda_function.zip --region ${AWS_REGION}

# # Step 4: Clean up
# rm lambda_function.zip

# docker build --platform linux/amd64 -t docker-image:test .
# echo "Successfully deployed"

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
ROLE_ARN="arn:aws:iam::992382695229:role/service-role/FalloutStore-role-12cko6755"

# Step 1: Authenticate Docker to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 2: Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} > /dev/null 2>&1 || \
aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION} --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE

# Step 3: Build the Docker image
docker build --platform linux/amd64 -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

# Step 4: Tag the Docker image for ECR
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${IMAGE_URI}

# Step 5: Push the image to ECR
docker push ${IMAGE_URI}

# Step 6: Check if Lambda function exists
if aws lambda get-function --function-name ${LAMBDA_FUNCTION_NAME} --region ${AWS_REGION} > /dev/null 2>&1; then
    # Check the package type of the existing Lambda function
    PACKAGE_TYPE=$(aws lambda get-function-configuration --function-name ${LAMBDA_FUNCTION_NAME} --region ${AWS_REGION} --query 'PackageType' --output text)

    if [ "${PACKAGE_TYPE}" == "Zip" ]; then
        # Delete the existing function if it is using the ZIP package type
        aws lambda delete-function --function-name ${LAMBDA_FUNCTION_NAME} --region ${AWS_REGION}
        # Create a new Lambda function with the specified image
        aws lambda create-function \
          --function-name ${LAMBDA_FUNCTION_NAME} \
          --package-type Image \
          --code ImageUri=${IMAGE_URI} \
          --role ${ROLE_ARN} \
          --region ${AWS_REGION}
    else
        # Update the Lambda function to use the new image
        aws lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --image-uri ${IMAGE_URI} --region ${AWS_REGION}
    fi
else
    # Create a new Lambda function with the specified image
    aws lambda create-function \
      --function-name ${LAMBDA_FUNCTION_NAME} \
      --package-type Image \
      --code ImageUri=${IMAGE_URI} \
      --role ${ROLE_ARN} \
      --region ${AWS_REGION}
fi

# Step 7: Print success message
echo "Successfully deployed"