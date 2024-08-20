import json
from constants import REDIS_ITEM_FIELDS
from decimal import Decimal


def convert_non_serializable(obj):
    """
    Converts non-serializable types to a serializable format.

    Args:
        obj: The object to be converted.

    Returns:
        The converted object.
    """
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


def prepare_value_for_redis(value):
    """
    Prepares a value for storage in Redis by converting it to a compatible type.

    Args:
        value: The value to be stored in Redis.

    Returns:
        The value converted to a type compatible with Redis (string, int, float, or bytes).
    """
    if isinstance(value, bool):
        # Convert boolean to string
        return str(value)
    elif isinstance(value, dict):
        # Convert dictionary to JSON string, handling Decimals within the dict
        return json.dumps(value, default=convert_non_serializable)
    elif isinstance(value, Decimal):
        return float(value)  # or str(value)
    elif isinstance(value, (int, float, str, bytes)):
        # If it's already a compatible type, return it as is
        return value
    else:
        # For any other types, convert to string as a fallback
        return str(value)


def write_to_redis(redis_client, key, field, value):
    """
    Writes a key-value pair to Redis.
    """
    # Check the type of the key
    # existing_type = redis_client.type(key).decode("utf-8")
    existing_type = redis_client.type(key)
    if existing_type != "none" and existing_type != "hash":
        # If the key exists and is not a hash, delete it
        redis_client.delete(key)

    value = prepare_value_for_redis(value)
    redis_client.hset(key, field, value)


def write_all_items_to_redis(redis_client, items, logger):
    """
    Writes all items to Redis.
    """
    for item in items:
        pk = item["pk"]
        sk = item["sk"]
        key = f"{pk}:{sk}"

        for field in REDIS_ITEM_FIELDS:
            value = item.get(field)
            if value is not None:
                write_to_redis(redis_client, key, field, value)
                logger.info(f"Updated Redis key {key} with {field}: {value}")

        logger.info(f"Updated Redis key {key} with fields: {REDIS_ITEM_FIELDS}")
