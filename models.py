from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ResearchItem(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    category: str
    research_type: str
    status: str = "active"
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    
class ResearchItemCreate(BaseModel):
    name: str
    description: str
    category: str
    research_type: str
    status: str = "active"

class ResearchItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    research_type: Optional[str] = None
    status: Optional[str] = None
