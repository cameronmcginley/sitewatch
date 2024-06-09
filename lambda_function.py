# import gc
# import os
# import asyncio
# import aiohttp
# from bs4 import BeautifulSoup

# from links import CheckType, links
# from utils import send_email, sum_of_numbers

# print("Loading function")


# async def fetch(session, link):
#     try:
#         async with session.get(link["url"], timeout=60) as response:
#             if response.status == 200:
#                 content = b""
#                 async for chunk in response.content.iter_chunked(1024):
#                     content += chunk

#                 soup = BeautifulSoup(content, "html.parser")

#                 # AVAILABILITY CHECK
#                 if link["type"] == CheckType.AVAILABILITY:
#                     if link["text_when_unavailable"] not in soup.text:
#                         link["is_available"] = True
#                     else:
#                         link["is_available"] = False

#                 # EBAY PRICE THRESHOLD CHECK
#                 if link["type"] == CheckType.EBAY_PRICE_THRESHOLD:
#                     first_item = soup.select_one(
#                         "ul.srp-results.srp-grid.clearfix > li:nth-of-type(2)"
#                     )
#                     if first_item:
#                         price = first_item.select_one("span.s-item__price").text
#                         shipping = first_item.select_one("span.s-item__shipping").text
#                         total_price = sum_of_numbers(price, shipping)

#                         if total_price < link["threshold"]:
#                             link["is_available"] = True
#                             link["found_price"] = total_price
#                         else:
#                             link["is_available"] = False

#                 del content
#                 del soup
#                 gc.collect()
#             else:
#                 print(f"Error fetching {link['url']}: {response.status}")
#     except aiohttp.ClientError as e:
#         print(f"Error fetching {link['url']}: {str(e)}")


# async def main_handler(event, context):
#     async with aiohttp.ClientSession() as session:
#         tasks = [fetch(session, link) for link in links]
#         await asyncio.gather(*tasks)

#     available_products = [link for link in links if link["is_available"] is True]

#     body = f"Available products: {len(available_products)}\n"
#     body += "\n".join(
#         f"{p['alias']} - ${p['found_price']} - {p['url']}"
#         if p.get("found_price")
#         else f"{p['alias']} - {p['url']}"
#         for p in available_products
#     )

#     print(body)

#     if not available_products:
#         return

#     EMAIL_SENDER = os.environ["email_sender"]
#     EMAIL_RECEIVER = os.environ["email_receiver"]
#     EMAIL_PASSWORD = os.environ["email_password"]
#     send_email(
#         EMAIL_SENDER, EMAIL_RECEIVER, EMAIL_PASSWORD, "Product Availability", body
#     )


# def lambda_handler(event, context):
#     return asyncio.run(main_handler(event, context))

import gc
import os
import asyncio
import aiohttp
from lxml import html
from aiohttp import ClientSession
from tenacity import retry, wait_exponential, stop_after_attempt
from links import CheckType, links
from utils import send_email, sum_of_numbers

print("Loading function")

DEBUG = os.environ.get("debug", "false") == "true"


@retry(wait=wait_exponential(multiplier=1, min=4, max=10), stop=stop_after_attempt(3))
async def fetch(session, link):
    try:
        async with session.get(link["url"], timeout=10) as response:
            if response.status == 200:
                content = b""
                async for chunk in response.content.iter_chunked(1024):
                    content += chunk

                tree = html.fromstring(content)

                # AVAILABILITY CHECK
                if link["type"] == CheckType.AVAILABILITY:
                    if link["text_when_unavailable"] not in tree.text_content():
                        link["is_available"] = True
                    else:
                        link["is_available"] = False

                # EBAY PRICE THRESHOLD CHECK
                if link["type"] == CheckType.EBAY_PRICE_THRESHOLD:
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

                            DEBUG and print(
                                f"Debug: Price text for {link['url']}: '{price}'"
                            )
                            DEBUG and print(
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
    except aiohttp.ClientError as e:
        print(f"Error fetching {link['url']}: {str(e)}")
    except Exception as e:
        print(f"Unexpected error with {link['url']}: {e}")


async def main_handler(event, context):
    async with ClientSession() as session:
        tasks = [fetch(session, link) for link in links]
        await asyncio.gather(*tasks)

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
