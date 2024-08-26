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

    # Only keep lines containing success and message
    response = [line for line in response if "success" in line or "message" in line]

    # Extract the values
    success = response[0].split(": ")[1].strip()
    success = True if success.lower() == "true" else False

    message = response[1].split(": ")[1].strip().replace("'", "").replace('"', "")

    return success, message


async def ai_check(check, content):
    """ """
    user_prompt = check["attributes"]["userPrompt"]
    user_condition = check["attributes"]["userCondition"]

    text = clean_content(content)
    compressed_text = compress_text(text)

    # Check if previous and current text are the same
    if check.get("lastResult", {}).get("page_text", "") == compressed_text:
        logger.info("Text content has not changed since last check")
        return {
            "send_alert": True if check["lastResult"]["status"] == "ALERTED" else False,
            "message": check["lastResult"]["message"],
            "page_text": compressed_text,
        }

    prompt = f"""
    Analyze the text content of a website to determine if it meets the user's prompt and condition.

    Follow their prompt, and if the give condition is met, return a success message to indicate an alert is needed.

    Response in JSON in markdown with format (and absolutely nothing else):
    "success": True if the condition is met and user should be alerted, False otherwise.
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
    success, message = parse_ai_response(response)

    logger.info(f"Success: {success}")
    logger.info(f"Message: {message}")

    result = {
        "send_alert": success,
        "message": message,
        "page_text": compressed_text,
    }

    return result
