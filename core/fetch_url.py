import asyncio
import random
from typing import Optional, List
from aiohttp import ClientSession, ClientTimeout, ClientError, TCPConnector
import yarl

# List of User-Agents to rotate
USER_AGENTS: List[str] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
]

# List of proxy servers
PROXIES: List[str] = [
    # "http://proxy1.example.com:8080",
    # "http://proxy2.example.com:8080",
    # Add more proxies here
]

# Semaphore for rate limiting
# Lambda region limit is 1000
RATE_LIMIT = asyncio.Semaphore(1000)


async def fetch_url(
    session: ClientSession,
    url: str,
    *,
    max_retries: int = 3,
    base_delay: float = 1.0,
    timeout_total: float = 30.0,
    timeout_connect: float = 10.0,
    use_proxies: bool = False,
) -> Optional[bytes]:
    """
    Fetch a URL with configurable retries and timeouts.

    Args:
        session (ClientSession): The aiohttp ClientSession to use.
        url (str): The URL to fetch.
        max_retries (int): Maximum number of retry attempts.
        base_delay (float): Base delay for exponential backoff.
        timeout_total (float): Total timeout for the request in seconds.
        timeout_connect (float): Connection timeout in seconds.
        use_proxies (bool): Whether to use proxies or not.

    Returns:
        Optional[bytes]: The content of the URL if successful, None otherwise.
    """
    url = yarl.URL(url, encoded=True)
    timeout = ClientTimeout(total=timeout_total, connect=timeout_connect)

    for attempt in range(max_retries):
        try:
            async with RATE_LIMIT:
                headers = {"User-Agent": random.choice(USER_AGENTS)}
                proxy = random.choice(PROXIES) if PROXIES and use_proxies else None

                # Create a new session with a new connector for each request to use a different proxy
                connector = TCPConnector(ssl=False) if proxy else None
                async with ClientSession(connector=connector) as session:
                    async with session.get(
                        url,
                        timeout=timeout,
                        headers=headers,
                        proxy=proxy,
                    ) as response:
                        if response.status == 200:
                            return await response.read()
                        elif response.status == 403:
                            print(f"Access denied (403) for {url}. Retrying...")
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
    """
    Fetch a URL quickly without retries.

    Args:
        session (ClientSession): The aiohttp ClientSession to use.
        url (str): The URL to fetch.
        timeout_total (float): Total timeout for the request in seconds.
        timeout_connect (float): Connection timeout in seconds.

    Returns:
        Optional[bytes]: The content of the URL if successful, None otherwise.
    """
    return await fetch_url(
        session,
        url,
        max_retries=1,
        timeout_total=timeout_total,
        timeout_connect=timeout_connect,
        use_proxies=False,
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
