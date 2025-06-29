from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from typing import List, Dict, Any
from config import Config
from vector_store import VectorStoreManager

class RAGSystem:
    """Complete RAG system using LangChain, ChromaDB, and Gemini"""
    
    def __init__(self):
        self.config = Config()
        self.vector_manager = VectorStoreManager()
        self.llm = None
        self.qa_chain = None
        self._initialized = False  # Track initialization state
        
    def initialize(self, persist_directory: str = "./chroma_db"):
        """Initialize all components of the RAG system"""
        print("🚀 Initializing RAG System...")
        
        # Validate configuration
        self.config.validate()
        
        # Initialize embeddings
        self.vector_manager.initialize_embeddings()
        
        # Initialize ChromaDB
        self.vector_manager.initialize_chromadb(persist_directory)
        
        # Initialize Gemini LLM
        self._initialize_llm()
        
        # Create QA chain
        self._create_qa_chain()
        
        self._initialized = True
        print("✅ RAG System initialized successfully!")
    
    def _initialize_llm(self):
        """Initialize Gemini LLM"""
        try:
            self.llm = ChatGoogleGenerativeAI(
                model=self.config.LLM_MODEL,
                google_api_key=self.config.GOOGLE_API_KEY,
                temperature=self.config.LLM_TEMPERATURE,
                max_output_tokens=self.config.LLM_MAX_OUTPUT_TOKENS
            )
            print("✅ Gemini LLM initialized successfully")
        except Exception as e:
            raise Exception(f"Failed to initialize LLM: {e}")
    
    def _create_qa_chain(self):
        """Create the question-answering chain"""
        # Custom prompt template for better responses
        prompt_template = """
You are a helpful AI assistant that answers questions based on the provided context. 
Use the following pieces of context to answer the question at the end. 
If you don't know the answer based on the context, just say that you don't know, don't try to make up an answer.
Always provide a clear, concise, and helpful response in natural human language.

Context:
{context}

Question: {question}

Answer:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        try:
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_manager.vector_store.as_retriever(
                    search_kwargs={"k": self.config.TOP_K_RESULTS}
                ),
                chain_type_kwargs={"prompt": PROMPT},
                return_source_documents=True
            )
            print("✅ QA Chain created successfully")
        except Exception as e:
            raise Exception(f"Failed to create QA chain: {e}")
    
    def add_documents(self, documents: List[Document], auto_initialize: bool = False):
        """Add documents to the vector store"""
        # Check if auto-initialization is requested
        if auto_initialize and not self._initialized:
            print("⚠️  RAG system not initialized. Auto-initializing...")
            self.initialize()
        
        # Check if system is initialized
        if not self._initialized:
            raise ValueError("RAG system not initialized. Call initialize() first or set auto_initialize=True.")
        
        # Now add documents
        self.vector_manager.add_documents(documents)
    
    def query(self, question: str) -> Dict[str, Any]:
        """Query the RAG system"""
        if not self._initialized or not self.qa_chain:
            raise ValueError("RAG system not initialized. Call initialize() first.")
        
        try:
            print(f"❓ Processing query: {question}")
            
            # Get response from QA chain
            response = self.qa_chain({"query": question})
            
            # Format the response
            result = {
                "question": question,
                "answer": response["result"],
                "source_documents": [
                    {
                        "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                        "metadata": doc.metadata
                    }
                    for doc in response["source_documents"]
                ]
            }
            
            print("✅ Query processed successfully")
            return result
            
        except Exception as e:
            raise Exception(f"Failed to process query: {e}")
    
    def get_similar_documents(self, query: str, k: int = None) -> List[Document]:
        """Get similar documents without LLM processing"""
        if not self._initialized:
            raise ValueError("RAG system not initialized. Call initialize() first.")
        return self.vector_manager.similarity_search(query, k)
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get information about the RAG system"""
        return {
            "initialized": self._initialized,
            "vector_store_info": self.vector_manager.get_collection_info(),
            "config": {
                "embedding_model": self.config.EMBEDDING_MODEL,
                "llm_model": self.config.LLM_MODEL,
                "chunk_size": self.config.CHUNK_SIZE,
                "top_k_results": self.config.TOP_K_RESULTS
            }
        }