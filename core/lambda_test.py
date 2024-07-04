import json
import os
from unittest.mock import patch, MagicMock
import boto3
import pytest
from moto import mock_aws
from url_checker_lambda import lambda_handler
from url_check_functions.availability import check_availability
from url_check_functions.ebay_price_threshold import check_ebay_price_threshold


# Load the dummy data
with open("test_links.json", "r") as f:
    dummy_data = json.load(f)


@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"


@pytest.fixture(scope="function")
def mock_env_variables():
    os.environ["email_sender"] = "sender@example.com"
    os.environ["email_password"] = "password123"


@pytest.mark.asyncio
async def test_check_availability():
    link = {
        "type": "AVAILABILITY",
        "url": "http://example.com",
        "text_when_unavailable": "Out of stock",
    }

    mock_session = MagicMock()
    mock_response = MagicMock()
    mock_response.read.return_value = b"Product is available"
    mock_session.get.return_value.__aenter__.return_value = mock_response

    with patch(
        "url_check_functions.availability.fetch_url",
        return_value=b"Product is available",
    ):
        await check_availability(mock_session, link)

    assert link["is_available"] == True


@pytest.mark.asyncio
async def test_check_ebay_price_threshold():
    link = {
        "type": "EBAY_PRICE_THRESHOLD",
        "url": "http://ebay.com/item",
        "threshold": 100,
    }

    mock_session = MagicMock()
    mock_response = MagicMock()
    mock_response.read.return_value = b'<html><ul class="srp-results srp-grid clearfix"><li><span class="s-item__price">$90</span><span class="s-item__shipping">$5</span></li></ul></html>'
    mock_session.get.return_value.__aenter__.return_value = mock_response

    with patch(
        "url_check_functions.ebay_price_threshold.fetch_url",
        return_value=mock_response.read.return_value,
    ):
        await check_ebay_price_threshold(mock_session, link)

    assert link["is_available"] == True
    assert link["found_price"] == 95


@pytest.mark.asyncio
async def test_lambda_handler(mock_env_variables):
    event = {"links": dummy_data["links"]}

    with patch("url_checker_lambda.ClientSession") as MockClientSession, patch(
        "url_checker_lambda.send_email"
    ) as mock_send_email:
        mock_session = MockClientSession.return_value
        mock_get = MagicMock()
        mock_get.__aenter__.return_value.status = 200
        mock_get.__aenter__.return_value.read.return_value = b"Product is available"
        mock_session.get.return_value = mock_get

        await lambda_handler(event, {})

    # Assert that send_email was called for each available product
    assert mock_send_email.call_count > 0


@pytest.mark.asyncio
async def test_lambda_handler_no_available_products(mock_env_variables):
    event = {
        "links": [
            {
                "type": "AVAILABILITY",
                "url": "http://example.com",
                "text_when_unavailable": "In stock",
            }
        ]
    }

    with patch("url_checker_lambda.ClientSession") as MockClientSession, patch(
        "url_checker_lambda.send_email"
    ) as mock_send_email:
        mock_session = MockClientSession.return_value
        mock_get = MagicMock()
        mock_get.__aenter__.return_value.status = 200
        mock_get.__aenter__.return_value.read.return_value = b"In stock"
        mock_session.get.return_value = mock_get

        result = await lambda_handler(event, {})

    # Assert that send_email was not called
    assert mock_send_email.call_count == 0
    assert result is None


if __name__ == "__main__":
    pytest.main([__file__])
