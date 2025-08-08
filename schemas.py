from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ResearchItemResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    research_type: str
    status: str
    created_date: datetime
    updated_date: datetime
    
    class Config:
        from_attributes = True

class ResearchItemListResponse(BaseModel):
    items: List[ResearchItemResponse]
    total: int
    
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
