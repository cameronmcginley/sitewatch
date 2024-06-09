import os
import time

import psutil
from dotenv import load_dotenv

from lambda_function import lambda_handler


def print_memory_usage():
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    print(f"Memory Usage: {memory_info.rss / 1024 ** 2:.2f} MB")


def measure_runtime(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Execution Time: {end_time - start_time:.2f} seconds")
        return result

    return wrapper


load_dotenv()

# Dummy event and context
event = {}
context = {}

# Wrap the lambda handler to measure runtime
lambda_handler_with_runtime = measure_runtime(lambda_handler)

# Call the wrapped lambda handler
lambda_handler_with_runtime(event, context)

print_memory_usage()
