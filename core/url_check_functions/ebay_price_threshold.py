from lxml import html
from utils import fetch_url, sum_of_numbers


async def check_ebay_price_threshold(session, link):
    content = await fetch_url(session, link["url"])
    if content:
        tree = html.fromstring(content)
        first_item = tree.cssselect(
            "ul.srp-results.srp-grid.clearfix > li:nth-of-type(2)"
        )
        if first_item:
            price_element = first_item[0].cssselect("span.s-item__price")
            shipping_element = first_item[0].cssselect("span.s-item__shipping")

            if price_element and shipping_element:
                price = price_element[0].text_content().strip()
                shipping = shipping_element[0].text_content().strip()

                try:
                    total_price = sum_of_numbers(price, shipping)
                    if total_price < link["threshold"]:
                        link["is_available"] = True
                        link["found_price"] = total_price
                    else:
                        link["is_available"] = False
                except TypeError as e:
                    print(f"Error parsing price for {link['url']}: {e}")
                    link["is_available"] = False
            else:
                print(f"Price or shipping elements missing for {link['url']}")
                link["is_available"] = False
        else:
            link["is_available"] = False
    else:
        link["is_available"] = False
