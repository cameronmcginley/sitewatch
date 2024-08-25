async def keyword_check(item, content):
    """
    Performs a keyword check on the given URL and returns a result dictionary.

    Args:
        session (aiohttp.ClientSession): The session to use for the HTTP request.
        link (dict): The link information containing URL, keyword, and other details.

    Returns:
        dict: A dictionary containing the result of the keyword check.
    """
    keyword_found = item["attributes"]["keyword"].lower() in content.lower()
    send_alert = (
        keyword_found if not item["attributes"]["opposite"] else not keyword_found
    )

    result = {
        "send_alert": send_alert,
        "message": f"Keyword {'found' if keyword_found else 'not found'}",
    }

    if send_alert:
        result["message"] += " - Alert condition met"
    else:
        result["message"] += " - No alert needed"

    return result
