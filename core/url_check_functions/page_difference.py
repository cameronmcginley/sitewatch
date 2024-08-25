from bs4 import BeautifulSoup
import Levenshtein
import zlib
import base64
import time
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def compress_text(text):
    start_time = time.time()
    compressed_data = zlib.compress(text.encode("utf-8"))
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.time() - start_time
    logger.info(f"Compressed data in {elapsed_time*1000:.2f} ms")
    return compressed_data


def decompress_text(compressed_data):
    start_time = time.time()
    try:
        # If the compressed data is a string, decode it first
        if isinstance(compressed_data, str):
            compressed_data = base64.b64decode(compressed_data)

        decompressed_data = zlib.decompress(compressed_data).decode("utf-8")
    except (zlib.error, AttributeError, base64.binascii.Error) as e:
        # Handle potential errors in decompression
        logger.error(f"Decompression error: {e}")
        decompressed_data = ""
    elapsed_time = time.time() - start_time
    logger.info(f"Decompressed data in {elapsed_time*1000:.2f} ms")
    return decompressed_data


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

    soup = BeautifulSoup(content, "html.parser")
    text = (
        soup.get_text().strip().replace("\n", " ").replace("\r", " ").replace("\t", " ")
    )
    text = " ".join(text.split())
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
