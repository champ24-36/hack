import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration settings for the RAG system"""
    
    # Google API Configuration
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    
    # ChromaDB Configuration
    CHROMADB_HOST = os.getenv("CHROMADB_HOST", "localhost")
    CHROMADB_PORT = int(os.getenv("CHROMADB_PORT", "8000"))
    CHROMADB_COLLECTION_NAME = "documents"
    
    # Embedding Configuration
    EMBEDDING_MODEL = "models/embedding-001"
    
    # LLM Configuration
    LLM_MODEL = "gemini-pro"
    LLM_TEMPERATURE = 0.1
    LLM_MAX_OUTPUT_TOKENS = 1000
    
    # Chunk Configuration
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    
    # Retrieval Configuration
    TOP_K_RESULTS = 5
    SIMILARITY_THRESHOLD = 0.7

    @classmethod
    def validate(cls):
        """Validate that all required configuration is present"""
        if not cls.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        print("✅ Configuration validated successfully")