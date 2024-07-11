import json
import random
import requests
import gzip
from io import BytesIO
from warcio.archiveiterator import ArchiveIterator

# Base links to reuse for other fields
base_links = [
    {
        "alias": "Grape Glass Bottle",
        "type": "AVAILABILITY",
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "alias": "Nuka Cola Glass Bottle",
        "type": "AVAILABILITY",
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
]


def fetch_warc_file_list():
    cc_warc_list_url = (
        "https://data.commoncrawl.org/crawl-data/CC-MAIN-2024-26/warc.paths.gz"
    )
    warc_list_response = requests.get(cc_warc_list_url)
    warc_list_response.raise_for_status()

    warc_list_gz = BytesIO(warc_list_response.content)
    with gzip.open(warc_list_gz, "rt") as f:
        warc_list = f.read().splitlines()

    return warc_list


def load_urls_from_warc():
    warc_list = fetch_warc_file_list()
    random_warc_file = random.choice(warc_list)
    warc_file_url = f"https://data.commoncrawl.org/{random_warc_file}"

    # Fetch and parse the WARC file
    urls = []
    warc_response = requests.get(warc_file_url, stream=True)
    warc_response.raise_for_status()

    for record in ArchiveIterator(warc_response.raw, arc2warc=True):
        if record.rec_type == "response":
            url = record.rec_headers.get_header("WARC-Target-URI")
            urls.append(url)

    return urls


def fetch_random_urls(n, urls):
    if len(urls) < n:
        urls *= (n // len(urls)) + 1
    return random.sample(urls, n)


# Function to generate dummy data with random URLs
def generate_dummy_data(n, urls):
    dummy_links = []
    random_urls = fetch_random_urls(n, urls)
    base_count = len(base_links)

    for i in range(n):
        base_link = base_links[i % base_count].copy()
        base_link["url"] = random_urls[i]
        base_link["alias"] += f" #{i + 1}"
        dummy_links.append(base_link)

    return dummy_links


urls = load_urls_from_warc()

Ns = [1, 10, 100, 1000, 10000, 100000]

for N in Ns:
    dummy_data = generate_dummy_data(N, urls)
    event_data = {"links": dummy_data}

    with open(f"dummy_links_{N}.json", "w") as f:
        json.dump(event_data, f, indent=4)

    print(f"Generated {N} dummy data entries and saved to dummy_links_{N}.json")
