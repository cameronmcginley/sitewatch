import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


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
