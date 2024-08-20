import redis
import os
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(
    host=os.environ.get("REDIS_HOST", None),
    port=int(os.environ.get("REDIS_PORT", None)),
    password=os.environ.get("REDIS_PASSWORD", None),
)

# Set a key-value pair
r.set("foo", "bar")

# Get the value of a key
value = r.get("foo")
print(value)  # Output will be b'bar'
