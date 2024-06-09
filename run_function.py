import os

import psutil
from dotenv import load_dotenv

from lambda_function import lambda_handler


def print_memory_usage():
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    print(f"Memory Usage: {memory_info.rss / 1024 ** 2:.2f} MB")


load_dotenv()

# Dummy event and context
event = {}
context = {}

lambda_handler(event, context)

print_memory_usage()
