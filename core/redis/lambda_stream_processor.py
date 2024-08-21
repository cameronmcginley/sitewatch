import os
import json
import redis
import logging
from redis_utils import write_all_items_to_redis, extract_dynamodb_value

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize Redis client
redis_client = redis.Redis(
    host=os.environ.get("REDIS_HOST"),
    port=int(os.environ.get("REDIS_PORT")),
    password=os.environ.get("REDIS_PASSWORD"),
    decode_responses=True,
)


def lambda_handler(event, context):
    """
    Lambda function to process DynamoDB stream and update Redis.
    """
    logger.info("Received event: " + json.dumps(event, indent=2))

    for record in event["Records"]:
        event_name = record["eventName"]
        if event_name == "INSERT" or event_name == "MODIFY":
            new_image = record["dynamodb"]["NewImage"]

            write_all_items_to_redis(redis_client, [new_image], logger)

        elif event_name == "REMOVE":
            old_image = record["dynamodb"]["OldImage"]
            pk = old_image["pk"]["S"]
            sk = old_image["sk"]["S"]

            # Create a Redis key and delete the corresponding entry in Redis
            redis_key = f"{pk}:{sk}"
            redis_client.delete(redis_key)

            logger.info(f"Deleted Redis key {redis_key}")

    return {
        "statusCode": 200,
        "body": json.dumps("Processed DynamoDB stream and updated Redis"),
    }
