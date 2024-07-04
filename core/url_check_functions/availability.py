import yarl
from lxml import html
from utils import fetch_url


async def check_availability(session, link):
    content = await fetch_url(session, link["url"])
    if content:
        tree = html.fromstring(content)
        if link["text_when_unavailable"] not in tree.text_content():
            link["is_available"] = True
        else:
            link["is_available"] = False
    else:
        link["is_available"] = False
