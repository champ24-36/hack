import chromadb
from chromadb.config import Settings
from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from typing import List
from config import Config

class VectorStoreManager:
    """Manage ChromaDB vector store operations"""
    
    def __init__(self):
        self.config = Config()
        self.embeddings = None
        self.vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config.CHUNK_SIZE,
            chunk_overlap=self.config.CHUNK_OVERLAP,
            length_function=len,
        )
        
    def initialize_embeddings(self):
        """Initialize Gemini embeddings"""
        try:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model=self.config.EMBEDDING_MODEL,
                google_api_key=self.config.GOOGLE_API_KEY
            )
            print("✅ Gemini embeddings initialized successfully")
        except Exception as e:
            raise Exception(f"Failed to initialize embeddings: {e}")
    
    def initialize_chromadb(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB client"""
        try:
            # Initialize ChromaDB client
            client = chromadb.PersistentClient(path=persist_directory)
            
            # Initialize vector store
            self.vector_store = Chroma(
                client=client,
                collection_name=self.config.CHROMADB_COLLECTION_NAME,
                embedding_function=self.embeddings,
            )
            print("✅ ChromaDB initialized successfully")
        except Exception as e:
            raise Exception(f"Failed to initialize ChromaDB: {e}")
    
    def add_documents(self, documents: List[Document]) -> None:
        """Add documents to the vector store"""
        if not self.vector_store:
            raise ValueError("Vector store not initialized. Call initialize_chromadb first.")
        
        try:
            # Split documents into chunks
            split_docs = self.text_splitter.split_documents(documents)
            print(f"📄 Split {len(documents)} documents into {len(split_docs)} chunks")
            
            # Add to vector store
            self.vector_store.add_documents(split_docs)
            print(f"✅ Successfully added {len(split_docs)} document chunks to vector store")
            
        except Exception as e:
            raise Exception(f"Failed to add documents to vector store: {e}")
    
    def similarity_search(self, query: str, k: int = None) -> List[Document]:
        """Perform similarity search"""
        if not self.vector_store:
            raise ValueError("Vector store not initialized")
        
        k = k or self.config.TOP_K_RESULTS
        
        try:
            results = self.vector_store.similarity_search(query, k=k)
            print(f"🔍 Found {len(results)} similar documents for query")
            return results
        except Exception as e:
            raise Exception(f"Failed to perform similarity search: {e}")
    
    def similarity_search_with_score(self, query: str, k: int = None) -> List[tuple]:
        """Perform similarity search with relevance scores"""
        if not self.vector_store:
            raise ValueError("Vector store not initialized")
        
        k = k or self.config.TOP_K_RESULTS
        
        try:
            results = self.vector_store.similarity_search_with_score(query, k=k)
            # Filter by similarity threshold
            filtered_results = [
                (doc, score) for doc, score in results 
                if score >= self.config.SIMILARITY_THRESHOLD
            ]
            print(f"🔍 Found {len(filtered_results)} relevant documents (score >= {self.config.SIMILARITY_THRESHOLD})")
            return filtered_results
        except Exception as e:
            raise Exception(f"Failed to perform similarity search with scores: {e}")
    
    def get_collection_info(self) -> dict:
        """Get information about the current collection"""
        if not self.vector_store:
            return {"error": "Vector store not initialized"}
        
        try:
            collection = self.vector_store._collection
            return {
                "name": collection.name,
                "count": collection.count(),
                "metadata": collection.metadata
            }
        except Exception as e:
            return {"error": f"Failed to get collection info: {e}"}