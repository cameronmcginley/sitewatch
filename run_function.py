from dotenv import load_dotenv

from check_store import lambda_handler

load_dotenv()

# Dummy event and context
event = {}
context = {}

lambda_handler(event, context)
