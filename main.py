import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime
from models import ResearchItem, ResearchItemCreate, ResearchItemUpdate
from schemas import ResearchItemResponse, ResearchItemListResponse, APIResponse

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

research_items: Dict[int, Dict[str, Any]] = {
    1: {
        "id": 1,
        "name": "Natural Antioxidant Study",
        "description": "Research on the effectiveness of natural antioxidants in preventing cellular damage",
        "category": "Natural Medicine",
        "research_type": "Clinical Trial",
        "status": "active",
        "created_date": datetime.now(),
        "updated_date": datetime.now()
    },
    2: {
        "id": 2,
        "name": "Herbal Pain Management",
        "description": "Comparative study of herbal remedies vs traditional pain management approaches",
        "category": "Pain Management",
        "research_type": "Comparative Study",
        "status": "active",
        "created_date": datetime.now(),
        "updated_date": datetime.now()
    },
    3: {
        "id": 3,
        "name": "Meditation and Stress Reduction",
        "description": "Analysis of meditation techniques for stress reduction in clinical settings",
        "category": "Mental Health",
        "research_type": "Observational Study",
        "status": "completed",
        "created_date": datetime.now(),
        "updated_date": datetime.now()
    },
    4: {
        "id": 4,
        "name": "Nutritional Therapy for Diabetes",
        "description": "Investigating plant-based nutritional interventions for Type 2 diabetes management",
        "category": "Nutrition",
        "research_type": "Randomized Trial",
        "status": "active",
        "created_date": datetime.now(),
        "updated_date": datetime.now()
    },
    5: {
        "id": 5,
        "name": "Acupuncture Efficacy Study",
        "description": "Meta-analysis of acupuncture effectiveness across various health conditions",
        "category": "Traditional Medicine",
        "research_type": "Meta-Analysis",
        "status": "in_review",
        "created_date": datetime.now(),
        "updated_date": datetime.now()
    }
}

next_id = 6

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}

logger.info("Bios Analytics API initialized successfully")

@app.get("/items/", summary="Get all research items", description="Retrieve all healthcare research items from storage")
def get_items():
    logger.info("Research items endpoint accessed")
    return research_items

@app.get("/research/items/", response_model=ResearchItemListResponse, summary="Get research items list", description="Retrieve research items in structured list format")
def get_research_items():
    logger.info("Research items list endpoint accessed")
    items_list = [ResearchItemResponse(**item) for item in research_items.values()]
    return ResearchItemListResponse(items=items_list, total=len(items_list))

@app.get("/research/items/{item_id}", response_model=ResearchItemResponse, summary="Get research item by ID", description="Retrieve a specific research item by its ID")
def get_research_item(item_id: int):
    logger.info(f"Research item {item_id} requested")
    if item_id not in research_items:
        raise HTTPException(status_code=404, detail="Research item not found")
    return ResearchItemResponse(**research_items[item_id])

@app.post("/research/items/", response_model=APIResponse, summary="Create research item", description="Add a new healthcare research item")
def create_research_item(item: ResearchItemCreate):
    global next_id
    logger.info(f"Creating new research item: {item.name}")
    
    new_item = {
        "id": next_id,
        "name": item.name,
        "description": item.description,
        "category": item.category,
        "research_type": item.research_type,
        "status": item.status,
        "created_date": datetime.now(),
        "updated_date": datetime.now()
    }
    
    research_items[next_id] = new_item
    next_id += 1
    
    return APIResponse(
        success=True,
        message="Research item created successfully",
        data={"id": new_item["id"], "name": new_item["name"]}
    )

@app.put("/research/items/{item_id}", response_model=APIResponse, summary="Update research item", description="Update an existing research item")
def update_research_item(item_id: int, item: ResearchItemUpdate):
    logger.info(f"Updating research item {item_id}")
    
    if item_id not in research_items:
        raise HTTPException(status_code=404, detail="Research item not found")
    
    current_item = research_items[item_id]
    update_data = item.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        current_item[field] = value
    
    current_item["updated_date"] = datetime.now()
    
    return APIResponse(
        success=True,
        message="Research item updated successfully",
        data={"id": item_id, "name": current_item["name"]}
    )

@app.delete("/research/items/{item_id}", response_model=APIResponse, summary="Delete research item", description="Remove a research item from storage")
def delete_research_item(item_id: int):
    logger.info(f"Deleting research item {item_id}")
    
    if item_id not in research_items:
        raise HTTPException(status_code=404, detail="Research item not found")
    
    deleted_item = research_items.pop(item_id)
    
    return APIResponse(
        success=True,
        message="Research item deleted successfully",
        data={"id": item_id, "name": deleted_item["name"]}
    )

@app.get("/analytics/summary", summary="Get analytics summary", description="Retrieve summary analytics for dashboard")
def get_analytics_summary():
    logger.info("Analytics summary requested")
    
    total_items = len(research_items)
    categories = {}
    research_types = {}
    statuses = {}
    
    for item in research_items.values():
        category = item["category"]
        categories[category] = categories.get(category, 0) + 1
        
        research_type = item["research_type"]
        research_types[research_type] = research_types.get(research_type, 0) + 1
        
        status = item["status"]
        statuses[status] = statuses.get(status, 0) + 1
    
    return {
        "total_items": total_items,
        "categories": categories,
        "research_types": research_types,
        "statuses": statuses,
        "last_updated": datetime.now()
    }

