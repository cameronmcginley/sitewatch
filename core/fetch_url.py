import asyncio
import random
from typing import Optional, List
from aiohttp import ClientSession, ClientTimeout, ClientError, TCPConnector
import yarl
import os

# List of User-Agents to rotate
USER_AGENTS: List[str] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
]


PROXIES: List[str] = [os.environ.get("OXYLAB_PROXY", "")]

# Semaphore for rate limiting
# Lambda region limit is 1000
RATE_LIMIT = asyncio.Semaphore(1000)


async def fetch_url(
    session: ClientSession,
    url: str,
    useProxy: bool = False,
    *,
    max_retries: int = 1,
    base_delay: float = 1.0,
    timeout_total: float = 30.0,
    timeout_connect: float = 10.0,
    max_content_size: int = 100 * 1024,
) -> Optional[bytes]:
    """
    Fetch a URL with configurable retries and timeouts.

    Args:
        session (ClientSession): The aiohttp ClientSession to use.
        url (str): The URL to fetch.
        useProxy (bool): Whether to use a proxy for the request.
        max_retries (int): Maximum number of retry attempts.
        base_delay (float): Base delay for exponential backoff.
        timeout_total (float): Total timeout for the request in seconds.
        timeout_connect (float): Connection timeout in seconds.
        max_content_size (int): Maximum allowed content size in bytes.

    Returns:
        Optional[bytes]: The content of the URL if successful, None otherwise.
    """
    url = yarl.URL(url, encoded=True)
    timeout = ClientTimeout(total=timeout_total, connect=timeout_connect)

    for attempt in range(max_retries):
        try:
            async with RATE_LIMIT:
                headers = {
                    "User-Agent": random.choice(USER_AGENTS),
                    "Accept": "text/html",
                }
                proxy = PROXIES[0] if PROXIES[0] and useProxy else None
                print(f"Using proxy: {proxy}, User-Agent: {headers['User-Agent']}")

                async with session.get(
                    url,
                    timeout=timeout,
                    headers=headers,
                    proxy=proxy,
                ) as response:
                    if response.status == 200:
                        content = b""
                        async for chunk in response.content.iter_chunked(1024):
                            content += chunk
                            if len(content) > max_content_size:
                                print(f"Reached max content size for {url}")
                                return content[:max_content_size]
                        return content
                    else:
                        print(f"Error fetching {url}: HTTP {response.status}")
                        return None
        except asyncio.TimeoutError:
            print(f"Timeout error fetching {url}")
        except ClientError as e:
            print(f"Error fetching {url}: {str(e)}")

        if attempt < max_retries - 1:
            delay = (2**attempt) * base_delay + random.uniform(0, 1)
            print(f"Retrying {url} in {delay:.2f} seconds...")
            await asyncio.sleep(delay)

    print(f"Failed to fetch {url} after {max_retries} attempts")
    return None


async def fetch_url_fast(
    session: ClientSession,
    url: str,
    *,
    timeout_total: float = 10.0,
    timeout_connect: float = 5.0,
) -> Optional[bytes]:
    return await fetch_url(
        session,
        url,
        max_retries=1,
        timeout_total=timeout_total,
        timeout_connect=timeout_connect,
    )


# Example usage:
async def main():
    async with ClientSession() as session:
        # Normal fetch with retries
        content = await fetch_url(session, "https://example.com")
        if content:
            print("Fetched content successfully")

        # Fast fetch without retries
        fast_content = await fetch_url_fast(session, "https://example.com")
        if fast_content:
            print("Fetched content quickly")


if __name__ == "__main__":
    asyncio.run(main())
