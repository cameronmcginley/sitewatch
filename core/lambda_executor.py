import asyncio
import os
import time
import logging
from aiohttp import ClientSession
from utils import send_email
from constants import CHECKTYPE_TO_FUNCTION_MAP, TIMEOUT_LIMIT
import boto3
from botocore.exceptions import ClientError
from collections import defaultdict
from datetime import datetime, timezone
from fetch_url import fetch_url

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

logger.info("Starting Executor Lambda")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMODB_TABLE_NAME"])

DEBUG = os.environ.get("debug", "false") == "true"
error_counter = {"errors": 0, "total": 0}


async def update_dynamodb_item(pk, sk, last_result):
    """
    Update an item in DynamoDB with the latest result.

    Args:
        pk (str): The partition key of the item to update.
        sk (str): The sort key of the item to update.
        last_result (dict): The last result to be stored in DynamoDB.
    """
    try:
        response = await asyncio.to_thread(
            table.update_item,
            Key={"pk": pk, "sk": sk},
            UpdateExpression="SET lastResult = :lr, runNowOverride = :rno",
            ExpressionAttributeValues={
                ":lr": last_result,
                ":rno": False,
            },
        )
        logger.info(f"Updated DynamoDB item: PK={pk}, SK={sk}")
        logger.debug(f"Last Result: {last_result}")
    except ClientError as e:
        logger.error(f"Error updating item {pk} in DynamoDB: {e}")


async def process_check(session, check):
    """
    Process a single check asynchronously.

    Args:
        session (ClientSession): The aiohttp client session.
        check (dict): The check to process.
    """
    global error_counter
    error_counter["total"] += 1
    start_time = time.time()

    logger.info(f"Starting to process check: {check['url']} at {start_time}")

    try:
        if check["checkType"] in CHECKTYPE_TO_FUNCTION_MAP:
            content = await fetch_url(
                logger, session, check["url"], useProxy=check["useProxy"]
            )

            if not content:
                raise Exception("Failed to fetch URL content")

            # Decode the content from bytes to string
            content_str = (
                content.decode("utf-8") if isinstance(content, bytes) else content
            )

            result = await CHECKTYPE_TO_FUNCTION_MAP[check["checkType"]](
                check, content_str
            )

            # link.update(result)
            check["result"] = result

            last_result = {
                "status": "ALERTED" if check["result"]["send_alert"] else "NO ALERT",
                "message": check["result"]["message"],
                "timestamp": datetime.now(timezone.utc).strftime(
                    "%Y-%m-%dT%H:%M:%S.%fZ"
                ),
            }

            await update_dynamodb_item(check["pk"], check["sk"], last_result)
            logger.info(
                f"Processed {check['url']}: {'ALERTED' if check['send_alert'] else 'NO ALERT'}"
            )
        else:
            raise Exception(f"Unknown check type: {check['checkType']}")
    except Exception as e:
        logger.error(f"Error processing {check['url']}: {str(e)}")
        error_counter["errors"] += 1
        check["send_alert"] = False

        # Update DynamoDB with error information
        last_result = {
            "status": "FAILED",
            "message": str(e),
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
        }
        await update_dynamodb_item(check["pk"], check["sk"], last_result)
    finally:
        elapsed_time = time.time() - start_time
        if elapsed_time > TIMEOUT_LIMIT:
            logger.warning(f"Processing {check['url']} took {elapsed_time:.2f} seconds")
        else:
            logger.info(
                f"Finished processing {check['url']} at {time.time()} in {elapsed_time:.2f} seconds"
            )


async def main_handler(event, context):
    """
    Main asynchronous handler function.

    Args:
        event (dict): The event data passed to the Lambda function.
        context (object): The context in which the Lambda function is running.

    This function processes all checks and sends email notifications for available products.
    """
    start_time = time.time()
    checks = event.get("checks", [])
    logger.info(f"Starting processing of {len(checks)} checks")

    async with ClientSession() as session:
        tasks = [process_check(session, check) for check in checks]
        await asyncio.gather(*tasks)

    elapsed_time = time.time() - start_time
    logger.info(f"Execution time: {elapsed_time:.2f} seconds")
    logger.info(f"Errors: {error_counter['errors']} out of {error_counter['total']}")

    checks_to_alert = [check for check in checks if check.get("send_alert") is True]
    logger.info(f"Found {len(checks_to_alert)} URLs requiring alerts")

    await send_alerts(checks_to_alert)


async def update_most_recent_alert(pk, sk):
    """
    Update the most recent alert timestamp for a user.

    Args:
        pk (str): The partition key of the item to update.
        sk (str): The sort key of the item to update.
    """
    try:
        update_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        response = await asyncio.to_thread(
            table.update_item,
            Key={"pk": pk, "sk": sk},
            UpdateExpression="SET mostRecentAlert = :ua",
            ExpressionAttributeValues={":ua": update_time},
        )
        logger.info(f"Updated most recent alert for user: PK={pk}, SK={sk}")
        logger.debug(f"Updated At: {update_time}")
    except ClientError as e:
        logger.error(f"Error updating most recent alert for user {pk}: {e}")


async def send_alerts(checks):
    """
    Send email alerts for products that have updates.

    Args:
        checks (list): A list of checks to be processed.

    This function groups products by email and sends email alerts for each group.
    """
    if not checks:
        logger.info("No alerts to send")
        return

    # Update most recent alert for all checks concurrently
    update_tasks = [
        update_most_recent_alert(check["pk"], check["sk"]) for check in checks
    ]
    await asyncio.gather(*update_tasks)

    # Group products by email
    checks_by_email = defaultdict(list)
    for check in checks:
        checks_by_email[check["email"]].append(check)

    EMAIL_SENDER = os.environ["email_sender"]
    EMAIL_PASSWORD = os.environ["email_password"]

    for email, checks in checks_by_email.items():
        subject = (
            f"SiteWatch Alert on {len(checks)} URL{'s' if len(checks) > 1 else ''}"
        )
        body = "The following urls have updates:\n\n"

        for check in checks:
            body += f"Product: {check['alias']}\n"
            body += f"URL: {check['url']}\n"
            body += f"  Check type: {check['checkType']}\n"

            if check["checkType"] == "EBAY PRICE THRESHOLD":
                body += f"  Current Price: ${check['result']['found_price']:.2f}\n"
                body += f"  Threshold Price: ${check['attributes']['threshold']:.2f}\n"
            elif check["checkType"] == "KEYWORD CHECK":
                body += f"  Keyword: {check['attributes']['keyword']}\n"

            body += "\n"

        logger.info(f"Sending alert email to {email} for {len(checks)} URLs")
        await asyncio.to_thread(
            send_email, EMAIL_SENDER, email, EMAIL_PASSWORD, subject, body
        )

    logger.info(
        f"Sent alerts for {len(checks)} urls to {len(checks_by_email)} email(s)"
    )


def lambda_handler(event, context):
    """
    AWS Lambda function handler.

    Args:
        event (dict): The event data passed to the Lambda function.
        context (object): The context in which the Lambda function is running.

    Returns:
        The result of the main_handler function.
    """
    logger.info("Starting Executor Lambda")
    result = asyncio.run(main_handler(event, context))
    logger.info("Executor Lambda completed")
    return result
