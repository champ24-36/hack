import json
import pandas as pd
from typing import List, Dict, Any, Union
from langchain.schema import Document

class JSONDataLoader:
    """Load and process JSON data for RAG system"""
    
    def __init__(self, json_file_path: str):
        self.json_file_path = json_file_path
        self.data = None
        
    def load_json(self) -> Union[List[Dict], Dict]:
        """Load JSON data from file"""
        try:
            with open(self.json_file_path, 'r', encoding='utf-8') as file:
                self.data = json.load(file)
            print(f"✅ Successfully loaded JSON data from {self.json_file_path}")
            return self.data
        except FileNotFoundError:
            raise FileNotFoundError(f"JSON file not found: {self.json_file_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {e}")
    
    def extract_text_fields(self, obj: Any, text_fields: List[str] = None) -> str:
        """Extract text from specified fields or all string fields"""
        if text_fields is None:
            # Auto-detect text fields (string values)
            text_fields = []
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if isinstance(value, str) and len(value.strip()) > 0:
                        text_fields.append(key)
        
        text_content = []
        if isinstance(obj, dict):
            for field in text_fields:
                if field in obj and isinstance(obj[field], str):
                    text_content.append(f"{field}: {obj[field].strip()}")
        
        return "\n".join(text_content)
    
    def create_documents(self, 
                        text_fields: List[str] = None,
                        metadata_fields: List[str] = None,
                        id_field: str = None) -> List[Document]:
        """Convert JSON data to LangChain Documents"""
        if self.data is None:
            self.load_json()
        
        documents = []
        
        # Handle different JSON structures
        if isinstance(self.data, list):
            # Array of objects
            for i, item in enumerate(self.data):
                if isinstance(item, dict):
                    text_content = self.extract_text_fields(item, text_fields)
                    
                    # Create metadata
                    metadata = {"source": self.json_file_path, "index": i}
                    
                    # Add ID if specified
                    if id_field and id_field in item:
                        metadata["id"] = item[id_field]
                    
                    # Add specified metadata fields
                    if metadata_fields:
                        for field in metadata_fields:
                            if field in item:
                                metadata[field] = item[field]
                    
                    if text_content.strip():
                        documents.append(Document(
                            page_content=text_content,
                            metadata=metadata
                        ))
        
        elif isinstance(self.data, dict):
            # Single object or nested structure
            if text_fields:
                # Treat as single document
                text_content = self.extract_text_fields(self.data, text_fields)
                metadata = {"source": self.json_file_path}
                
                if metadata_fields:
                    for field in metadata_fields:
                        if field in self.data:
                            metadata[field] = self.data[field]
                
                if text_content.strip():
                    documents.append(Document(
                        page_content=text_content,
                        metadata=metadata
                    ))
            else:
                # Try to find nested arrays or objects
                for key, value in self.data.items():
                    if isinstance(value, list):
                        for i, item in enumerate(value):
                            if isinstance(item, dict):
                                text_content = self.extract_text_fields(item, text_fields)
                                metadata = {
                                    "source": self.json_file_path,
                                    "section": key,
                                    "index": i
                                }
                                
                                if text_content.strip():
                                    documents.append(Document(
                                        page_content=text_content,
                                        metadata=metadata
                                    ))
        
        print(f"✅ Created {len(documents)} documents from JSON data")
        return documents
    
    def analyze_structure(self) -> Dict[str, Any]:
        """Analyze JSON structure to help identify fields"""
        if self.data is None:
            self.load_json()
        
        analysis = {
            "type": type(self.data).__name__,
            "structure": {},
            "suggested_text_fields": [],
            "suggested_metadata_fields": []
        }
        
        def analyze_object(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    value_type = type(value).__name__
                    
                    if isinstance(value, str) and len(value.strip()) > 10:
                        analysis["suggested_text_fields"].append(current_path)
                    elif isinstance(value, (str, int, float, bool)):
                        analysis["suggested_metadata_fields"].append(current_path)
                    
                    analysis["structure"][current_path] = {
                        "type": value_type,
                        "sample": str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
                    }
                    
                    if isinstance(value, (dict, list)) and len(str(value)) < 1000:
                        analyze_object(value, current_path)
            
            elif isinstance(obj, list) and obj:
                sample_item = obj[0]
                analyze_object(sample_item, f"{path}[0]")
        
        analyze_object(self.data)
        return analysis