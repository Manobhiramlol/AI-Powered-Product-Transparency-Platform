import re
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
    """Validate required fields in data"""
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    return missing_fields

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    text = re.sub(r'[<>"\']', '', text)
    return text.strip()

def calculate_text_completeness(text: str) -> float:
    """Calculate completeness score for text input"""
    if not text:
        return 0.0
    
    # Remove whitespace and count characters
    clean_text = re.sub(r'\s+', ' ', text.strip())
    
    if len(clean_text) < 10:
        return 0.1
    elif len(clean_text) < 50:
        return 0.3
    elif len(clean_text) < 100:
        return 0.6
    elif len(clean_text) < 200:
        return 0.8
    else:
        return 1.0

def extract_category_keywords(text: str) -> List[str]:
    """Extract relevant keywords from text for categorization"""
    if not text:
        return []
    
    # Common keywords for different categories
    keywords = {
        'food': ['organic', 'natural', 'ingredients', 'nutrition', 'diet', 'healthy'],
        'cosmetics': ['skin', 'beauty', 'cosmetic', 'personal care', 'fragrance'],
        'supplements': ['vitamin', 'supplement', 'health', 'nutrient', 'mineral']
    }
    
    text_lower = text.lower()
    found_keywords = []
    
    for category, category_keywords in keywords.items():
        for keyword in category_keywords:
            if keyword in text_lower:
                found_keywords.append(category)
                break
    
    return found_keywords

def format_timestamp(timestamp: float) -> str:
    """Format timestamp to readable string"""
    return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')

def create_error_response(error_message: str, status_code: int = 400) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        'success': False,
        'error': error_message,
        'timestamp': datetime.now().isoformat(),
        'status_code': status_code
    }

def create_success_response(data: Dict[str, Any], message: Optional[str] = None) -> Dict[str, Any]:
    """Create standardized success response"""
    response = {
        'success': True,
        'data': data,
        'timestamp': datetime.now().isoformat()
    }
    if message:
        response['message'] = message
    return response

def log_api_request(method: str, endpoint: str, data: Optional[Dict[str, Any]] = None):
    """Log API request for monitoring"""
    logger.info(f"API Request: {method} {endpoint}")
    if data:
        logger.debug(f"Request data: {data}")

def log_api_response(endpoint: str, status_code: int, response_time: float):
    """Log API response for monitoring"""
    logger.info(f"API Response: {endpoint} - {status_code} ({response_time:.3f}s)")

def validate_question_data(question_data: Dict[str, Any]) -> List[str]:
    """Validate question data structure"""
    errors = []
    required_fields = ['id', 'question', 'type', 'required']
    
    for field in required_fields:
        if field not in question_data:
            errors.append(f"Missing required field: {field}")
    
    if 'type' in question_data and question_data['type'] not in ['text', 'textarea', 'select', 'number']:
        errors.append("Invalid question type")
    
    if 'type' in question_data and question_data['type'] == 'select':
        if 'options' not in question_data or not question_data['options']:
            errors.append("Select questions must have options")
    
    return errors 