import gc
import os

import requests
from bs4 import BeautifulSoup

from links import CheckType, links
from utils import send_email, sum_of_numbers

print("Loading function")


def lambda_handler(event, context):
    EMAIL_SENDER = os.environ["email_sender"]
    EMAIL_RECEIVER = os.environ["email_receiver"]
    EMAIL_PASSWORD = os.environ["email_password"]

    session = requests.Session()  # Use a session for connection pooling

    for link in links:
        try:
            response = session.get(link["url"], timeout=10, stream=True)

            if response.status_code == 200:
                # Process content in chunks to reduce memory usage
                content = b""
                for chunk in response.iter_content(1024):
                    content += chunk

                soup = BeautifulSoup(content, "html.parser")

                # AVAILABILITY CHECK
                if link["type"] == CheckType.AVAILABILITY:
                    if (
                        link["text_when_unavailable"] not in soup.text
                        and "404" not in soup.text
                    ):
                        link["is_available"] = True
                    else:
                        link["is_available"] = False

                # EBAY PRICE THRESHOLD CHECK
                if link["type"] == CheckType.EBAY_PRICE_THRESHOLD:
                    # This is the first item in the list of search results
                    first_item = soup.select_one(
                        "ul.srp-results.srp-grid.clearfix > li:nth-of-type(2)"
                    )
                    if first_item:
                        price = first_item.select_one("span.s-item__price").text
                        shipping = first_item.select_one("span.s-item__shipping").text
                        total_price = sum_of_numbers(price, shipping)

                        if total_price < link["threshold"]:
                            link["is_available"] = True
                            link["found_price"] = total_price
                        else:
                            link["is_available"] = False

                # Explicitly clear memory for large objects
                del content
                del soup
                gc.collect()

        except requests.RequestException as e:
            print(f"Error fetching {link['url']}: {str(e)}")

    # Kill session
    session.close()

    available_products = [link for link in links if link["is_available"] is True]

    body = f"Available products: {len(available_products)}\n"
    body += "\n".join(
        f"{p['alias']} - ${p['found_price']} - {p['url']}"
        if p.get("found_price")
        else f"{p['alias']} - {p['url']}"
        for p in available_products
    )

    print(body)

    # Setup and send email
    if not available_products:
        return

    send_email(
        EMAIL_SENDER, EMAIL_RECEIVER, EMAIL_PASSWORD, "Product Availability", body
    )
