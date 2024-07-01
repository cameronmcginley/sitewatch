import asyncio
import gc
import os
import time

import yarl
import aiohttp
from aiohttp import ClientSession
from lxml import html

# from links import CheckType, links
from utils import send_email, sum_of_numbers

# import links from links.json
import json

print("Loading function")

DEBUG = os.environ.get("debug", "false") == "true"
TIMEOUT_LIMIT = 100000
error_counter = {"errors": 0, "total": 0}


async def fetch(session, link):
    global error_counter
    error_counter["total"] += 1
    start_time = time.time()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0"
    }
    url = yarl.URL(link["url"], encoded=True)
    try:
        async with session.get(url, timeout=TIMEOUT_LIMIT) as response:
            if response.status == 200:
                content = b""
                async for chunk in response.content.iter_chunked(1024):
                    content += chunk

                tree = html.fromstring(content)

                # AVAILABILITY CHECK
                if link["type"] == "AVAILABILITY":
                    if link["text_when_unavailable"] not in tree.text_content():
                        link["is_available"] = True
                    else:
                        link["is_available"] = False

                # EBAY PRICE THRESHOLD CHECK
                if link["type"] == "EBAY_PRICE_THRESHOLD":
                    first_item = tree.cssselect(
                        "ul.srp-results.srp-grid.clearfix > li:nth-of-type(2)"
                    )
                    if first_item:
                        price_element = first_item[0].cssselect("span.s-item__price")
                        shipping_element = first_item[0].cssselect(
                            "span.s-item__shipping"
                        )

                        if price_element and shipping_element:
                            price = (
                                price_element[0].text_content().strip()
                                if price_element[0].text_content()
                                else ""
                            )
                            shipping = (
                                shipping_element[0].text_content().strip()
                                if shipping_element[0].text_content()
                                else ""
                            )

                            if DEBUG:
                                print(f"Debug: Price text for {link['url']}: '{price}'")
                            if DEBUG:
                                print(
                                    f"Debug: Shipping text for {link['url']}: '{shipping}'"
                                )

                            try:
                                if price and shipping:
                                    total_price = sum_of_numbers(price, shipping)

                                    if total_price < link["threshold"]:
                                        link["is_available"] = True
                                        link["found_price"] = total_price
                                    else:
                                        link["is_available"] = False
                                else:
                                    print(
                                        f"Price or shipping text is empty for {link['url']}"
                                    )
                                    link["is_available"] = False
                            except TypeError as e:
                                print(f"Error parsing price for {link['url']}: {e}")
                                link["is_available"] = False
                        else:
                            print(
                                f"Price or shipping elements missing for {link['url']}"
                            )
                            link["is_available"] = False

                del content
                del tree
                gc.collect()
            else:
                print(f"Error fetching {link['url']}: {response.status}")
                error_counter["errors"] += 1
    except aiohttp.ClientError as e:
        print(f"Error fetching {link['url']}: {str(e)}")
        error_counter["errors"] += 1
    except Exception as e:
        print(f"Unexpected error with {link['url']}: {e}")
        error_counter["errors"] += 1
    finally:
        elapsed_time = time.time() - start_time
        if elapsed_time > TIMEOUT_LIMIT:
            print(f"Warning: Fetching {link['url']} took {elapsed_time:.2f} seconds")


async def main_handler(event, context):
    start_time = time.time()

    # Read from even json if provided, else fall back to links.json
    if event.get("links"):
        links = event["links"]
    else:
        with open("links.json", "r") as f:
            links = json.load(f)["links"]

    async with ClientSession() as session:
        tasks = [fetch(session, link) for link in links]
        await asyncio.gather(*tasks)

    print(f"Execution time: {time.time() - start_time:.2f} seconds")
    print(f"Errors: {error_counter['errors']} out of {error_counter['total']}")

    available_products = [link for link in links if link["is_available"] is True]

    body = f"Available products: {len(available_products)}\n"
    body += "\n".join(
        f"{p['alias']} - ${p['found_price']} - {p['url']}"
        if p.get("found_price")
        else f"{p['alias']} - {p['url']}"
        for p in available_products
    )

    print(body)

    if not available_products:
        return

    EMAIL_SENDER = os.environ["email_sender"]
    EMAIL_RECEIVER = os.environ["email_receiver"]
    EMAIL_PASSWORD = os.environ["email_password"]
    send_email(
        EMAIL_SENDER, EMAIL_RECEIVER, EMAIL_PASSWORD, "Product Availability", body
    )


def lambda_handler(event, context):
    return asyncio.run(main_handler(event, context))
