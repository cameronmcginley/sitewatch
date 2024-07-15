import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import yarl
import aiohttp

TIMEOUT_LIMIT = 100000


# async def fetch_url(session, url):
#     headers = {
#         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0"
#     }
#     url = yarl.URL(url, encoded=True)
#     try:
#         async with session.get(url, timeout=TIMEOUT_LIMIT, headers=headers) as response:
#             if response.status == 200:
#                 return await response.read()
#             else:
#                 print(f"Error fetching {url}: {response.status}")
#                 return None
#     except aiohttp.ClientError as e:
#         print(f"Error fetching {url}: {str(e)}")
#         return None


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
