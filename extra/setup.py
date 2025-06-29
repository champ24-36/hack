from setuptools import setup, find_packages

setup(
    name="langchain-rag-system",
    version="1.0.0",
    description="RAG system using LangChain, ChromaDB, and Gemini",
    packages=find_packages(),
    install_requires=[
        "langchain==0.1.0",
        "langchain-google-genai==0.0.8",
        "langchain-community==0.0.13",
        "chromadb==0.4.22",
        "python-dotenv==1.0.0",
        "tiktoken==0.5.2",
        "numpy==1.24.3",
        "pandas==2.0.3",
    ],
    python_requires=">=3.8",
    entry_points={
        "console_scripts": [
            "rag-system=main:main",
        ],
    },
)