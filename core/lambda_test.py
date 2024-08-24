import asyncio
import json
import os
from unittest.mock import MagicMock, patch, AsyncMock
from tabulate import tabulate
import aiohttp
import boto3
from datetime import datetime, timezone

# Set up environment variables
os.environ["DYNAMODB_TABLE_NAME"] = "mock-table"
os.environ["PROCESSOR_LAMBDA_NAME"] = "mock-processor"
os.environ["EXECUTOR_LAMBDA_NAME"] = "mock-executor"
os.environ["email_sender"] = "sender@example.com"
os.environ["email_password"] = "password123"


def mock_send_email(sender, receiver, password, subject, body):
    """Mock function to simulate sending an email."""
    print(f"\nEmail Details:")
    print(f"From: {sender}")
    print(f"To: {receiver}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("---")


send_email = MagicMock(side_effect=mock_send_email)
patch("utils.send_email", send_email).start()


async def mock_update_dynamodb_item(pk, sk, last_result):
    print(f"\nMock Updating DynamoDB item:")
    print(f"PK: {pk}")
    print(f"SK: {sk}")
    print(f"Last Result: {last_result}")
    print(f"Updated At: {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ')}")
    print(f"Updated item {pk} in DynamoDB")


update_dynamodb_item = AsyncMock(side_effect=mock_update_dynamodb_item)
patch("lambda_executor.update_dynamodb_item", update_dynamodb_item).start()


dummy_data = [
    {
        "alias": {"S": "Alias 0"},
        "checkType": {"S": "EBAY PRICE THRESHOLD"},
        "pk": {"S": "CHECK#2qpzse3v7ju"},
        "sk": {"S": "CHECK"},
        "type": {"S": "CHECK"},
        "url": {"S": "https://example0.com"},
        "userid": {"S": "118298783964592448941"},
        "status": {"S": "ACTIVE"},
        "attributes": {"M": {"threshold": {"N": "100.95"}}},
        "email": {"S": "exampleemail0@gmail.com"},
        "cron": {"S": "0 17 * * 3"},  ## every Wednesday at 5:00 PM
    },
    {
        "alias": {"S": "Alias 1"},
        "checkType": {"S": "EBAY PRICE THRESHOLD"},
        "pk": {"S": "CHECK#svefu69ebif"},
        "sk": {"S": "CHECK"},
        "type": {"S": "CHECK"},
        "url": {"S": "https://example1.com"},
        "userid": {"S": "118298783964592448941"},
        "status": {"S": "ACTIVE"},
        "attributes": {"M": {"threshold": {"N": "100.95"}}},
        "email": {"S": "exampleemail1@gmail.com"},
        "cron": {"S": "0 */12 * * *"},  ## every 12 hours
    },
    {
        "alias": {"S": "Alias 2"},
        "checkType": {"S": "KEYWORD CHECK"},
        "pk": {"S": "CHECK#4vs6l43yfej"},
        "sk": {"S": "CHECK"},
        "type": {"S": "CHECK"},
        "url": {"S": "https://example2.com"},
        "userid": {"S": "118298783964592448941"},
        "status": {"S": "ACTIVE"},
        "attributes": {"M": {"keyword": {"S": "Keyword"}, "opposite": {"B": False}}},
        "email": {"S": "exampleemail2@gmail.com"},
        "cron": {"S": "*/5 * * * *"},  ## every 5 minutes
    },
]


def mock_scan(**kwargs):
    """Mock function to simulate DynamoDB scan operation."""
    return {"Items": dummy_data}


def mock_invoke(**kwargs):
    """Mock function to simulate Lambda invoke operation."""
    payload = json.loads(kwargs["Payload"])
    executor_handler(payload, None)


async def mock_ebay_price_threshold(session, link):
    """Mock function for eBay price threshold check."""
    return {
        "send_alert": True,
        "found_price": 95.00,
        "message": "Price threshold met",
    }


async def mock_keyword_check(session, link):
    """Mock function for keyword check."""
    return {"send_alert": True, "message": "Keyword found"}


# Set up mock methods
boto3.resource = MagicMock()
boto3.client = MagicMock()
boto3.resource.return_value.Table.return_value.scan = mock_scan
boto3.client.return_value.invoke = mock_invoke

# Mock the aiohttp ClientSession
aiohttp.ClientSession = MagicMock()

mock_functions = {
    "EBAY PRICE THRESHOLD": mock_ebay_price_threshold,
    "KEYWORD CHECK": mock_keyword_check,
    "PAGE DIFFERENCE": None,
}

from constants import BATCH_SIZE, CHECKTYPE_TO_FUNCTION_MAP, TIMEOUT_LIMIT
from lambda_executor import lambda_handler as executor_handler
from lambda_processor import lambda_handler as processor_handler

# Replace actual check functions with mocks
for checkType, func in CHECKTYPE_TO_FUNCTION_MAP.items():
    if func is not None:
        mock_func = mock_functions.get(checkType)
        if mock_func:
            CHECKTYPE_TO_FUNCTION_MAP[checkType] = MagicMock(side_effect=mock_func)
        else:
            print(f"Warning: No mock function defined for {checkType}")


async def test_lambda_functions():
    """
    Main test function to simulate and validate Lambda function behavior.
    """
    print(f"Using BATCH_SIZE: {BATCH_SIZE}")
    print(f"Using TIMEOUT_LIMIT: {TIMEOUT_LIMIT}")
    print("Supported check types:", list(CHECKTYPE_TO_FUNCTION_MAP.keys()))

    print("\nTesting Lambda Processor...")
    processor_result = await processor_handler({}, None)
    print(f"Processor result: {processor_result}")

    print("\nChecking function calls:")
    function_calls = [
        [checkType, mock_func.call_count]
        for checkType, mock_func in CHECKTYPE_TO_FUNCTION_MAP.items()
        if mock_func is not None
    ]
    print(
        tabulate(function_calls, headers=["Check Type", "Call Count"], tablefmt="grid")
    )

    print("\nDetailed Results Table:")
    results_table = [
        [
            item["checkType"]["S"],
            item["url"]["S"],
            item["alias"]["S"],
            item["email"]["S"],
            "Success"
            if CHECKTYPE_TO_FUNCTION_MAP[item["checkType"]["S"]].call_count > 0
            else "N/A",
        ]
        for item in dummy_data
    ]
    print(
        tabulate(
            results_table,
            headers=["Check Type", "URL", "Alias", "Email", "Success"],
            tablefmt="grid",
        )
    )

    print("\nDynamoDB Update Calls:")
    for call in update_dynamodb_item.call_args_list:
        args, kwargs = call
        print(f"PK: {args[0]}, SK: {args[1]}, Last Result: {args[2]}")


if __name__ == "__main__":
    with patch("lambda_executor.CHECKTYPE_TO_FUNCTION_MAP", CHECKTYPE_TO_FUNCTION_MAP):
        asyncio.run(test_lambda_functions())
