import logging
from fastapi import FastAPI

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize the FastAPI application
app = FastAPI(
    title="Bios Analytics API",
    description="A healthcare analytics API for data-driven medical insights",
    version="1.0.0"
)

# In-memory storage for items
items = {
    1: {"name": "Item One", "description": "This is the first item."},
    2: {"name": "Item Two", "description": "This is the second item."}
}

logger.info("Bios Analytics API initialized successfully")

# Define the /items/ route
@app.get("/items/", summary="Get all items", description="Retrieve all items from the in-memory storage")
def get_items():
    logger.info("Items endpoint accessed")
    return items

