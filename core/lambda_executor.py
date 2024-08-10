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

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

print("Loading function")

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
        update_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        response = await asyncio.to_thread(
            table.update_item,
            Key={"pk": pk, "sk": sk},
            UpdateExpression="SET lastResult = :lr, updatedAt = :ua",
            ExpressionAttributeValues={
                ":lr": last_result,
                ":ua": update_time,
            },
        )
        logger.info(f"Updated DynamoDB item: PK={pk}, SK={sk}")
        logger.debug(f"Last Result: {last_result}")
        logger.debug(f"Updated At: {update_time}")
    except ClientError as e:
        logger.error(f"Error updating item {pk} in DynamoDB: {e}")


async def process_link(session, link):
    """
    Process a single link asynchronously.

    Args:
        session (ClientSession): The aiohttp client session.
        link (dict): The link to process.
    """
    global error_counter
    error_counter["total"] += 1
    start_time = time.time()

    logger.info(f"Processing link: {link['url']}")

    try:
        if link["type"] in CHECKTYPE_TO_FUNCTION_MAP:
            result = await CHECKTYPE_TO_FUNCTION_MAP[link["type"]](session, link)

            link["send_alert"] = result["send_alert"]

            # Custom fields for different check types
            # Just attach result instead?
            if "found_price" in result:
                link["found_price"] = result["found_price"]

            last_result = {
                "status": "ALERTED" if result["send_alert"] else "NO ALERT",
                "message": result["message"],
                "timestamp": datetime.now(timezone.utc).strftime(
                    "%Y-%m-%dT%H:%M:%S.%fZ"
                ),
            }

            if "found_price" in result:
                last_result["found_price"] = {"N": str(result["found_price"])}

            await update_dynamodb_item(link["pk"], link["sk"], last_result)
            logger.info(
                f"Processed {link['url']}: {'ALERTED' if result['send_alert'] else 'NO ALERT'}"
            )
        else:
            raise Exception(f"Unknown check type: {link['type']}")
    except Exception as e:
        logger.error(f"Error processing {link['url']}: {str(e)}")
        error_counter["errors"] += 1
        link["send_alert"] = False

        # Update DynamoDB with error information
        last_result = {
            "status": "FAILED",
            "message": str(e),
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
        }
        await update_dynamodb_item(link["pk"], link["sk"], last_result)
    finally:
        elapsed_time = time.time() - start_time
        if elapsed_time > TIMEOUT_LIMIT:
            logger.warning(f"Processing {link['url']} took {elapsed_time:.2f} seconds")
        else:
            logger.info(f"Processed {link['url']} in {elapsed_time:.2f} seconds")


async def main_handler(event, context):
    """
    Main asynchronous handler function.

    Args:
        event (dict): The event data passed to the Lambda function.
        context (object): The context in which the Lambda function is running.

    This function processes all links and sends email notifications for available products.
    """
    start_time = time.time()
    links = event.get("links", [])
    logger.info(f"Starting processing of {len(links)} links")

    async with ClientSession() as session:
        tasks = [process_link(session, link) for link in links]
        await asyncio.gather(*tasks)

    elapsed_time = time.time() - start_time
    logger.info(f"Execution time: {elapsed_time:.2f} seconds")
    logger.info(f"Errors: {error_counter['errors']} out of {error_counter['total']}")

    urls_to_alert = [link for link in links if link.get("send_alert") is True]
    logger.info(f"Found {len(urls_to_alert)} URLs requiring alerts")

    await send_alerts(urls_to_alert)


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


async def send_alerts(urls_to_alert):
    """
    Send email alerts for products that have updates.

    Args:
        links (list): A list of links to be processed.

    This function groups products by email and sends email alerts for each group.
    """
    if not urls_to_alert:
        logger.info("No alerts to send")
        return

    # Update most recent alert for all URLs concurrently
    update_tasks = [
        update_most_recent_alert(url["pk"], url["sk"]) for url in urls_to_alert
    ]
    await asyncio.gather(*update_tasks)

    # Group products by email
    urls_by_email = defaultdict(list)
    for url in urls_to_alert:
        urls_by_email[url["email"]].append(url)

    EMAIL_SENDER = os.environ["email_sender"]
    EMAIL_PASSWORD = os.environ["email_password"]

    for email, urls in urls_by_email.items():
        subject = f"SiteWatch Alert on {len(urls)} URL{'s' if len(urls) > 1 else ''}"
        body = "The following urls have updates:\n\n"

        for url in urls:
            body += f"Product: {url['alias']}\n"
            body += f"URL: {url['url']}\n"
            body += f"  Check type: {url['type']}\n"

            if url["type"] == "EBAY PRICE THRESHOLD":
                body += f"  Current Price: ${url['found_price']:.2f}\n"
                body += f"  Threshold Price: ${url['threshold']:.2f}\n"
            elif url["type"] == "KEYWORD CHECK":
                body += f"  Keyword: {url['keyword']}\n"

            body += "\n"

        logger.info(f"Sending alert email to {email} for {len(urls)} URLs")
        await asyncio.to_thread(
            send_email, EMAIL_SENDER, email, EMAIL_PASSWORD, subject, body
        )

    logger.info(
        f"Sent alerts for {len(urls_to_alert)} urls to {len(urls_by_email)} email(s)"
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
