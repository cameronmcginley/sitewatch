import os
import json
import asyncio
import boto3
import logging
import redis
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

# Initialize Redis client
redis_client = redis.Redis(
    host=os.environ.get("REDIS_HOST"),
    port=int(os.environ.get("REDIS_PORT")),
    password=os.environ.get("REDIS_PASSWORD"),
    decode_responses=True,
)


def transform_item(item):
    """
    Transform a DynamoDB item into the format expected by the processing Lambda.
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


# async def read_from_redis():
#     """
#     Asynchronously read the entire Redis cache.

#     Returns:
#         list: A list of items from the Redis cache.
#     """
#     logger.info("Attempting to read from Redis cache")
#     try:
#         cache = await asyncio.to_thread(redis_client.hgetall, "cache")
#         items = list(cache.values())
#         # Convert attributes field back to a dictionary
#         items = [json.loads(item) for item in items]
#         logger.info(f"Successfully read {len(items)} items from Redis cache")
#         logger.info(f"First item: {items[0]}")
#         return items
#     except Exception as e:
#         logger.error(f"Failed to read from Redis cache: {str(e)}")
#         raise


async def read_from_redis():
    """
    Asynchronously read the entire Redis cache.

    Returns:
        list: A list of items from the Redis cache, where each item is a dictionary of fields.
    """
    logger.info("Attempting to read from Redis cache")
    try:
        # Assume "cache" is a list of keys, you would iterate over these keys to get full items
        keys = await asyncio.to_thread(redis_client.keys, "*")
        items = []

        for key in keys:
            item = await asyncio.to_thread(redis_client.hgetall, key)
            # Deserialize any JSON-encoded fields
            for field, value in item.items():
                try:
                    item[field] = json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    # If it's not a JSON string, keep the original value
                    pass
            items.append(item)

        logger.info(f"Successfully read {len(items)} items from Redis cache")
        if items:
            logger.info(f"First item: {items[0]}")
        return items
    except Exception as e:
        logger.error(f"Failed to read from Redis cache: {str(e)}")
        raise


async def scan_table():
    """
    Asynchronously scan the DynamoDB table for active items, falling back to DynamoDB if Redis fails.

    Returns:
        list: A list of active items from the DynamoDB table.
    """
    try:
        # If env var is false, dont read from redis
        if os.environ.get("USE_REDIS", "false").lower() == "false":
            raise Exception("USE_REDIS is set to false")
        items = await read_from_redis()
    except Exception:
        logger.info("Falling back to DynamoDB scan")
        items = []
        scan_kwargs = {"FilterExpression": Attr("status").eq("ACTIVE")}

        while True:
            response = await asyncio.to_thread(table.scan, **scan_kwargs)
            items.extend(response["Items"])
            logger.info(
                f"Scanned {len(response['Items'])} items, total items: {len(items)}"
            )
            logger.info(f"First item: {items[0]}")

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

    # Get items from Redis cache, if it fails then use DynamoDB
    items = await scan_table()
    logger.info(f"Retrieved {len(items)} items")

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
