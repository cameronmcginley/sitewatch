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


def write_to_redis_pipeline(pipe, key, field_value_map):
    """
    Adds multiple field-value pairs to the Redis pipeline for batch writing.
    """
    existing_type = pipe.type(key)
    if existing_type != b"none" and existing_type != b"hash":
        pipe.delete(key)

    # Using hmset to write multiple fields at once
    pipe.hmset(key, field_value_map)


def write_all_items_to_redis(redis_client, items, logger):
    """
    Writes all items to Redis using pipeline for batch writing.
    """
    logger.info(f"Writing {len(items)} items to Redis")

    with redis_client.pipeline() as pipe:
        for item in items:
            logger.debug(f"Processing item: {item}")
            pk = extract_dynamodb_value(item["pk"])
            sk = extract_dynamodb_value(item["sk"])
            key = f"{pk}:{sk}"

            field_value_map = {}
            for field in REDIS_ITEM_FIELDS:
                value = item.get(field)
                if value is not None:
                    value = extract_dynamodb_value(value)
                    field_value_map[field] = prepare_value_for_redis(value)
                    # logger.info(f"Queued Redis key {key} with {field}: {value}")

            if field_value_map:
                write_to_redis_pipeline(pipe, key, field_value_map)

        # Execute the pipeline to write all the commands in batch
        pipe.execute()
        logger.info(f"Updated Redis keys with fields: {REDIS_ITEM_FIELDS}")
