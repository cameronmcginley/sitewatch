import os
import json
import asyncio
import boto3
import logging
from boto3.dynamodb.conditions import Attr
from constants import BATCH_SIZE
from utils import is_task_ready_to_run

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
    logger.info(f"Transforming item: {item['pk']}")
    transformed = {
        "alias": item.get("alias"),
        "type": item.get("check_type"),
        "url": item.get("url"),
        "email": item.get("email"),
        "pk": item.get("pk"),
        "sk": item.get("sk"),
        "cron": item.get("cron"),
        "useProxy": item.get("useProxy", False),
    }

    if item["check_type"] == "EBAY PRICE THRESHOLD":
        transformed["threshold"] = float(item["attributes"]["threshold"])
        logger.debug(
            f"Added threshold {transformed['threshold']} for EBAY PRICE THRESHOLD item"
        )
    elif item["check_type"] == "KEYWORD CHECK":
        transformed["keyword"] = item["attributes"]["keyword"]
        transformed["opposite"] = item["attributes"]["opposite"]
        logger.debug(f"Added keyword '{transformed['keyword']}' for KEYWORD CHECK item")

    return transformed


async def scan_table():
    """
    Asynchronously scan the DynamoDB table for active items.

    Returns:
        list: A list of active items from the DynamoDB table.
    """
    logger.info("Starting DynamoDB table scan")
    items = []
    scan_kwargs = {"FilterExpression": Attr("status").eq("ACTIVE")}

    while True:
        response = await asyncio.to_thread(table.scan, **scan_kwargs)
        items.extend(response["Items"])
        logger.info(
            f"Scanned {len(response['Items'])} items, total items: {len(items)}"
        )

        if "LastEvaluatedKey" not in response:
            break
        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

    logger.info(f"Completed table scan, found {len(items)} active items")
    return items


async def invoke_executor(batch):
    """
    Asynchronously invoke the executor Lambda function.

    Args:
        batch (list): A batch of items to be processed by the Lambda function.
    """
    logger.info(f"Invoking executor for batch of {len(batch)} items")
    await asyncio.to_thread(
        lambda_client.invoke,
        FunctionName=os.environ["EXECUTOR_LAMBDA_NAME"],
        InvocationType="Event",
        Payload=json.dumps({"links": batch}),
    )
    logger.debug(f"Executor invoked successfully for batch of {len(batch)} items")


async def main_handler(event, context):
    """
    Main Lambda handler function.

    Args:
        event (dict): The event data passed to the Lambda function.
        context (object): The context in which the Lambda function is running.

    Returns:
        dict: A response containing the status code and a summary of the processing.
    """
    logger.info("Starting Processor Lambda execution")

    items = await scan_table()
    logger.info(f"Retrieved {len(items)} items from DynamoDB")
    logger.info(f"Items: type: {type(items)}, item #1: {items[0]}")

    items_to_run = [item for item in items if is_task_ready_to_run(item["cron"])]
    logger.info(
        f"{len(items_to_run)} items are ready to run based on their cron schedule"
    )

    transformed_items = [transform_item(item) for item in items_to_run]
    logger.info(f"Transformed {len(transformed_items)} items for processing")

    batches = [
        transformed_items[i : i + BATCH_SIZE]
        for i in range(0, len(transformed_items), BATCH_SIZE)
    ]
    logger.info(
        f"Created {len(batches)} batches of items, each with up to {BATCH_SIZE} items"
    )

    # Invoke a new executor Lambda function for each batch
    await asyncio.gather(*[invoke_executor(batch) for batch in batches])
    logger.info(f"Invoked {len(batches)} Executor Lambda functions")

    summary = f"Processed {len(items)} URLs, with {len(items_to_run)} set to run in {len(batches)} batches"
    logger.info(f"Processor Lambda execution completed. Summary: {summary}")

    return {
        "statusCode": 200,
        "body": json.dumps(summary),
    }


def lambda_handler(event, context):
    return asyncio.run(main_handler(event, context))


if __name__ == "__main__":
    asyncio.run(lambda_handler({}, None))
