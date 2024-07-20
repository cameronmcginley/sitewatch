import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import yarl
import aiohttp
from croniter import croniter
from datetime import datetime, timezone, timedelta

TIMEOUT_LIMIT = 100000


def is_task_ready_to_run(cron_string, grace_period_seconds=60):
    now = datetime.now(timezone.utc)
    cron = croniter(cron_string, now)
    previous_run_time = cron.get_prev(datetime)
    next_run_time = cron.get_next(datetime)

    # Include a grace period to account for Lambda execution delay
    within_grace_period = (
        (now - timedelta(seconds=grace_period_seconds)) <= previous_run_time <= now
    )
    return within_grace_period or next_run_time <= (
        now + timedelta(seconds=grace_period_seconds)
    )


def send_email(sender, receiver, password, subject, body):
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender, password)
            msg = MIMEMultipart()
            msg["From"] = sender
            msg["To"] = receiver
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))
            server.send_message(msg)
            print("Email sent")
    except smtplib.SMTPException as e:
        print(f"Failed to send email: {str(e)}")


def sum_of_numbers(*texts):
    # Regular expression to match numbers with optional $ or + signs
    pattern = r"[\+\$]?\d{1,3}(?:,\d{3})*(?:\.\d+)?"

    total_sum = 0.0

    for text in texts:
        # Find all matches in the text
        matches = re.findall(pattern, text)

        # Convert matches to float and sum them up
        total_sum += sum(
            float(match.replace("$", "").replace("+", "").replace(",", ""))
            for match in matches
        )

    return total_sum
