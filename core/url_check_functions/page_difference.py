import Levenshtein
import logging
from utils import compress_text, decompress_text, clean_content

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def percent_difference(str1, str2):
    distance = Levenshtein.distance(str1, str2)
    max_len = max(len(str1), len(str2))
    if max_len == 0:
        return 0.0  # Handle edge case where both strings are empty
    percent_diff = (distance / max_len) * 100
    return percent_diff


async def page_difference(check, content):
    """
    Check the difference between the current page text and the previous page text.

    Args:
        check (dict): The check to process.
        content (str): The content of the page.

    Returns:
        dict: A dictionary containing the result of the page difference check.
    """
    target_percent_diff = check["attributes"]["percent_diff"]
    previous_text_compressed = check.get("lastResult", {}).get("page_text", "")
    previous_text = decompress_text(previous_text_compressed)

    text = clean_content(content)
    text_compressed = compress_text(text)

    logger.info(f"Length of previous text: {len(previous_text)}")
    logger.info(f"Length of previous text compressed: {len(previous_text_compressed)}")
    logger.info(f"Length of text: {len(text)}")
    logger.info(f"Length of text compressed: {len(text_compressed)}")

    # Calculate the difference between the two texts
    actual_percent_diff = percent_difference(previous_text, text)

    result = {
        "send_alert": True
        if actual_percent_diff >= target_percent_diff and len(previous_text) > 0
        else False,
        "message": f"Found percent difference of: {actual_percent_diff:.2f}",
        "page_text": text_compressed,
    }

    return result
