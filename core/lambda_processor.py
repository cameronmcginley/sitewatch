import os
import json
import asyncio
import boto3
from boto3.dynamodb.conditions import Attr
from constants import BATCH_SIZE

# Initialize DynamoDB and Lambda clients
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMODB_TABLE_NAME"])
lambda_client = boto3.client("lambda")


def transform_item(item):
    """
    Transform a DynamoDB item into the format expected by the processing Lambda.

    Args:
        item (dict): The DynamoDB item to transform.

    Returns:
        dict: The transformed item.
    """
    transformed = {
        "alias": item["alias"]["S"],
        "type": item["check_type"]["S"],
        "url": item["url"]["S"],
        "email": item["email"]["S"],
        "pk": item["pk"]["S"],
        "sk": item["sk"]["S"],
    }

    if item["check_type"]["S"] == "EBAY PRICE THRESHOLD":
        transformed["threshold"] = float(item["attributes"]["M"]["threshold"]["N"])
    elif item["check_type"]["S"] == "KEYWORD CHECK":
        transformed["keyword"] = item["attributes"]["M"]["keyword"]["S"]
        transformed["opposite"] = item["attributes"]["M"]["opposite"]["B"]

    return transformed


async def scan_table():
    """
    Asynchronously scan the DynamoDB table for active items.

    Returns:
        list: A list of active items from the DynamoDB table.
    """
    items = []
    scan_kwargs = {"FilterExpression": Attr("status").eq("ACTIVE")}

    while True:
        response = await asyncio.to_thread(table.scan, **scan_kwargs)
        items.extend(response["Items"])

        if "LastEvaluatedKey" not in response:
            break
        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

    return items


async def invoke_executor(batch):
    """
    Asynchronously invoke the executor Lambda function.

    Args:
        batch (list): A batch of items to be processed by the Lambda function.
    """
    await asyncio.to_thread(
        lambda_client.invoke,
        FunctionName=os.environ["EXECUTOR_LAMBDA_NAME"],
        InvocationType="Event",
        Payload=json.dumps({"links": batch}),
    )


async def lambda_handler(event, context):
    """
    Main Lambda handler function.

    Args:
        event (dict): The event data passed to the Lambda function.
        context (object): The context in which the Lambda function is running.

    Returns:
        dict: A response containing the status code and a summary of the processing.
    """
    items = await scan_table()
    transformed_items = [transform_item(item) for item in items]
    batches = [
        transformed_items[i : i + BATCH_SIZE]
        for i in range(0, len(transformed_items), BATCH_SIZE)
    ]

    # Invoke a new executor Lambda function for each batch
    await asyncio.gather(*[invoke_executor(batch) for batch in batches])

    return {
        "statusCode": 200,
        "body": json.dumps(f"Processed {len(items)} URLs in {len(batches)} batches"),
    }


if __name__ == "__main__":
    asyncio.run(lambda_handler({}, None))
