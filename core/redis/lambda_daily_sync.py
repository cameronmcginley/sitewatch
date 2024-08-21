import os
import json
import redis
import logging
import boto3
from boto3.dynamodb.conditions import Attr
from redis_utils import write_all_items_to_redis

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

    scan_kwargs = {"FilterExpression": Attr("status").eq("ACTIVE")}
    items = []
    response = table.scan(**scan_kwargs)

    while "LastEvaluatedKey" in response:
        items.extend(response["Items"])
        response = table.scan(
            **scan_kwargs, ExclusiveStartKey=response["LastEvaluatedKey"]
        )

    items.extend(response["Items"])

    logger.info(f"Found {len(items)} items in DynamoDB")

    write_all_items_to_redis(redis_client, items, logger)

    logger.info("Completed daily sync from DynamoDB to Redis")

    return {
        "statusCode": 200,
        "body": json.dumps("Completed daily sync from DynamoDB to Redis"),
    }
