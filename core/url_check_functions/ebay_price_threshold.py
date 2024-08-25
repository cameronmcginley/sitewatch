from bs4 import BeautifulSoup
from utils import sum_of_numbers


async def ebay_price_threshold(item, content):
    """
    Checks the eBay price threshold for a given link.

    Args:
        session (aiohttp.ClientSession): The session to use for the HTTP request.
        link (dict): The link information containing URL, threshold, and other details.

    Returns:
        dict: A dictionary containing the result of the eBay price threshold check.
    """
    result = {
        "send_alert": False,
        "message": "Unable to check price",
        "found_price": None,
    }

    soup = BeautifulSoup(content, "html.parser")
    first_item = soup.select_one("ul.srp-results.srp-grid.clearfix > li:nth-of-type(2)")

    if not first_item:
        result["message"] = "No items found on the page"
        return result

    price_element = first_item.select_one("span.s-item__price")
    shipping_element = first_item.select_one("span.s-item__shipping")

    if not (price_element and shipping_element):
        result["message"] = "Price or shipping elements missing"
        return result

    price = price_element.get_text(strip=True)
    shipping = shipping_element.get_text(strip=True)

    try:
        total_price = sum_of_numbers(price, shipping)
        result["found_price"] = total_price

        if total_price < item["attributes"]["threshold"]:
            result["send_alert"] = True
            result["message"] = f"Price threshold met. Found price: ${total_price:.2f}"
        else:
            result[
                "message"
            ] = f"Price above threshold. Found price: ${total_price:.2f}"
    except TypeError as e:
        result["message"] = f"Error parsing price: {e}"

    return result
