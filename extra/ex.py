import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access the variables
google_api_key = os.getenv("GOOGLE_API_KEY")
chroma_db_host = os.getenv("CHROMADB_HOST")
chroma_db_port = os.getenv("CHROMADB_PORT")
