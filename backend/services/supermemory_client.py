"""Supermemory client — verified from official Python SDK docs."""

import os
from supermemory import Supermemory


def get_client() -> Supermemory:
    return Supermemory(api_key=os.environ.get("SUPERMEMORY_API_KEY", ""))


async def add_memory(content: str, company_id: str, metadata: dict | None = None):
    """Add a memory scoped to a company."""
    client = get_client()
    meta = metadata or {}
    client.add(
        content=content,
        container_tags=[company_id],
        metadata=meta,
    )


async def bulk_add_memory(chunks: list[str], company_id: str, source: str = "website"):
    """Add multiple text chunks as memories for a company."""
    client = get_client()
    for chunk in chunks:
        if len(chunk.strip()) < 20:
            continue
        client.add(
            content=chunk,
            container_tags=[company_id],
            metadata={"source": source},
        )


async def search_memory(query: str, company_id: str, limit: int = 5) -> list[dict]:
    """Search memories for a company. Returns list of {content, score}."""
    client = get_client()
    try:
        response = client.search.documents(
            q=query,
            container_tags=[company_id],
        )
        results = []
        for r in response.results:
            results.append({
                "content": getattr(r, "content", "") or getattr(r, "document", "") or str(r),
                "score": getattr(r, "score", 0),
            })
        return results[:limit]
    except Exception as e:
        print(f"[Supermemory] Search error: {e}")
        return []


def format_context(results: list[dict]) -> str:
    """Format search results into a context block for the LLM."""
    if not results:
        return ""
    lines = []
    for i, r in enumerate(results, 1):
        lines.append(f"[{i}] {r['content']}")
    return "Relevant company knowledge:\n" + "\n\n".join(lines)
