import os
import json
import asyncio
import boto3
from boto3.dynamodb.conditions import Attr
from constants import BATCH_SIZE

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMODB_TABLE_NAME"])

# Initialize Lambda client
lambda_client = boto3.client("lambda")


def transform_item(item):
    """Transform a DynamoDB item into the format expected by the processing Lambda."""
    transformed = {
        "alias": item["alias"]["S"],
        "type": item["check_type"]["S"],
        "url": item["url"]["S"],
        "email": item["email"]["S"],
    }

    if item["check_type"]["S"] == "EBAY PRICE THRESHOLD":
        transformed["threshold"] = float(item["attributes"]["M"]["threshold"]["N"])
    elif item["check_type"]["S"] == "KEYWORD CHECK":
        transformed["keyword"] = item["attributes"]["M"]["keyword"]["S"]
        transformed["opposite"] = item["attributes"]["M"]["opposite"]["B"]

    return transformed


async def scan_table():
    """Asynchronously scan the DynamoDB table."""
    items = []
    scan_kwargs = {"FilterExpression": Attr("status").eq("ACTIVE")}

    while True:
        response = await asyncio.to_thread(table.scan, **scan_kwargs)
        items.extend(response["Items"])

        if "LastEvaluatedKey" not in response:
            break
        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

    return items


async def invoke_lambda(batch):
    """Asynchronously invoke the processor Lambda function."""
    await asyncio.to_thread(
        lambda_client.invoke,
        FunctionName=os.environ["PROCESSOR_LAMBDA_NAME"],
        InvocationType="Event",
        Payload=json.dumps({"links": batch}),
    )


async def lambda_handler(event, context):
    # Scan DynamoDB table to get all active checks
    items = await scan_table()

    # Transform items into the format expected by the processing Lambda
    transformed_items = [transform_item(item) for item in items]

    # Split items into batches
    batch_size = BATCH_SIZE
    batches = [
        transformed_items[i : i + batch_size]
        for i in range(0, len(transformed_items), batch_size)
    ]

    # Invoke a new Lambda function for each batch
    await asyncio.gather(*[invoke_lambda(batch) for batch in batches])

    return {
        "statusCode": 200,
        "body": json.dumps(f"Processed {len(items)} URLs in {len(batches)} batches"),
    }


# For local testing
if __name__ == "__main__":
    asyncio.run(lambda_handler({}, None))
