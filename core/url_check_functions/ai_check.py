from openai import OpenAI
import os
import logging
from utils import clean_content, compress_text

client = OpenAI(api_key=os.environ["OPEN_AI_API_KEY"])

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_openai_response(prompt):
    logger.info("Prompting OpenAI API for response")
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )
    response = completion.choices[0].message.content.strip()
    return response


def get_anthropic_response(prompt):
    logger.info("Prompting Anthropic API for response")
    return


def parse_ai_response(response):
    logger.info(f"Parsing AI response: {response}")
    response = response.split("\n")

    # Only keep lines containing do_alert and message
    response = [line for line in response if "do_alert" in line or "message" in line]

    # Extract the values
    do_alert = (
        response[0]
        .split(": ")[1]
        .strip()
        .replace("'", "")
        .replace('"', "")
        .replace(",", "")
    )
    do_alert = (
        True if do_alert.lower() == "true" or "true" in do_alert.lower() else False
    )

    message = response[1].split(": ")[1].strip().replace("'", "").replace('"', "")

    return do_alert, message


async def ai_check(check, content):
    """ """
    user_prompt = check["attributes"]["userPrompt"]
    user_condition = check["attributes"]["userCondition"]

    text = clean_content(content)
    compressed_text = compress_text(text)

    # Check if previous and current text are the same
    if (
        check.get("lastResult", {}) != "None"
        and check.get("lastResult", {}).get("page_text", "") == compressed_text
    ):
        logger.info("Text content has not changed since last check")
        return {
            "send_alert": True if check["lastResult"]["status"] == "ALERTED" else False,
            "message": check["lastResult"]["message"],
            "page_text": compressed_text,
        }
    else:
        logger.info("Text content has changed since last check")

    prompt = f"""
    Analyze the text content of a website to determine if it meets the user's prompt and condition.

    Follow their prompt, and if the give condition is met, return a flag to alert the user along with a message.

    Consider the user's prompt to gather info, then consider the user's alert condition to determine if the user should be alerted.

    Response in JSON in markdown with format (and absolutely nothing else):
    "do_alert": True if the user's condition is met and user should be alerted, False otherwise.
    "message": A single line message to return to the user.

    User's prompt: {user_prompt}
    User's alert condition: {user_condition}

    Website content:
    {text}
    """

    response = (
        get_openai_response(prompt)
        if check["attributes"]["model"] == "openai"
        else get_anthropic_response(prompt)
    )
    do_alert, message = parse_ai_response(response)

    logger.info(f"do_alert: {do_alert}")
    logger.info(f"Message: {message}")

    result = {
        "send_alert": do_alert,
        "message": message,
        "page_text": compressed_text,
    }

    return result
