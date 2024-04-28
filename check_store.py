import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import requests
from bs4 import BeautifulSoup

print("Loading function")


def lambda_handler(event, context):
    EMAIL_SENDER = os.environ["email_sender"]
    EMAIL_RECEIVER = os.environ["email_receiver"]
    EMAIL_PASSWORD = os.environ["email_password"]

    TEXT_WHEN_UNAVAILABLE = "Notify Me When Available"

    links = [
        {
            "url": "https://gear.bethesda.net/products/fallout-nuka-cola-glass-bottle-cap",
            "title": "Nuka Cola Glass Bottle",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-cola-with-collectible-tin",
            "title": "Nuka Cola Caps Tin",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-nuka-cola-quantum-glass-bottle-and-cap",
            "title": "Quantum Glass Bottle",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-nuka-quantum-bottle-caps-with-collectible-tin",
            "title": "Quantum Bottle Caps Tin",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-nuka-cola-dark-glass-bottle-and-cap",
            "title": "Dark Glass Bottle",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-bottle-caps-series-nuka-dark-with-collectible-tin",
            "title": "Dark Caps Tin",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-nuka-cherry-glass-bottle-cap",
            "title": "Cherry Glass Bottle",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-cherry-with-collectible-tin",
            "title": "Cherry Caps Tin",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-nuka-cola-wild-glass-bottle-and-cap",
            "title": "Wild Glass Bottle",
            "is_available": None,
        },
        {
            "url": "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-wild-with-collectible-tin",
            "title": "Wild Caps Tin",
            "is_available": None,
        },
    ]

    session = requests.Session()  # Use a session for connection pooling
    availability_found = False
    for product in links:
        try:
            response = session.get(product["url"], timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, "html.parser")
                if TEXT_WHEN_UNAVAILABLE not in soup.text:
                    product["is_available"] = True
                    availability_found = True
                else:
                    product["is_available"] = False
        except requests.RequestException as e:
            print(f"Error fetching {product['url']}: {str(e)}")

    if not availability_found:
        print("No available products")
        return

    available_products = [
        product for product in links if product["is_available"] is True
    ]
    unavailable_products = [
        product for product in links if product["is_available"] is False
    ]

    body = f"Total products: {len(links)}\n\n"
    body += f"Available products: {len(available_products)}\n"
    body += "\n".join(f"{p['title']} - {p['url']}" for p in available_products)
    body += f"\n\nUnavailable products: {len(unavailable_products)}\n"
    body += "\n".join(f"{p['title']} - {p['url']}" for p in unavailable_products)

    print(body)

    # Setup and send email
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            msg = MIMEMultipart()
            msg["From"] = EMAIL_SENDER
            msg["To"] = EMAIL_RECEIVER
            msg[
                "Subject"
            ] = f"{len(available_products)} AVAILABLE PRODUCT{'' if len(available_products) == 1 else 'S'}"
            msg.attach(MIMEText(body, "plain"))
            server.send_message(msg)
            print("Email sent")
    except smtplib.SMTPException as e:
        print(f"Failed to send email: {str(e)}")
