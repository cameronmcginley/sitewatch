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
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import unicodedata

urls = [
    # Original URLs
    "https://gear.bethesda.net/products/fallout-nuka-cola-quantum-glass-bottle-and-cap",
    "https://www.wikipedia.org/",
    "https://www.example.com/",
    "https://www.python.org/",
    "https://news.ycombinator.com/",
    # News and Media
    "https://www.bbc.com/news",
    "https://www.nytimes.com/",
    "https://www.reuters.com/",
    # E-commerce
    "https://www.amazon.com/",
    "https://www.etsy.com/",
    "https://www.ebay.com/",
    # Social Media
    "https://twitter.com/",
    "https://www.reddit.com/",
    "https://www.linkedin.com/",
    # Technology and Programming
    "https://stackoverflow.com/",
    "https://github.com/",
    "https://developer.mozilla.org/en-US/",
    # Education
    "https://www.coursera.org/",
    "https://www.khanacademy.org/",
    "https://www.mit.edu/",
    # Government
    "https://www.usa.gov/",
    "https://europa.eu/",
    "https://www.who.int/",
    # Entertainment
    "https://www.imdb.com/",
    "https://www.spotify.com/",
    "https://www.netflix.com/",
    # Sports
    "https://www.espn.com/",
    "https://www.nba.com/",
    "https://www.fifa.com/",
    # Science and Technology
    "https://www.nasa.gov/",
    "https://www.nature.com/",
    "https://www.sciencedaily.com/",
]


def clean_content(content):
    # Parse HTML and extract text
    soup = BeautifulSoup(content, "lxml")
    text = soup.get_text().lower()

    # Replace multiple spaces/newlines/tabs with a single space
    text = re.sub(r"\s+", " ", text).strip()

    return text

    # # Tokenize
    # tokens = word_tokenize(text)
    # # Remove stop words
    # stop_words = set(stopwords.words("english"))
    # tokens = [token for token in tokens if token not in stop_words]
    # # Stemming
    # ps = PorterStemmer()
    # tokens = [ps.stem(token) for token in tokens]
    # # Join tokens back into a string
    # text = " ".join(tokens)
    # # Normalize Unicode characters
    # text = unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode("ASCII")


def test_clean_content():
    total_time = 0
    for url in urls:
        response = requests.get(url)
        content = response.text
        start_time = time.perf_counter()
        clean_content(content)
        total_time += time.perf_counter() - start_time
    print(f"Elapsed time average: {total_time / len(urls) * 1000:.2f} ms")


# Test the clean_content function
test_clean_content()


# Text Preprocessing Function
def preprocess_content(content):
    return content


# Decompression Function for Consistency
def decompress_base64(encoded_data, decompress_func):
    decoded_data = base64.b64decode(encoded_data.encode("utf-8"))
    start_time = time.perf_counter()
    decompressed_data = decompress_func(decoded_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return decompressed_data, elapsed_time * 1000


# Hybrid Compression Function
def hybrid_compression(content, fast_compress_func, slow_compress_func):
    # First pass with a fast compressor
    fast_compressed = fast_compress_func(content.encode("utf-8"))
    # Second pass with a more thorough compressor
    start_time = time.perf_counter()
    final_compressed = slow_compress_func(fast_compressed)
    final_compressed = base64.b64encode(final_compressed).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return len(final_compressed), elapsed_time * 1000


# Compression Functions
def compress_gzip(content, level):
    start_time = time.perf_counter()
    compressed_data = gzip.compress(content.encode("utf-8"), compresslevel=level)
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return compressed_data, len(compressed_data), elapsed_time * 1000


def compress_zlib(content, level):
    start_time = time.perf_counter()
    compressed_data = zlib.compress(content.encode("utf-8"), level=level)
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return len(compressed_data), elapsed_time * 1000, decompress_base64


def compress_brotli(content, quality):
    start_time = time.perf_counter()
    compressed_data = brotli.compress(content.encode("utf-8"), quality=quality)
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return len(compressed_data), elapsed_time * 1000, decompress_base64


def compress_lzma(content, preset):
    start_time = time.perf_counter()
    compressed_data = lzma.compress(content.encode("utf-8"), preset=preset)
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return len(compressed_data), elapsed_time * 1000, decompress_base64


def compress_bz2(content, compresslevel):
    start_time = time.perf_counter()
    compressed_data = bz2.compress(content.encode("utf-8"), compresslevel=compresslevel)
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return len(compressed_data), elapsed_time * 1000, decompress_base64


def compress_snappy(content):
    start_time = time.perf_counter()
    compressed_data = snappy.compress(content.encode("utf-8"))
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return len(compressed_data), elapsed_time * 1000, decompress_base64


def compress_zstd(content, level):
    start_time = time.perf_counter()
    compressor = zstd.ZstdCompressor(level=level)
    compressed_data = compressor.compress(content.encode("utf-8"))
    compressed_data = base64.b64encode(compressed_data).decode("utf-8")
    elapsed_time = time.perf_counter() - start_time
    return len(compressed_data), elapsed_time * 1000, decompress_base64


# Initialize lists to store results
compression_algorithms = [
    "gzip (level 6)",
    "gzip (level 9)",
    "zlib (level 6)",
    "zlib (level 9)",
    "brotli (level 1)",
    "brotli (level 6)",
    "brotli (level 11)",
    "lzma (preset 0)",
    "lzma (preset 6)",
    "bz2 (level 1)",
    "bz2 (level 9)",
    "snappy",
    "zstd (level 1)",
    "zstd (level 6)",
    "zstd (level 22)",
    "hybrid_snappy_brotli",
    "hybrid_gzip_brotli",
]
compressed_lengths = {alg: [] for alg in compression_algorithms}
compression_times = {alg: [] for alg in compression_algorithms}
decompression_times = {alg: [] for alg in compression_algorithms}
original_lengths = []

# Fetch and process each URL
for url in urls:
    response = requests.get(url)
    content = response.text

    # Clean and preprocess the content
    cleaned_content = preprocess_content(clean_content(content))
    original_lengths.append(len(cleaned_content))

    # Gzip compression
    for level in [6, 9]:
        compressed_data, length, comp_time = compress_gzip(cleaned_content, level)
        compressed_lengths[f"gzip (level {level})"].append(length)
        compression_times[f"gzip (level {level})"].append(comp_time)
        _, decomp_time = decompress_base64(compressed_data, gzip.decompress)
        decompression_times[f"gzip (level {level})"].append(decomp_time)

    # Zlib compression
    for level in [6, 9]:
        length, comp_time, decompress_func = compress_zlib(cleaned_content, level)
        compressed_lengths[f"zlib (level {level})"].append(length)
        compression_times[f"zlib (level {level})"].append(comp_time)
        _, decomp_time = decompress_base64(compressed_data, gzip.decompress)
        decompression_times[f"zlib (level {level})"].append(decomp_time)

    # Brotli compression
    for quality in [1, 6, 11]:
        length, comp_time, decompress_func = compress_brotli(cleaned_content, quality)
        compressed_lengths[f"brotli (level {quality})"].append(length)
        compression_times[f"brotli (level {quality})"].append(comp_time)
        _, decomp_time = decompress_base64(compressed_data, gzip.decompress)
        decompression_times[f"brotli (level {quality})"].append(decomp_time)

    # LZMA compression
    for preset in [0, 6]:
        length, comp_time, decompress_func = compress_lzma(cleaned_content, preset)
        compressed_lengths[f"lzma (preset {preset})"].append(length)
        compression_times[f"lzma (preset {preset})"].append(comp_time)
        _, decomp_time = decompress_base64(compressed_data, gzip.decompress)
        decompression_times[f"lzma (preset {preset})"].append(decomp_time)

    # BZ2 compression
    for level in [1, 9]:
        length, comp_time, decompress_func = compress_bz2(cleaned_content, level)
        compressed_lengths[f"bz2 (level {level})"].append(length)
        compression_times[f"bz2 (level {level})"].append(comp_time)
        _, decomp_time = decompress_base64(compressed_data, gzip.decompress)
        decompression_times[f"bz2 (level {level})"].append(decomp_time)

    # Snappy compression
    length, comp_time, decompress_func = compress_snappy(cleaned_content)
    compressed_lengths["snappy"].append(length)
    compression_times["snappy"].append(comp_time)
    _, decomp_time = decompress_base64(compressed_data, gzip.decompress)
    decompression_times["snappy"].append(decomp_time)

    # Zstd compression
    for level in [1, 6, 22]:
        length, comp_time, decompress_func = compress_zstd(cleaned_content, level)
        compressed_lengths[f"zstd (level {level})"].append(length)
        compression_times[f"zstd (level {level})"].append(comp_time)
        _, decomp_time = decompress_base64(compressed_data, gzip.decompress)
        decompression_times[f"zstd (level {level})"].append(decomp_time)

    # Hybrid Compression (Snappy + Brotli)
    length, comp_time = hybrid_compression(
        cleaned_content, snappy.compress, lambda data: brotli.compress(data, quality=11)
    )
    compressed_lengths["hybrid_snappy_brotli"].append(length)
    compression_times["hybrid_snappy_brotli"].append(comp_time)

    # Hybrid Compression (Gzip + Brotli)
    length, comp_time = hybrid_compression(
        cleaned_content,
        lambda data: gzip.compress(data, compresslevel=6),
        lambda data: brotli.compress(data, quality=11),
    )
    compressed_lengths["hybrid_gzip_brotli"].append(length)
    compression_times["hybrid_gzip_brotli"].append(comp_time)

# Calculate averages
average_original_length = sum(original_lengths) / len(original_lengths)
average_lengths = {
    alg: sum(lengths) / len(lengths) for alg, lengths in compressed_lengths.items()
}
average_compression_times = {
    alg: sum(times) / len(times) for alg, times in compression_times.items()
}
average_decompression_times = {
    alg: sum(times) / len(times) if times else 0
    for alg, times in decompression_times.items()
}
percent_reduction = {
    alg: ((average_original_length - average_lengths[alg]) / average_original_length)
    * 100
    for alg in compression_algorithms
}
percent_reduction_per_ms = {
    alg: percent_reduction[alg] / average_compression_times[alg]
    if average_compression_times[alg] > 0
    else 0
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
        average_compression_times[alg] for alg in compression_algorithms
    ],
    "Average Decompression Time (ms)": [
        average_decompression_times[alg] for alg in compression_algorithms
    ],
    "Percentage Reduction (%)": [
        percent_reduction[alg] for alg in compression_algorithms
    ],
    "Percentage Reduction per ms": [
        percent_reduction_per_ms[alg] for alg in compression_algorithms
    ],
}

df_avg = pd.DataFrame(average_results)

# Sort the DataFrame by "Average Compressed Length (bytes)" in ascending order
df_avg_sorted = df_avg.sort_values(by="Average Compressed Length (bytes)")

# Reset the index to have a clean 0-based index
df_avg_sorted = df_avg_sorted.reset_index(drop=True)

# Print the sorted DataFrame
print("Compression Results (Sorted by Average Compressed Length):")
print(df_avg_sorted.to_string(index=False))

# Optionally, you can also save the sorted results to a CSV file
df_avg_sorted.to_csv("sorted_compression_results.csv", index=False)
print("\nResults have been saved to 'sorted_compression_results.csv'")
