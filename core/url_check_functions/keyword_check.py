from fetch_url import fetch_url


async def keyword_check(session, link):
    """
    Performs a keyword check on the given URL and returns a result dictionary.

    Args:
        session (aiohttp.ClientSession): The session to use for the HTTP request.
        link (dict): The link information containing URL, keyword, and other details.

    Returns:
        dict: A dictionary containing the result of the keyword check.
    """
    content = await fetch_url(session, link["url"])

    if not content:
        return {
            "send_alert": False,
            "message": "Failed to fetch URL content",
        }

    # Decode the content from bytes to string
    content_str = content.decode("utf-8") if isinstance(content, bytes) else content

    keyword_found = link["keyword"].lower() in content_str.lower()
    send_alert = keyword_found if not link["opposite"] else not keyword_found

    result = {
        "send_alert": send_alert,
        "message": f"Keyword {'found' if keyword_found else 'not found'}",
    }

    if send_alert:
        result["message"] += f" - Alert condition met"
    else:
        result["message"] += f" - No alert needed"

    return result
