from utils import fetch_url


async def keyword_check(session, link):
    content = await fetch_url(session, link["url"])

    if not content:
        link["keyword_found"] = False
        return

    # if content:
    #     tree = html.fromstring(content)
    #     if link["text_when_unavailable"] not in tree.text_content():
    #         link["is_available"] = True
    #     else:
    #         link["is_available"] = False
    # else:
    #     link["is_available"] = False

    keyword_found = link["keyword"].lower() in content.text().lower()
    link["keyword_found"] = keyword_found if not link["opposite"] else not keyword_found
