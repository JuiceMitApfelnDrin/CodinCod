from fastapi import FastAPI
from pydantic import BaseModel
from functools import lru_cache
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from typing import List, Dict
from llama_index.llms.openai_like import OpenAILike

Settings.llm = OpenAILike(model="deepseek-r1:14b", base_url="http://localhost:11434", temperature=0.7)
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Initialize storage context
storage_dir = "./storage"
if not os.path.exists(storage_dir):
    # Create new index if storage doesn't exist
    documents = SimpleDirectoryReader(".").load_data()
    index = VectorStoreIndex.from_documents(documents)
    index.storage_context.persist(persist_dir=storage_dir)
else:
    # Load existing index
    storage_context = StorageContext.from_defaults(persist_dir=storage_dir)
    index = VectorStoreIndex.from_documents(
        [], storage_context=storage_context
    )

query_engine = index.as_query_engine(similarity_top_k=5)

app = FastAPI()

class Query(BaseModel):
    query: str

@lru_cache(maxsize=100)
def get_cached_response(query: str) -> List[Dict]:
    response = query_engine.query(query)
    return [
        {
            "filename": node.metadata.get("file_name", "unknown"),
            "content": node.text,
            "score": node.score
        }
        for node in response.source_nodes
    ]

@app.post("/query")
async def handle_query(query: Query):
    results = get_cached_response(query.query)
    return {
        "context_items": [
            {
                "name": f"Code: {res['filename']}",
                "description": f"Relevance: {res['score']:.2f}",
                "content": res["content"]
            }
            for res in results
        ]
    }

WARMUP_QUERIES = ["authentication", "API endpoints", "database schema"]

@app.on_event("startup")
async def warmup_cache():
    for query in WARMUP_QUERIES:
        get_cached_response(query)