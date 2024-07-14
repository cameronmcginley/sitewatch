import asyncio
import json
import os
from unittest.mock import MagicMock, patch
from tabulate import tabulate
import aiohttp
import boto3

# Set up environment variables
os.environ["DYNAMODB_TABLE_NAME"] = "mock-table"
os.environ["PROCESSOR_LAMBDA_NAME"] = "mock-processor"
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

dummy_data = [
    {
        "alias": {"S": "Alias 0"},
        "check_type": {"S": "EBAY PRICE THRESHOLD"},
        "pk": {"S": "CHECK#2qpzse3v7ju"},
        "sk": {"S": "CHECK"},
        "type": {"S": "CHECK"},
        "url": {"S": "https://example0.com"},
        "userid": {"S": "118298783964592448941"},
        "status": {"S": "ACTIVE"},
        "attributes": {"M": {"threshold": {"N": "100.95"}}},
        "email": {"S": "exampleemail0@gmail.com"},
    },
    {
        "alias": {"S": "Alias 1"},
        "check_type": {"S": "EBAY PRICE THRESHOLD"},
        "pk": {"S": "CHECK#svefu69ebif"},
        "sk": {"S": "CHECK"},
        "type": {"S": "CHECK"},
        "url": {"S": "https://example1.com"},
        "userid": {"S": "118298783964592448941"},
        "status": {"S": "ACTIVE"},
        "attributes": {"M": {"threshold": {"N": "100.95"}}},
        "email": {"S": "exampleemail1@gmail.com"},
    },
    {
        "alias": {"S": "Alias 2"},
        "check_type": {"S": "KEYWORD CHECK"},
        "pk": {"S": "CHECK#4vs6l43yfej"},
        "sk": {"S": "CHECK"},
        "type": {"S": "CHECK"},
        "url": {"S": "https://example2.com"},
        "userid": {"S": "118298783964592448941"},
        "status": {"S": "ACTIVE"},
        "attributes": {"M": {"keyword": {"S": "Keyword"}, "opposite": {"B": False}}},
        "email": {"S": "exampleemail2@gmail.com"},
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
    link["is_available"] = True
    link["found_price"] = 95.00


async def mock_keyword_check(session, link):
    """Mock function for keyword check."""
    link["is_available"] = True


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
for check_type, func in CHECKTYPE_TO_FUNCTION_MAP.items():
    if func is not None:
        mock_func = mock_functions.get(check_type)
        if mock_func:
            CHECKTYPE_TO_FUNCTION_MAP[check_type] = MagicMock(side_effect=mock_func)
        else:
            print(f"Warning: No mock function defined for {check_type}")


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
        [check_type, mock_func.call_count]
        for check_type, mock_func in CHECKTYPE_TO_FUNCTION_MAP.items()
        if mock_func is not None
    ]
    print(
        tabulate(function_calls, headers=["Check Type", "Call Count"], tablefmt="grid")
    )

    print("\nDetailed Results Table:")
    results_table = [
        [
            item["check_type"]["S"],
            item["url"]["S"],
            item["alias"]["S"],
            item["email"]["S"],
            "Success"
            if CHECKTYPE_TO_FUNCTION_MAP[item["check_type"]["S"]].call_count > 0
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


if __name__ == "__main__":
    with patch("lambda_executor.CHECKTYPE_TO_FUNCTION_MAP", CHECKTYPE_TO_FUNCTION_MAP):
        asyncio.run(test_lambda_functions())
