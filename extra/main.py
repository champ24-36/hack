#!/usr/bin/env python3
"""
Main script to run the RAG system
"""

import json
import argparse
from pathlib import Path
from data_loader import JSONDataLoader
from rag_system import RAGSystem

def main():
    parser = argparse.ArgumentParser(description="RAG System with LangChain, ChromaDB, and Gemini")
    parser.add_argument("--json-file", required=True, help="Path to JSON dataset file")
    parser.add_argument("--text-fields", nargs="+", help="Specific text fields to extract (optional)")
    parser.add_argument("--metadata-fields", nargs="+", help="Metadata fields to include (optional)")
    parser.add_argument("--id-field", help="Field to use as document ID (optional)")
    parser.add_argument("--analyze-only", action="store_true", help="Only analyze JSON structure")
    parser.add_argument("--persist-dir", default="./chroma_db", help="ChromaDB persistence directory")
    
    args = parser.parse_args()
    
    # Validate JSON file exists
    if not Path(args.json_file).exists():
        print(f"❌ Error: JSON file not found: {args.json_file}")
        return
    
    # Load and analyze JSON data
    print("📊 Loading JSON data...")
    loader = JSONDataLoader(args.json_file)
    
    # Analyze structure
    analysis = loader.analyze_structure()
    print("\n📋 JSON Structure Analysis:")
    print(f"Type: {analysis['type']}")
    print(f"Suggested text fields: {analysis['suggested_text_fields']}")
    print(f"Suggested metadata fields: {analysis['suggested_metadata_fields']}")
    
    if args.analyze_only:
        print("\n📄 Detailed Structure:")
        for field, info in analysis['structure'].items():
            print(f"  {field}: {info['type']} - {info['sample']}")
        return
    
    # Create documents
    print("\n📄 Creating documents...")
    documents = loader.create_documents(
        text_fields=args.text_fields,
        metadata_fields=args.metadata_fields,
        id_field=args.id_field
    )
    
    if not documents:
        print("❌ No documents created. Check your JSON structure and field specifications.")
        return
    
    # Initialize RAG system
    print("\n🚀 Initializing RAG system...")
    rag = RAGSystem()
    rag.initialize(persist_directory=args.persist_dir)
    
    # Add documents to vector store
    print("\n📚 Adding documents to vector store...")
    rag.add_documents(documents)
    
    # Interactive query loop
    print("\n🎯 RAG system ready! Enter your questions (type 'quit' to exit):")
    print("=" * 60)
    
    while True:
        try:
            question = input("\n❓ Your question: ").strip()
            
            if question.lower() in ['quit', 'exit', 'q']:
                break
            
            if not question:
                continue
            
            # Process query
            result = rag.query(question)
            
            print(f"\n💡 Answer: {result['answer']}")
            
            if result['source_documents']:
                print(f"\n📚 Sources ({len(result['source_documents'])} documents):")
                for i, doc in enumerate(result['source_documents'], 1):
                    print(f"  {i}. {doc['content']}")
                    if doc['metadata']:
                        print(f"     Metadata: {doc['metadata']}")
        
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"❌ Error processing query: {e}")
    
    print("\n👋 Goodbye!")

if __name__ == "__main__":
    main()