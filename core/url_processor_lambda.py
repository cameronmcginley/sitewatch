import os
import json
import boto3
from boto3.dynamodb.conditions import Attr

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMODB_TABLE_NAME"])

# Initialize Lambda client
lambda_client = boto3.client("lambda")


def transform_item(item):
    """Transform a DynamoDB item into the format expected by the processing Lambda."""
    transformed = {
        "alias": item["alias"],
        "type": item["check_type"],
        "url": item["url"],
        "email": item["email"],
    }

    if item["check_type"] == "AVAILABILITY":
        transformed["text_when_unavailable"] = item.get("text_when_unavailable", "")
    elif item["check_type"] == "EBAY_PRICE_THRESHOLD":
        transformed["threshold"] = float(item["attributes"]["threshold"])

    return transformed


def lambda_handler(event, context):
    # Scan DynamoDB table to get all active checks
    response = table.scan(FilterExpression=Attr("status").eq("ACTIVE"))
    items = response["Items"]

    # Continue scanning if we have more items (pagination)
    while "LastEvaluatedKey" in response:
        response = table.scan(
            ExclusiveStartKey=response["LastEvaluatedKey"],
            FilterExpression=Attr("status").eq("ACTIVE"),
        )
        items.extend(response["Items"])

    # Transform items into the format expected by the processing Lambda
    transformed_items = [transform_item(item) for item in items]

    # Split items into batches of 500
    batch_size = 500
    batches = [
        transformed_items[i : i + batch_size]
        for i in range(0, len(transformed_items), batch_size)
    ]

    # Invoke a new Lambda function for each batch
    for batch in batches:
        lambda_client.invoke(
            FunctionName=os.environ["PROCESSOR_LAMBDA_NAME"],
            InvocationType="Event",
            Payload=json.dumps({"links": batch}),
        )

    return {
        "statusCode": 200,
        "body": json.dumps(f"Processed {len(items)} URLs in {len(batches)} batches"),
    }
