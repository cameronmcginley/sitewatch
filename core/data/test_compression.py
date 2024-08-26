import requests
import gzip
import zlib
import base64
from bs4 import BeautifulSoup
import time
import brotli
import lzma
import bz2
import snappy
import zstandard as zstd
import pandas as pd


def clean_content(content):
    soup = BeautifulSoup(content, "html.parser")
    text = (
        soup.get_text().strip().replace("\n", " ").replace("\r", " ").replace("\t", " ")
    )
    text = " ".join(text.split())
    return text


urls = [
    "https://gear.bethesda.net/products/fallout-nuka-cola-quantum-glass-bottle-and-cap",
    "https://www.wikipedia.org/",
    "https://www.example.com/",
    "https://www.python.org/",
    "https://news.ycombinator.com/",
]

# Initialize lists to store results
compression_algorithms = [
    "gzip (level 6)",
    "gzip (level 9)",
    "zlib",
    "brotli",
    "lzma",
    "bz2",
    "snappy",
    "zstd",
]
compressed_lengths = {alg: [] for alg in compression_algorithms}
compression_times = {alg: [] for alg in compression_algorithms}
original_lengths = []

# Fetch and process each URL
for url in urls:
    response = requests.get(url)
    content = response.text

    # Clean the content
    cleaned_content = clean_content(content)
    original_lengths.append(len(cleaned_content))

    # Compress the content with different algorithms and measure time
    # Gzip level 6
    start_time = time.perf_counter()
    gzip_compressed_data = gzip.compress(
        cleaned_content.encode("utf-8"), compresslevel=6
    )
    gzip_compressed_data = base64.b64encode(gzip_compressed_data).decode("utf-8")
    gzip_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["gzip (level 6)"].append(len(gzip_compressed_data))
    compression_times["gzip (level 6)"].append(gzip_elapsed_time * 1000)

    # Gzip level 9
    start_time = time.perf_counter()
    gzip2_compressed_data = gzip.compress(
        cleaned_content.encode("utf-8"), compresslevel=9
    )
    gzip2_compressed_data = base64.b64encode(gzip2_compressed_data).decode("utf-8")
    gzip2_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["gzip (level 9)"].append(len(gzip2_compressed_data))
    compression_times["gzip (level 9)"].append(gzip2_elapsed_time * 1000)

    # Zlib
    start_time = time.perf_counter()
    zlib_compressed_data = zlib.compress(cleaned_content.encode("utf-8"))
    zlib_compressed_data = base64.b64encode(zlib_compressed_data).decode("utf-8")
    zlib_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["zlib"].append(len(zlib_compressed_data))
    compression_times["zlib"].append(zlib_elapsed_time * 1000)

    # Brotli
    start_time = time.perf_counter()
    brotli_compressed_data = brotli.compress(cleaned_content.encode("utf-8"))
    brotli_compressed_data = base64.b64encode(brotli_compressed_data).decode("utf-8")
    brotli_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["brotli"].append(len(brotli_compressed_data))
    compression_times["brotli"].append(brotli_elapsed_time * 1000)

    # LZMA
    start_time = time.perf_counter()
    lzma_compressed_data = lzma.compress(cleaned_content.encode("utf-8"))
    lzma_compressed_data = base64.b64encode(lzma_compressed_data).decode("utf-8")
    lzma_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["lzma"].append(len(lzma_compressed_data))
    compression_times["lzma"].append(lzma_elapsed_time * 1000)

    # BZ2
    start_time = time.perf_counter()
    bz2_compressed_data = bz2.compress(cleaned_content.encode("utf-8"))
    bz2_compressed_data = base64.b64encode(bz2_compressed_data).decode("utf-8")
    bz2_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["bz2"].append(len(bz2_compressed_data))
    compression_times["bz2"].append(bz2_elapsed_time * 1000)

    # Snappy
    start_time = time.perf_counter()
    snappy_compressed_data = snappy.compress(cleaned_content.encode("utf-8"))
    snappy_compressed_data = base64.b64encode(snappy_compressed_data).decode("utf-8")
    snappy_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["snappy"].append(len(snappy_compressed_data))
    compression_times["snappy"].append(snappy_elapsed_time * 1000)

    # Zstd
    start_time = time.perf_counter()
    compressor = zstd.ZstdCompressor(level=22)
    zstd_compressed_data = compressor.compress(cleaned_content.encode("utf-8"))
    zstd_compressed_data = base64.b64encode(zstd_compressed_data).decode("utf-8")
    zstd_elapsed_time = time.perf_counter() - start_time
    compressed_lengths["zstd"].append(len(zstd_compressed_data))
    compression_times["zstd"].append(zstd_elapsed_time * 1000)

# Calculate averages
average_original_length = sum(original_lengths) / len(original_lengths)
average_lengths = {
    alg: sum(lengths) / len(lengths) for alg, lengths in compressed_lengths.items()
}
average_times = {
    alg: sum(times) / len(times) for alg, times in compression_times.items()
}
percent_reduction = {
    alg: ((average_original_length - average_lengths[alg]) / average_original_length)
    * 100
    for alg in compression_algorithms
}
percent_reduction_per_ms = {
    alg: percent_reduction[alg] / average_times[alg] if average_times[alg] > 0 else 0
    for alg in compression_algorithms
}

# Create DataFrame for averages
average_results = {
    "Compression Algorithm": compression_algorithms,
    "Average Original Length (bytes)": average_original_length,
    "Average Compressed Length (bytes)": [
        average_lengths[alg] for alg in compression_algorithms
    ],
    "Average Compression Time (ms)": [
        average_times[alg] for alg in compression_algorithms
    ],
    "Percentage Reduction (%)": [
        percent_reduction[alg] for alg in compression_algorithms
    ],
    "Percentage Reduction per ms": [
        percent_reduction_per_ms[alg] for alg in compression_algorithms
    ],
}

df_avg = pd.DataFrame(average_results)

# Output the DataFrame as a table
print(df_avg)
