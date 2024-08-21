import json
from constants import REDIS_ITEM_FIELDS
from boto3.dynamodb.types import TypeDeserializer
from decimal import Decimal

deserializer = TypeDeserializer()


def convert_non_serializable(obj):
    """
    Converts non-serializable types to a serializable format.
    """
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


def prepare_value_for_redis(value):
    """
    Prepares a value for storage in Redis by converting it to a compatible type.
    """
    if isinstance(value, bool):
        return str(value)
    elif isinstance(value, dict):
        return json.dumps(value, default=convert_non_serializable)
    elif isinstance(value, Decimal):
        return float(value)
    elif isinstance(value, (int, float, str, bytes)):
        return value
    else:
        return str(value)


def extract_dynamodb_value(attribute):
    """
    Extracts the actual value from a DynamoDB attribute.
    Handles both cases where the attribute might have type descriptors (e.g., "S", "N") or not.

    Scan from Dynamo will not have type descriptors, but Dynamo streams will have type descriptors.
    """
    if (
        isinstance(attribute, dict)
        and len(attribute) == 1
        and next(iter(attribute)) in ["S", "N", "BOOL", "L", "M", "NULL", "B"]
    ):
        # Use TypeDeserializer if the attribute has a DynamoDB type descriptor
        return deserializer.deserialize(attribute)
    else:
        # Return the value directly if it's a simple Python type
        return attribute


def write_to_redis(redis_client, key, field, value):
    """
    Writes a key-value pair to Redis.
    """
    existing_type = redis_client.type(key)
    if existing_type != "none" and existing_type != "hash":
        redis_client.delete(key)

    value = prepare_value_for_redis(value)
    redis_client.hset(key, field, value)


def write_all_items_to_redis(redis_client, items, logger):
    """
    Writes all items to Redis.
    """
    logger.info(f"Writing {len(items)} items to Redis")

    for item in items:
        logger.debug(f"Processing item: {item}")
        pk = extract_dynamodb_value(item["pk"])
        sk = extract_dynamodb_value(item["sk"])
        key = f"{pk}:{sk}"

        for field in REDIS_ITEM_FIELDS:
            value = item.get(field)
            if value is not None:
                value = extract_dynamodb_value(value)
                write_to_redis(redis_client, key, field, value)
                logger.info(f"Updated Redis key {key} with {field}: {value}")

        logger.info(f"Updated Redis key {key} with fields: {REDIS_ITEM_FIELDS}")
