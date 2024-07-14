from url_check_functions import keyword_check, ebay_price_threshold

# export const CHECK_TYPES: string[] = ["KEYWORD CHECK", "EBAY PRICE THRESHOLD", "PAGE DIFFERENCE"]

BATCH_SIZE = 500

TIMEOUT_LIMIT = 100000

CHECKTYPE_TO_FUNCTION_MAP = {
    "EBAY PRICE THRESHOLD": ebay_price_threshold,
    "KEYWORD CHECK": keyword_check,
    "PAGE DIFFERENCE": None,
}
