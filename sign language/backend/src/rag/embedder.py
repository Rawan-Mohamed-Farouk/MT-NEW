import json
from typing import List
from openai import OpenAI

from backend.src.config import settings


def get_embedding(text: str) -> List[float]:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set")

    text = text or ""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.embeddings.create(
        model=settings.OPENAI_EMBED_MODEL,
        input=text,
    )
    return resp.data[0].embedding


def embedding_to_json(vector: List[float]) -> str:
    return json.dumps(vector)


def embedding_from_json(data: str) -> List[float]:
    return json.loads(data)

