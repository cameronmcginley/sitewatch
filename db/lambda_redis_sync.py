import os
import json
import redis
import logging
import boto3
from boto3.dynamodb.conditions import Attr
from utils import write_all_items_to_redis, get_redis_key

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB and Redis clients
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMODB_TABLE_NAME"])
redis_client = redis.Redis(
    host=os.environ.get("REDIS_HOST"),
    port=int(os.environ.get("REDIS_PORT")),
    password=os.environ.get("REDIS_PASSWORD"),
    decode_responses=True,
)


def lambda_handler(event, context):
    """
    Lambda function to sync DynamoDB data to Redis cache daily.
    """
    logger.info("Starting daily sync from DynamoDB to Redis")
    logger.info("Received event: " + json.dumps(event, indent=2))

    scan_kwargs = {
        "FilterExpression": Attr("status").eq("ACTIVE") & Attr("sk").eq("CHECK")
    }
    items = []
    response = table.scan(**scan_kwargs)

    while "LastEvaluatedKey" in response:
        items.extend(response["Items"])
        response = table.scan(
            **scan_kwargs, ExclusiveStartKey=response["LastEvaluatedKey"]
        )

    items.extend(response["Items"])

    logger.info(f"Found {len(items)} items in DynamoDB")

    redis_keys = set(key for key in redis_client.keys(f"{os.environ.get('STAGE')}:*:*"))

    for item in items:
        redis_key = get_redis_key(item["pk"], item["sk"])
        # Remove key from redis_keys to avoid deletion later
        redis_keys.discard(redis_key)

    write_all_items_to_redis(redis_client, items, logger)

    # Delete items in Redis that are no longer in DynamoDB for this stage
    logger.info(f"Deleting {len(redis_keys)} items from Redis")
    logger.debug(f"Keys to delete: {redis_keys}")
    for redis_key in redis_keys:
        redis_client.delete(redis_key)

    logger.info("Completed daily sync from DynamoDB to Redis")

    return {
        "statusCode": 200,
        "body": json.dumps("Completed daily sync from DynamoDB to Redis"),
    }
