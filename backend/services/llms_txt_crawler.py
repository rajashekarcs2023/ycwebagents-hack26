"""llms.txt crawler — fetches and parses llms.txt files, then indexes content into Supermemory.

The llms.txt standard (https://llmstxt.org/) provides a machine-readable file at /llms.txt
that lists URLs relevant for AI consumption. This service:
1. Fetches /llms.txt from a given domain
2. Parses all URLs from it
3. Fetches content from each URL (plain text preferred)
4. Chunks and indexes everything into Supermemory
"""

import re
import httpx
from urllib.parse import urljoin, urlparse

from services import supermemory_client
from services.browser_use_client import chunk_text


async def fetch_llms_txt(base_url: str) -> str | None:
    """Try to fetch /llms.txt from the given base URL."""
    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"

    urls_to_try = [
        f"{root}/llms.txt",
        f"{root}/llms-full.txt",
    ]

    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        for url in urls_to_try:
            try:
                resp = await client.get(url)
                if resp.status_code == 200 and len(resp.text) > 50:
                    print(f"[llms.txt] Found at {url} ({len(resp.text)} chars)")
                    return resp.text
            except Exception as e:
                print(f"[llms.txt] Failed to fetch {url}: {e}")
                continue

    print(f"[llms.txt] No llms.txt found for {root}")
    return None


def extract_urls(llms_txt_content: str, base_url: str) -> list[str]:
    """Extract all URLs from llms.txt content."""
    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"

    # Match markdown links [text](url) and bare URLs
    md_links = re.findall(r'\[.*?\]\((https?://[^\s\)]+)\)', llms_txt_content)
    bare_urls = re.findall(r'(?<!\()https?://[^\s\)\]]+', llms_txt_content)

    all_urls = list(set(md_links + bare_urls))

    # Also extract relative paths that look like doc pages
    relative_paths = re.findall(r'\[.*?\]\((/[^\s\)]+)\)', llms_txt_content)
    for path in relative_paths:
        all_urls.append(urljoin(root, path))

    # Deduplicate and filter
    seen = set()
    unique = []
    for url in all_urls:
        url = url.rstrip("/").rstrip(".")
        if url not in seen and not url.endswith((".png", ".jpg", ".gif", ".svg", ".ico", ".css", ".js")):
            seen.add(url)
            unique.append(url)

    return unique


async def fetch_page_content(url: str) -> str | None:
    """Fetch text content from a URL. Prefers plain text or markdown."""
    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        try:
            # Try plain text / markdown version first
            for suffix in [".md", ""]:
                try_url = url + suffix if suffix else url
                resp = await client.get(try_url, headers={
                    "Accept": "text/plain, text/markdown, text/html",
                    "User-Agent": "CalexBot/1.0 (AI DevRel Agent)"
                })
                if resp.status_code == 200:
                    content = resp.text
                    # Strip HTML if we got HTML
                    if "<html" in content.lower()[:200]:
                        content = _strip_html(content)
                    if len(content.strip()) > 50:
                        return content.strip()
        except Exception as e:
            print(f"[llms.txt] Failed to fetch {url}: {e}")
    return None


def _strip_html(html: str) -> str:
    """Basic HTML to text conversion."""
    # Remove script and style
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
    # Remove tags
    text = re.sub(r'<[^>]+>', ' ', html)
    # Clean whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


async def crawl_and_index(
    base_url: str,
    company_id: str,
    max_pages: int = 30,
) -> dict:
    """Full pipeline: fetch llms.txt, extract URLs, fetch content, index into Supermemory.

    Returns: {found: bool, urls_found: int, pages_indexed: int, chunks_indexed: int}
    """
    # Step 1: Fetch llms.txt
    llms_content = await fetch_llms_txt(base_url)
    if not llms_content:
        return {"found": False, "urls_found": 0, "pages_indexed": 0, "chunks_indexed": 0}

    # Index the llms.txt itself as context
    try:
        await supermemory_client.add_memory(
            content=f"llms.txt content for {base_url}:\n{llms_content[:3000]}",
            company_id=company_id,
            metadata={"source": "llms_txt", "url": base_url},
        )
    except Exception as e:
        print(f"[llms.txt] Failed to index llms.txt overview: {e}")

    # Step 2: Extract URLs
    urls = extract_urls(llms_content, base_url)
    print(f"[llms.txt] Found {len(urls)} URLs from llms.txt")

    # Step 3: Fetch and index each page
    pages_indexed = 0
    total_chunks = 0
    indexed_urls = []

    for url in urls[:max_pages]:
        content = await fetch_page_content(url)
        if not content:
            continue

        chunks = chunk_text(content, max_len=1200)
        if not chunks:
            continue

        # Add source URL as prefix to first chunk
        chunks[0] = f"Source: {url}\n\n{chunks[0]}"

        try:
            await supermemory_client.bulk_add_memory(
                chunks, company_id, source=f"llms_txt:{url}"
            )
            pages_indexed += 1
            total_chunks += len(chunks)
            indexed_urls.append(url)
            print(f"[llms.txt] Indexed {url} ({len(chunks)} chunks)")
        except Exception as e:
            print(f"[llms.txt] Failed to index {url}: {e}")

    return {
        "found": True,
        "urls_found": len(urls),
        "pages_indexed": pages_indexed,
        "chunks_indexed": total_chunks,
        "indexed_urls": indexed_urls,
    }
