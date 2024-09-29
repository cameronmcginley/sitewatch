import os
import json
import asyncio
import boto3
import redis
from boto3.dynamodb.conditions import Attr
from constants import BATCH_SIZE
from utils import is_task_ready_to_run
from aws_lambda_powertools import Logger

logger = Logger()

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMODB_TABLE_NAME"])
lambda_client = boto3.client("lambda")

redis_client = redis.Redis(
    host=os.environ.get("REDIS_HOST"),
    port=int(os.environ.get("REDIS_PORT")),
    password=os.environ.get("REDIS_PASSWORD"),
    decode_responses=True,
)


def transform_item(check):
    """
    Transform a DynamoDB item into the format expected by the processing Lambda.
    """
    logger.info(f"Transforming check item: {check['pk']}")
    transformed = {
        "alias": check.get("alias"),
        "checkType": check.get("checkType"),
        "url": check.get("url"),
        "email": check.get("email"),
        "pk": check.get("pk"),
        "sk": check.get("sk"),
        "cron": check.get("cron"),
        "useProxy": check.get("useProxy", False),
        "runNowOverride": check.get("runNowOverride", False),
        "attributes": check.get("attributes", {}),
        "lastResult": check.get("lastResult", {}),
    }

    return transformed


async def read_from_redis():
    """
    Asynchronously read the entire Redis cache.

    Returns:
        list: A list of items from the Redis cache, where each item is a dictionary of fields.
    """
    logger.info("Attempting to read from Redis cache")
    try:
        keys = await asyncio.to_thread(
            redis_client.keys, f"{os.environ.get('STAGE')}:*:*"
        )
        items = []

        for key in keys:
            item = await asyncio.to_thread(redis_client.hgetall, key)
            # Deserialize any JSON-encoded fields
            for field, value in item.items():
                try:
                    item[field] = json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    pass
                # Convert specific fields to boolean
                if field in ["useProxy", "runNowOverride"]:
                    item[field] = value.lower() == "true"
            items.append(item)

        logger.info(f"Successfully read {len(items)} items from Redis cache")
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

            if "LastEvaluatedKey" not in response:
                break
            scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

        logger.info(f"Completed table scan, found {len(items)} active items")

    items = [item for item in items if item.get("cron")]

    return items


async def invoke_executor(batch):
    """
    Asynchronously invoke the executor Lambda function.

    Args:
        batch (list): A batch of check items to be processed by the Lambda function.
    """
    logger.info(f"Invoking executor for batch of {len(batch)} checks")
    await asyncio.to_thread(
        lambda_client.invoke,
        FunctionName=os.environ["EXECUTOR_LAMBDA_NAME"],
        InvocationType="Event",
        Payload=json.dumps({"checks": batch}),
    )
    logger.debug(f"Executor invoked successfully for batch of {len(batch)} checks")


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

    checks = await scan_table()
    logger.info(f"Retrieved {len(checks)} checks")

    checks_to_run = [check for check in checks if is_task_ready_to_run(check["cron"])]
    logger.info(
        f"{len(checks_to_run)} checks are ready to run based on their cron schedule"
    )
    checks_to_run_override = [
        check for check in checks if check.get("runNowOverride", False)
    ]
    logger.info(f"{len(checks_to_run_override)} checks are set to run with override")
    checks_to_run.extend(checks_to_run_override)

    transformed_checks = [transform_item(check) for check in checks_to_run]
    logger.info(f"Transformed {len(transformed_checks)} checks for processing")

    batches = [
        transformed_checks[i : i + BATCH_SIZE]
        for i in range(0, len(transformed_checks), BATCH_SIZE)
    ]
    logger.info(
        f"Created {len(batches)} batches of checks, each with up to {BATCH_SIZE} checks"
    )

    await asyncio.gather(*[invoke_executor(batch) for batch in batches])
    logger.info(f"Invoked {len(batches)} Executor Lambda functions")

    summary = f"Processed {len(checks)} checks, with {len(checks_to_run)} set to run in {len(batches)} batches"
    logger.info(f"Processor Lambda execution completed. Summary: {summary}")

    return {
        "statusCode": 200,
        "body": json.dumps(summary),
    }


@logger.inject_lambda_context
def lambda_handler(event, context):
    return asyncio.run(main_handler(event, context))


if __name__ == "__main__":
    asyncio.run(lambda_handler({}, None))
