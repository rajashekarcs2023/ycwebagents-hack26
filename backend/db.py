"""Simple JSON-file database for hackathon speed. Each collection is a .json file in ./data/."""

import json
import os
from pathlib import Path
from typing import TypeVar, Type
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

DATA_DIR = Path(os.environ.get("DATA_DIR", os.path.join(os.path.dirname(__file__), "data")))


def _ensure_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _file(collection: str) -> Path:
    return DATA_DIR / f"{collection}.json"


def get_all(collection: str, model: Type[T]) -> list[T]:
    _ensure_dir()
    fp = _file(collection)
    if not fp.exists():
        return []
    raw = json.loads(fp.read_text())
    return [model(**item) for item in raw]


def save_all(collection: str, items: list[BaseModel]):
    _ensure_dir()
    fp = _file(collection)
    fp.write_text(json.dumps([item.model_dump() for item in items], indent=2))


def insert(collection: str, item: BaseModel):
    items = get_all(collection, type(item))
    items.append(item)
    save_all(collection, items)


def get_by_field(collection: str, model: Type[T], field: str, value: str) -> T | None:
    for item in get_all(collection, model):
        if getattr(item, field, None) == value:
            return item
    return None


def get_many_by_field(collection: str, model: Type[T], field: str, value: str) -> list[T]:
    return [item for item in get_all(collection, model) if getattr(item, field, None) == value]


def update_by_field(collection: str, model: Type[T], field: str, value: str, patch: dict) -> T | None:
    items = get_all(collection, model)
    for i, item in enumerate(items):
        if getattr(item, field, None) == value:
            updated = item.model_copy(update=patch)
            items[i] = updated
            save_all(collection, items)
            return updated
    return None
