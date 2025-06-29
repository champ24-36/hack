import os
import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import GoogleGenerativeAIEmbeddings
from langchain.llms import GoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.schema import Document
import chromadb

class HinduMarriageActRAG:
    def __init__(self, google_api_key):
        """Initialize the RAG system for Hindu Marriage Act"""
        self.google_api_key = google_api_key
        os.environ["GOOGLE_API_KEY"] = google_api_key
        
        # Initialize components
        self.embeddings = None
        self.llm = None
        self.vectorstore = None
        self.qa_chain = None
        
        self._setup_system()
    
    def _setup_system(self):
        """Set up all RAG components"""
        try:
            # Initialize ChromaDB
            print("🔄 Initializing ChromaDB...")
            self.chroma_client = chromadb.Client()
            print("✅ ChromaDB initialized successfully")
            
            # Initialize embeddings
            print("🔄 Initializing embeddings...")
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=self.google_api_key
            )
            print("✅ Embeddings initialized successfully")
            
            # Initialize LLM
            print("🔄 Initializing Gemini LLM...")
            self.llm = GoogleGenerativeAI(
                model="gemini-pro",
                google_api_key=self.google_api_key,
                temperature=0.7
            )
            print("✅ Gemini LLM initialized successfully")
            
            # Initialize empty vectorstore
            print("🔄 Creating vector store...")
            self.vectorstore = Chroma(
                embedding_function=self.embeddings,
                persist_directory="./chroma_db_hindu_marriage"
            )
            print("✅ Vector store created successfully")
            
            # Create QA chain
            print("🔄 Creating QA Chain...")
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5}),
                return_source_documents=True
            )
            print("✅ QA Chain created successfully")
            print("✅ RAG System initialized successfully!")
            
        except Exception as e:
            print(f"❌ Error during initialization: {str(e)}")
            raise
    
    def load_hindu_marriage_act_json(self, json_file_path):
        """Load Hindu Marriage Act data from JSON file"""
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            documents = []
            
            for item in data:
                # Handle different JSON structures
                section_id = item.get('section') or f"Section {item.get('section_number', 'Unknown')}"
                title = item.get('title', 'No Title')
                
                # Get content from different possible fields
                content = item.get('text') or item.get('content', '')
                
                # Skip if no content available
                if not content or content.strip() == '':
                    print(f"⚠️ Skipping {section_id} - No content available")
                    continue
                
                # Create full page content
                page_content = f"SECTION: {section_id}\nTITLE: {title}\n\nCONTENT:\n{content}"
                
                # Create metadata
                metadata = {
                    "source": "Hindu Marriage Act 1955",
                    "section": section_id,
                    "title": title,
                    "section_number": item.get('section_number', section_id.replace('Section ', '')),
                    "act": "Hindu Marriage Act, 1955",
                    "type": "legal_document"
                }
                
                # Create Document object with proper page_content
                doc = Document(
                    page_content=page_content,  # This is the required parameter
                    metadata=metadata
                )
                documents.append(doc)
            
            print(f"✅ Created {len(documents)} documents from JSON")
            return documents
            
        except FileNotFoundError:
            print(f"❌ File not found: {json_file_path}")
            raise
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON format: {str(e)}")
            raise
        except Exception as e:
            print(f"❌ Error loading JSON: {str(e)}")
            raise
    
    def add_hindu_marriage_act_documents(self, json_file_path):
        """Add Hindu Marriage Act documents to the vector store"""
        try:
            # Load documents from JSON
            documents = self.load_hindu_marriage_act_json(json_file_path)
            
            if not documents:
                print("❌ No documents to add")
                return
            
            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1500,  # Larger chunks for legal documents
                chunk_overlap=300,  # More overlap to preserve context
                separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
            )
            
            split_docs = text_splitter.split_documents(documents)
            
            # Add to vectorstore
            self.vectorstore.add_documents(split_docs)
            print(f"✅ Added {len(split_docs)} document chunks to vector store")
            
            # Persist the vectorstore
            self.vectorstore.persist()
            print("✅ Vector store persisted successfully")
            
        except Exception as e:
            print(f"❌ Error adding documents: {str(e)}")
            raise
    
    def query_hindu_marriage_act(self, question):
        """Query the Hindu Marriage Act RAG system"""
        try:
            if not self.qa_chain:
                raise ValueError("QA chain not initialized")
            
            result = self.qa_chain({"query": question})
            
            return {
                "answer": result["result"],
                "source_documents": result.get("source_documents", []),
                "sources": [doc.metadata.get("section", "Unknown") for doc in result.get("source_documents", [])]
            }
            
        except Exception as e:
            print(f"❌ Error during query: {str(e)}")
            return {"answer": f"Error: {str(e)}", "source_documents": [], "sources": []}
    
    def get_section_info(self, section_number):
        """Get specific section information"""
        try:
            query = f"What does Section {section_number} of the Hindu Marriage Act say?"
            return self.query_hindu_marriage_act(query)
        except Exception as e:
            print(f"❌ Error getting section info: {str(e)}")
            return None

# Example usage and testing
if __name__ == "__main__":
    # Replace with your actual Google API key
    GOOGLE_API_KEY = "your-google-api-key-here"
    
    try:
        # Initialize RAG system
        print("🚀 Initializing Hindu Marriage Act RAG System...")
        rag = HinduMarriageActRAG(GOOGLE_API_KEY)
        
        # Load Hindu Marriage Act data
        # Replace with your actual JSON file path
        json_file_path = "hindu_marriage_act_full.json"
        
        print(f"\n📚 Loading Hindu Marriage Act from {json_file_path}...")
        rag.add_hindu_marriage_act_documents(json_file_path)
        
        # Test queries
        test_questions = [
            "What are the conditions for a Hindu marriage?",
            "What are the grounds for divorce under Hindu Marriage Act?",
            "What is the minimum age for marriage?",
            "What is Section 13B about?",
            "Can divorced persons remarry?"
        ]
        
        print("\n🤖 Testing the system with sample questions:")
        print("="*60)
        
        for question in test_questions:
            print(f"\n❓ Question: {question}")
            result = rag.query_hindu_marriage_act(question)
            print(f"📝 Answer: {result['answer']}")
            print(f"📚 Sources: {', '.join(result['sources'])}")
            print("-" * 60)
            
    except Exception as e:
        print(f"❌ Failed to run example: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure your Google API key is correct")
        print("2. Check if the JSON file exists and is properly formatted")
        print("3. Verify all packages are installed:")
        print("   pip install langchain langchain-google-genai chromadb")

# Additional utility functions
def create_sample_documents_for_testing():
    """Create sample documents for testing if JSON file is not available"""
    sample_data = [
        {
            "section": "Section 5",
            "title": "Conditions for a Hindu marriage",
            "text": "A marriage may be solemnized between any two Hindus, if the following conditions are fulfilled, namely: (i) neither party has a spouse living at the time of the marriage; (ii) at the time of the marriage, neither party is incapable of giving a valid consent; (iii) the bridegroom has completed the age of twenty-one years and the bride, the age of eighteen years at the time of the marriage;"
        },
        {
            "section": "Section 13",
            "title": "Divorce",
            "text": "Any marriage solemnized, whether before or after the commencement of this Act, may, on a petition presented by either the husband or the wife, be dissolved by a decree of divorce on the ground that the other party has, after the solemnization of the marriage, had voluntary sexual intercourse with any person other than his or her spouse; or has, after the solemnization of the marriage, treated the petitioner with cruelty;"
        }
    ]
    
    documents = []
    for item in sample_data:
        page_content = f"SECTION: {item['section']}\nTITLE: {item['title']}\n\nCONTENT:\n{item['text']}"
        metadata = {
            "source": "Hindu Marriage Act 1955",
            "section": item['section'],
            "title": item['title']
        }
        doc = Document(page_content=page_content, metadata=metadata)
        documents.append(doc)
    
    return documents