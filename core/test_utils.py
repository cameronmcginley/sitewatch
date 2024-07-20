import pytest
from utils import is_task_ready_to_run, send_email, sum_of_numbers
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
from freezegun import freeze_time


@pytest.mark.parametrize(
    "cron_string, now, expected",
    [
        (
            "*/5 * * * *",
            datetime(2023, 7, 19, 17, 10, 0, tzinfo=timezone.utc),
            True,
        ),  # Every 5 minutes, task is ready at 17:10:00
        (
            "*/5 * * * *",
            datetime(2023, 7, 19, 17, 10, 30, tzinfo=timezone.utc),
            True,
        ),  # Every 5 minutes, task is ready at 17:10:30
        (
            "*/5 * * * *",
            datetime(2023, 7, 19, 17, 12, 0, tzinfo=timezone.utc),
            False,
        ),  # Every 5 minutes, task is not ready at 17:12:00
        (
            "*/5 * * * *",
            datetime(2023, 7, 19, 17, 9, 30, tzinfo=timezone.utc),
            True,
        ),  # Every 5 minutes, task is ready at 17:09:30
        (
            "*/5 * * * *",
            datetime(2023, 7, 19, 17, 7, 45, tzinfo=timezone.utc),
            False,
        ),  # Every 5 minutes, task is not ready at 17:07:45
        (
            "0 19 * * *",
            datetime(2023, 7, 19, 19, 0, 30, tzinfo=timezone.utc),
            True,
        ),  # Daily at 19:00 UTC, task is ready at 19:00:30
        (
            "0 19 * * *",
            datetime(2023, 7, 19, 19, 2, 0, tzinfo=timezone.utc),
            False,
        ),  # Daily at 19:00 UTC, task is not ready at 19:02:00
        (
            "0 * * * *",
            datetime(2023, 7, 19, 18, 0, 0, tzinfo=timezone.utc),
            True,
        ),  # Every hour, task is ready at 18:00:00
        (
            "0 * * * *",
            datetime(2023, 7, 19, 18, 2, 0, tzinfo=timezone.utc),
            False,
        ),  # Every hour, task is not ready at 18:02:00
        (
            "0 8 * * 1",
            datetime(2023, 7, 17, 8, 0, 30, tzinfo=timezone.utc),
            True,
        ),  # Every Monday at 08:00 UTC, task is ready at 08:00:30
        (
            "0 8 * * 1",
            datetime(2023, 7, 17, 8, 2, 0, tzinfo=timezone.utc),
            False,
        ),  # Every Monday at 08:00 UTC, task is not ready at 08:02:00
        (
            "0 0 * * *",
            datetime(2023, 7, 19, 0, 0, 30, tzinfo=timezone.utc),
            True,
        ),  # Every day at midnight UTC, task is ready at 00:00:30
        (
            "0 0 * * *",
            datetime(2023, 7, 19, 0, 2, 0, tzinfo=timezone.utc),
            False,
        ),  # Every day at midnight UTC, task is not ready at 00:02:00
        (
            "*/10 * * * *",
            datetime(2023, 7, 19, 17, 20, 30, tzinfo=timezone.utc),
            True,
        ),  # Every 10 minutes, task is ready at 17:20:30
        (
            "*/10 * * * *",
            datetime(2023, 7, 19, 17, 22, 0, tzinfo=timezone.utc),
            False,
        ),  # Every 10 minutes, task is not ready at 17:22:00
        (
            "*/15 * * * *",
            datetime(2023, 7, 19, 17, 30, 30, tzinfo=timezone.utc),
            True,
        ),  # Every 15 minutes, task is ready at 17:30:30
        (
            "*/15 * * * *",
            datetime(2023, 7, 19, 17, 32, 0, tzinfo=timezone.utc),
            False,
        ),  # Every 15 minutes, task is not ready at 17:32:00
    ],
)
def test_is_task_ready_to_run(cron_string, now, expected):
    with freeze_time(now):
        result = is_task_ready_to_run(cron_string, grace_period_seconds=60)
        assert (
            result == expected
        ), f"Failed for cron_string: {cron_string}, now: {now}, expected: {expected}, got: {result}"


# def test_send_email():
#     sender = "sender@example.com"
#     receiver = "receiver@example.com"
#     password = "password"
#     subject = "Test Subject"
#     body = "Test Body"

#     with patch("smtplib.SMTP") as mock_smtp:
#         instance = mock_smtp.return_value
#         instance.send_message.return_value = None

#         send_email(sender, receiver, password, subject, body)

#         instance.starttls.assert_called_once()
#         instance.login.assert_called_once_with(sender, password)
#         instance.send_message.assert_called_once()
#         print("Email sent")


def test_sum_of_numbers():
    assert sum_of_numbers("$100", "200", "30.5") == 330.5
    assert sum_of_numbers("10,000", "+500") == 10500.0
    assert sum_of_numbers("No numbers here!") == 0.0
    assert sum_of_numbers("$1,000.50", "+$2,000.75", "500") == 3501.25
    assert sum_of_numbers() == 0.0


if __name__ == "__main__":
    pytest.main()
