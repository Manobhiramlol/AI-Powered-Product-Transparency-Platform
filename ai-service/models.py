from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

@dataclass
class Question:
    """Data model for dynamic questions"""
    id: str
    question: str
    type: str  # 'text', 'textarea', 'select', 'number'
    required: bool
    category: Optional[str] = None
    options: Optional[List[str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict())

@dataclass
class TransparencyScore:
    """Data model for transparency score results"""
    score: int
    max_score: int
    raw_score: int
    insights: List[str]
    timestamp: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict())

@dataclass
class FormData:
    """Data model for form submission data"""
    product_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    sourcing: Optional[str] = None
    manufacturing: Optional[str] = None
    certifications: Optional[str] = None
    # Dynamic fields will be stored as additional attributes
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'FormData':
        """Create FormData from dictionary"""
        return cls(**data)

@dataclass
class APIResponse:
    """Standard API response model"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = {'success': self.success}
        if self.data:
            result['data'] = self.data
        if self.error:
            result['error'] = self.error
        if self.message:
            result['message'] = self.message
        return result
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict()) 