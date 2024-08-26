from url_check_functions.keyword_check import keyword_check
from url_check_functions.ebay_price_threshold import ebay_price_threshold
from url_check_functions.page_difference import page_difference
from url_check_functions.ai_check import ai_check

BATCH_SIZE = 500

TIMEOUT_LIMIT = 100000

CHECKTYPE_TO_FUNCTION_MAP = {
    "EBAY PRICE THRESHOLD": ebay_price_threshold,
    "KEYWORD CHECK": keyword_check,
    "PAGE DIFFERENCE": page_difference,
    "AI CHECK": ai_check,
}
