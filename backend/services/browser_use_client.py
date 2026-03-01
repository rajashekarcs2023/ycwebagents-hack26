"""Browser Use client — verified from official Cloud SDK docs."""

import os
import asyncio
from datetime import datetime
from browser_use_sdk import AsyncBrowserUse


def get_client() -> AsyncBrowserUse:
    return AsyncBrowserUse()


async def scrape_website(url: str) -> list[str]:
    """Scrape a website and return text chunks for knowledge ingestion."""
    client = get_client()
    task_prompt = f"""Navigate to {url}.
Extract ALL meaningful text content from the website including:
- Homepage copy and value proposition
- Product/service descriptions
- Documentation or FAQ sections if visible
- Key features and how-to information
- Any pricing or setup instructions

Return the content as a comprehensive summary organized by section.
Do NOT include navigation menus, cookie banners, or footer boilerplate."""

    try:
        result = await client.run(task_prompt)
        output = result.output if hasattr(result, "output") else str(result)
        if not output:
            return []
        return chunk_text(output, 1500)
    except Exception as e:
        print(f"[BrowserUse] Scrape failed for {url}: {e}")
        return []


async def run_walkthrough(url: str, question: str) -> dict:
    """Run a guided walkthrough on a website to answer a question.
    Returns {output, run_log, final_url}."""
    client = get_client()
    task_prompt = f"""You are a DevRel agent helping a developer.
Navigate to {url} and find the answer to: "{question}"

Instructions:
- Navigate to the relevant page(s)
- Find the specific information that answers the question
- Note each step you take
- Report: the final URL you ended up on, and a step-by-step walkthrough of how to get there

Format your output as:
STEPS:
1. [step description]
2. [step description]
...
FINAL_URL: [url]
ANSWER: [the answer you found]"""

    run_log = []
    run_log.append(f"[{_ts()}] Starting walkthrough for: {question}")
    run_log.append(f"[{_ts()}] Navigating to {url}")

    try:
        result = await client.run(task_prompt)
        output = result.output if hasattr(result, "output") else str(result)
        run_log.append(f"[{_ts()}] Browser agent completed navigation")
        run_log.append(f"[{_ts()}] Extracting walkthrough steps")

        final_url = url
        if "FINAL_URL:" in output:
            final_url = output.split("FINAL_URL:")[1].split("\n")[0].strip()

        run_log.append(f"[{_ts()}] Walkthrough complete — final URL: {final_url}")

        return {
            "output": output,
            "run_log": run_log,
            "final_url": final_url,
        }
    except Exception as e:
        run_log.append(f"[{_ts()}] Error: {e}")
        return {
            "output": f"Walkthrough failed: {e}",
            "run_log": run_log,
            "final_url": url,
        }


def _ts() -> str:
    return datetime.utcnow().strftime("%H:%M:%S")


def chunk_text(text: str, max_len: int = 1500) -> list[str]:
    """Split text into chunks, breaking at sentence boundaries."""
    chunks = []
    i = 0
    while i < len(text):
        end = min(i + max_len, len(text))
        if end < len(text):
            last_period = text.rfind(".", i + max_len // 2, end)
            if last_period > i:
                end = last_period + 1
        chunk = text[i:end].strip()
        if len(chunk) > 30:
            chunks.append(chunk)
        i = end
    return chunks
