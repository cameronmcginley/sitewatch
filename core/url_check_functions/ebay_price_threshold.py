from lxml import html
from utils import fetch_url, sum_of_numbers


async def check_ebay_price_threshold(session, link):
    """
    Checks the eBay price threshold for a given link.

    Args:
        session (aiohttp.ClientSession): The session to use for the HTTP request.
        link (dict): The link information containing URL, threshold, and other details.

    Returns:
        dict: A dictionary containing the result of the eBay price threshold check.
    """
    content = await fetch_url(session, link["url"])
    result = {
        "send_alert": False,
        "message": "Unable to check price",
        "found_price": None,
    }

    if not content:
        result["message"] = "Failed to fetch URL content"
        return result

    tree = html.fromstring(content)
    first_item = tree.cssselect("ul.srp-results.srp-grid.clearfix > li:nth-of-type(2)")

    if not first_item:
        result["message"] = "No items found on the page"
        return result

    price_element = first_item[0].cssselect("span.s-item__price")
    shipping_element = first_item[0].cssselect("span.s-item__shipping")

    if not (price_element and shipping_element):
        result["message"] = "Price or shipping elements missing"
        return result

    price = price_element[0].text_content().strip()
    shipping = shipping_element[0].text_content().strip()

    try:
        total_price = sum_of_numbers(price, shipping)
        result["found_price"] = total_price

        if total_price < link["threshold"]:
            result["send_alert"] = True
            result["message"] = f"Price threshold met. Found price: ${total_price:.2f}"
        else:
            result[
                "message"
            ] = f"Price above threshold. Found price: ${total_price:.2f}"
    except TypeError as e:
        result["message"] = f"Error parsing price: {e}"

    return result
