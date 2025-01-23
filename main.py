from fastapi import FastAPI, HTTPException

# Initialize the FastAPI application
app = FastAPI()

# In-memory storage for items
items = {
    1: {"name": "Item One", "description": "This is the first item."},
    2: {"name": "Item Two", "description": "This is the second item."}
}

# Print registered routes (for debugging)
print("Routes registered before adding endpoints:", app.routes)

# Define the /items/ route
@app.get("/items/")
def get_items():
    return items

# Print registered routes after adding endpoints (for debugging)
print("Routes registered after adding endpoints:", app.routes)

