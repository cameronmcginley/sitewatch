import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from tabulate import tabulate

load_dotenv()
EMAIL_SENDER = os.getenv("email_sender")
EMAIL_RECEIVER = os.getenv("email_receiver")
EMAIL_PASSWORD = os.getenv("email_password")

links = [
    "https://gear.bethesda.net/products/fallout-nuka-cola-glass-bottle-cap",
    "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-cola-with-collectible-tin",
    "https://gear.bethesda.net/products/fallout-nuka-cola-quantum-glass-bottle-and-cap",
    "https://gear.bethesda.net/products/fallout-nuka-quantum-bottle-caps-with-collectible-tin",
    "https://gear.bethesda.net/products/fallout-nuka-cola-dark-glass-bottle-and-cap",
    "https://gear.bethesda.net/products/fallout-bottle-caps-series-nuka-dark-with-collectible-tin",
    "https://gear.bethesda.net/products/fallout-nuka-cherry-glass-bottle-cap",
    "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-cherry-with-collectible-tin",
]

results = []
for link in links:
    page = requests.get(link)
    soup = BeautifulSoup(page.content, "html.parser")

    title = soup.find("div", class_="product__title").h1.text

    # Rewrite title
    is_glass = "Glass" in title
    if "Quantum" in title:
        title_text = "Quantum"
    elif "Dark" in title:
        title_text = "Dark"
    elif "Cherry" in title:
        title_text = "Cherry"
    else:
        title_text = "Nuka Cola"
    title_text += " Glass Bottle" if is_glass else " Caps Tin"

    availability_text = ""
    if "Notify Me When Available" in soup.text:
        availability_text = "Notify me when available"
    else:
        availability_text = "Product available"

    results.append((title_text, availability_text, link))

print(
    tabulate(
        results,
        headers=["Product", "Availability", "Link"],
        tablefmt="pretty",
        colalign=("left", "center", "left"),
    )
)

# Collect stats
available_count = len([r for r in results if r[1] == "Product available"])
print()
print(f"Total products: {len(results)}")
print(f"Available products: {available_count}")
print(f"Unavailable products: {len(results) - available_count}")

# Send email
email = EMAIL_SENDER
password = EMAIL_PASSWORD
to_email = EMAIL_RECEIVER

msg = MIMEMultipart()
msg["From"] = email
msg["To"] = to_email

subject_text = (
    "Fallout Store - No Available Products"
    if available_count == 0
    else "AVAILABLE PROUDUCT ALERT - Fallout Store"
)
msg["Subject"] = subject_text

body = f"Total products: {len(results)}\n\n"

body += f"Available products: {available_count}\n"
for r in results:
    if r[1] == "Product available":
        body += f"{r[0]} - {r[2]}\n"

body += f"\nUnavailable products: {len(results) - available_count}\n"
for r in results:
    if r[1] != "Product available":
        body += f"{r[0]} - {r[2]}\n"

msg.attach(MIMEText(body, "plain"))

server = smtplib.SMTP("smtp.gmail.com", 587)
server.starttls()
server.login(email, password)
server.send_message(msg)

print("Email sent")
server.quit()
