import logging
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import yarl
import aiohttp
from croniter import croniter
from datetime import datetime, timezone, timedelta
import zlib
import base64
import time
from bs4 import BeautifulSoup

TIMEOUT_LIMIT = 100000
logger = logging.getLogger(__name__)


def is_task_ready_to_run(cron_string, grace_period_seconds=120):
    # logger.info(f"Checking if task is ready to run for cron: {cron_string}")

    now = datetime.now(timezone.utc)
    cron = croniter(cron_string, now)
    previous_run_time = cron.get_prev(datetime)
    next_run_time = cron.get_next(datetime)

    # logger.debug(f"Current time (UTC): {now}")
    # logger.debug(f"Previous run time: {previous_run_time}")
    # logger.debug(f"Next run time: {next_run_time}")

    # Include a grace period to account for Lambda execution delay
    within_grace_period = (
        (now - timedelta(seconds=grace_period_seconds)) <= previous_run_time <= now
    )
    is_ready = within_grace_period or next_run_time <= (
        now + timedelta(seconds=grace_period_seconds)
    )

    # if within_grace_period:
    #     logger.debug("Task is within grace period of previous run time")
    # elif is_ready:
    #     logger.debug("Task is ready for next run")
    # else:
    #     logger.debug("Task is not ready to run")

    # logger.info(f"Task ready status: {is_ready}")

    return is_ready


def send_email(sender, receiver, password, subject, body):
    logger.info(f"Attempting to send email to {receiver}")
    logger.debug(f"Email subject: {subject}")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            logger.debug("SMTP connection established and TLS started")

            server.login(sender, password)
            logger.debug("Logged in to SMTP server")

            msg = MIMEMultipart()
            msg["From"] = sender
            msg["To"] = receiver
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            server.send_message(msg)
            logger.info("Email sent successfully")
    except smtplib.SMTPException as e:
        logger.error(f"Failed to send email: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error while sending email: {str(e)}")


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


def compress_text(text):
    start_time = time.time()
    compressed_data = zlib.compress(text.encode("utf-8"))
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.time() - start_time
    logger.info(f"Compressed data in {elapsed_time*1000:.2f} ms")
    return compressed_data


def decompress_text(compressed_data):
    start_time = time.time()
    try:
        # If the compressed data is a string, decode it first
        if isinstance(compressed_data, str):
            compressed_data = base64.b64decode(compressed_data)

        decompressed_data = zlib.decompress(compressed_data).decode("utf-8")
    except (zlib.error, AttributeError, base64.binascii.Error) as e:
        # Handle potential errors in decompression
        logger.error(f"Decompression error: {e}")
        decompressed_data = ""
    elapsed_time = time.time() - start_time
    logger.info(f"Decompressed data in {elapsed_time*1000:.2f} ms")
    return decompressed_data


def clean_content(content):
    soup = BeautifulSoup(content, "html.parser")
    text = (
        soup.get_text().strip().replace("\n", " ").replace("\r", " ").replace("\t", " ")
    )
    text = " ".join(text.split())
    return text
