import asyncio
import os
import time
from aiohttp import ClientSession
from utils import send_email
from constants import CHECKTYPE_TO_FUNCTION_MAP, TIMEOUT_LIMIT

print("Loading function")

DEBUG = os.environ.get("debug", "false") == "true"
error_counter = {"errors": 0, "total": 0}


async def process_link(session, link):
    global error_counter
    error_counter["total"] += 1
    start_time = time.time()

    try:
        if link["type"] in CHECKTYPE_TO_FUNCTION_MAP:
            await CHECKTYPE_TO_FUNCTION_MAP[link["type"]](session, link)
        else:
            print(f"Unknown check type: {link['type']}")
            link["is_available"] = False
    except Exception as e:
        print(f"Error processing {link['url']}: {str(e)}")
        error_counter["errors"] += 1
        link["is_available"] = False
    finally:
        elapsed_time = time.time() - start_time
        if elapsed_time > TIMEOUT_LIMIT:
            print(f"Warning: Processing {link['url']} took {elapsed_time:.2f} seconds")


async def main_handler(event, context):
    start_time = time.time()

    links = event.get("links", [])

    async with ClientSession() as session:
        tasks = [process_link(session, link) for link in links]
        await asyncio.gather(*tasks)

    print(f"Execution time: {time.time() - start_time:.2f} seconds")
    print(f"Errors: {error_counter['errors']} out of {error_counter['total']}")

    available_products = [link for link in links if link.get("is_available") is True]

    if not available_products:
        return

    EMAIL_SENDER = os.environ["email_sender"]
    EMAIL_PASSWORD = os.environ["email_password"]

    for product in available_products:
        body = f"Alert for: {product['alias']}\nURL: {product['url']}"
        if product["type"] == "EBAY_PRICE_THRESHOLD":
            body += f"\nCurrent Price: ${product['found_price']}"
        send_email(
            EMAIL_SENDER,
            product["email"],
            EMAIL_PASSWORD,
            f"Alert: {product['alias']}",
            body,
        )


def lambda_handler(event, context):
    return asyncio.run(main_handler(event, context))
