from typing import List, Dict, Optional

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

from backend.src.config import settings


def get_chroma_client():
    if not CHROMADB_AVAILABLE:
        raise RuntimeError("ChromaDB is not available. Install dependencies: pip install chromadb")
    return chromadb.Client(
        ChromaSettings(
            persist_directory=settings.CHROMA_DIR,
            anonymized_telemetry=False,
        )
    )


def get_collection():
    if not CHROMADB_AVAILABLE:
        return None
    client = get_chroma_client()
    return client.get_or_create_collection(settings.CHROMA_COLLECTION)


def add_to_chroma(doc_id: str, text: str, metadata: Dict, embedding: List[float]):
    if not CHROMADB_AVAILABLE:
        return  # Skip if chromadb not available
    try:
        collection = get_collection()
        if collection:
            collection.add(
                ids=[doc_id],
                documents=[text],
                metadatas=[metadata],
                embeddings=[embedding],
            )
    except Exception as e:
        print(f"Warning: Could not add to ChromaDB: {e}")


def search_chroma(query_embedding: List[float], n_results: int = 5) -> Optional[Dict]:
    if not CHROMADB_AVAILABLE:
        return None  # Return None if chromadb not available
    try:
        collection = get_collection()
        if collection:
            results = collection.query(query_embeddings=[query_embedding], n_results=n_results)
            return results
    except Exception as e:
        print(f"Warning: Could not search ChromaDB: {e}")
    return None

