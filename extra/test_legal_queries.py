#!/usr/bin/env python3
"""
Test script for Hindu Marriage Act legal queries
Optimized for VS Code debugging and testing
"""

from data_loader import JSONDataLoader
from rag_system import RAGSystem
import time

def test_hindu_marriage_act_queries():
    """Test the RAG system with Hindu Marriage Act specific queries"""
    
    print("🏛️ Testing Hindu Marriage Act RAG System")
    print("=" * 50)
    
    # Load Hindu Marriage Act data
    print("📊 Loading Hindu Marriage Act data...")
    loader = JSONDataLoader("data/hindu_marriage_act_full.json")
    
    # Create documents optimized for legal text
    documents = loader.create_documents(
        text_fields=["section", "title", "text"],
        metadata_fields=["section"],
        id_field="section"
    )
    
    # Initialize RAG system
    print("🚀 Initializing RAG system...")
    rag = RAGSystem()
    rag.initialize()
    rag.add_documents(documents)
    
    # Legal queries specific to Hindu Marriage Act
    legal_queries = [
        "What are the conditions for a valid Hindu marriage?",
        "What is the minimum age for marriage under Hindu Marriage Act?",
        "What is sapinda relationship?",
        "What are the grounds for divorce in Hindu marriage?",
        "What is the punishment for bigamy?",
        "Can divorced persons remarry?",
        "What is judicial separation?",
        "What ceremonies are required for Hindu marriage?",
        "What is restitution of conjugal rights?",
        "What are void marriages?",
        "What is mutual consent divorce?",
        "What are the degrees of prohibited relationship?",
        "Is registration of Hindu marriage mandatory?",
        "What is Saptapadi ceremony?",
        "What are voidable marriages?"
    ]
    
    print("\n🎯 Testing Legal Queries:")
    print("=" * 50)
    
    results = []
    
    for i, query in enumerate(legal_queries, 1):
        print(f"\n[{i}/{len(legal_queries)}] ❓ Query: {query}")
        
        try:
            start_time = time.time()
            result = rag.query(query)
            end_time = time.time()
            
            print(f"💡 Answer: {result['answer'][:200]}...")
            print(f"📚 Sources: {len(result['source_documents'])} documents")
            print(f"⏱️ Response time: {end_time - start_time:.2f} seconds")
            
            results.append({
                'query': query,
                'answer': result['answer'],
                'sources': len(result['source_documents']),
                'response_time': end_time - start_time
            })
            
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append({
                'query': query,
                'error': str(e)
            })
    
    # Summary
    print("\n📊 Test Summary:")
    print("=" * 50)
    successful_queries = [r for r in results if 'error' not in r]
    failed_queries = [r for r in results if 'error' in r]
    
    print(f"✅ Successful queries: {len(successful_queries)}")
    print(f"❌ Failed queries: {len(failed_queries)}")
    
    if successful_queries:
        avg_response_time = sum(r['response_time'] for r in successful_queries) / len(successful_queries)
        print(f"⏱️ Average response time: {avg_response_time:.2f} seconds")
        
        avg_sources = sum(r['sources'] for r in successful_queries) / len(successful_queries)
        print(f"📚 Average sources per query: {avg_sources:.1f}")
    
    if failed_queries:
        print("\n❌ Failed Queries:")
        for result in failed_queries:
            print(f"  - {result['query']}: {result['error']}")
    
    return results

def test_specific_sections():
    """Test queries about specific sections"""
    
    print("\n🔍 Testing Section-Specific Queries:")
    print("=" * 50)
    
    loader = JSONDataLoader("data/hindu_marriage_act_full.json")
    documents = loader.create_documents(
        text_fields=["section", "title", "text"],
        metadata_fields=["section"]
    )
    
    rag = RAGSystem()
    rag.initialize()
    rag.add_documents(documents)
    
    section_queries = [
        "What does Section 5 say about marriage conditions?",
        "Explain Section 13 about divorce",
        "What is mentioned in Section 7 about ceremonies?",
        "Tell me about Section 17 regarding bigamy",
        "What does Section 13B say about mutual consent divorce?"
    ]
    
    for query in section_queries:
        print(f"\n❓ {query}")
        try:
            result = rag.query(query)
            print(f"💡 {result['answer'][:300]}...")
        except Exception as e:
            print(f"❌ Error: {e}")

def interactive_legal_assistant():
    """Interactive mode for testing queries"""
    
    print("\n🤖 Interactive Legal Assistant Mode")
    print("=" * 50)
    print("Ask questions about Hindu Marriage Act (type 'quit' to exit)")
    
    loader = JSONDataLoader("data/hindu_marriage_act_full.json")
    documents = loader.create_documents(
        text_fields=["section", "title", "text"],
        metadata_fields=["section"]
    )
    
    rag = RAGSystem()
    rag.initialize()
    rag.add_documents(documents)
    
    while True:
        try:
            question = input("\n❓ Your legal question: ").strip()
            
            if question.lower() in ['quit', 'exit', 'q']:
                break
            
            if not question:
                continue
            
            result = rag.query(question)
            print(f"\n💡 Legal Answer: {result['answer']}")
            
            if result['source_documents']:
                print(f"\n📚 Based on {len(result['source_documents'])} relevant sections:")
                for i, doc in enumerate(result['source_documents'][:3], 1):
                    section = doc['metadata'].get('section', 'Unknown')
                    print(f"  {i}. {section}")
        
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n👋 Thank you for using the Legal Assistant!")

if __name__ == "__main__":
    # Run comprehensive tests
    test_results = test_hindu_marriage_act_queries()
    
    # Test section-specific queries
    test_specific_sections()
    
    # Optional: Interactive mode (uncomment to enable)
    # interactive_legal_assistant()
    
    print("\n✅ All tests completed!")