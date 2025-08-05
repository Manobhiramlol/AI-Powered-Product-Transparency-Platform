from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import BadRequest
import json
import time
import os
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Import AI service
try:
    from ai_service import AIService
    ai_service = AIService()
    AI_ENABLED = True
    logger.info("AI service initialized successfully")
except ImportError as e:
    logger.warning(f"AI service not available: {e}")
    ai_service = None
    AI_ENABLED = False

# Data models
class Question:
    def __init__(self, id: str, question: str, type: str, required: bool, 
                 category: Optional[str] = None, options: Optional[List[str]] = None):
        self.id = id
        self.question = question
        self.type = type
        self.required = required
        self.category = category
        self.options = options or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'question': self.question,
            'type': self.type,
            'required': self.required,
            'category': self.category,
            'options': self.options
        }

class TransparencyService:
    def __init__(self):
        self.question_templates = self._load_question_templates()
    
    def _load_question_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load question templates for different categories"""
        return {
            'Food & Beverages': [
                {
                    'id': 'nutritional_info',
                    'question': 'Please provide detailed nutritional information per serving',
                    'type': 'textarea',
                    'required': True,
                    'category': 'nutrition'
                },
                {
                    'id': 'preservatives',
                    'question': 'What preservatives, if any, are used in this product?',
                    'type': 'textarea',
                    'required': False,
                    'category': 'ingredients'
                },
                {
                    'id': 'shelf_life',
                    'question': 'What is the typical shelf life of this product?',
                    'type': 'select',
                    'options': ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year'],
                    'required': True,
                    'category': 'storage'
                },
                {
                    'id': 'allergen_testing',
                    'question': 'How do you test for and prevent cross-contamination with allergens?',
                    'type': 'textarea',
                    'required': True,
                    'category': 'safety'
                }
            ],
            'Cosmetics & Personal Care': [
                {
                    'id': 'skin_type',
                    'question': 'What skin types is this product suitable for?',
                    'type': 'select',
                    'options': ['All skin types', 'Dry skin', 'Oily skin', 'Sensitive skin', 'Combination skin'],
                    'required': True,
                    'category': 'suitability'
                },
                {
                    'id': 'animal_testing',
                    'question': 'Has this product or its ingredients been tested on animals?',
                    'type': 'select',
                    'options': ['No, never tested on animals', 'Not tested by us, but suppliers may have', 'Yes, tested on animals', 'Unknown'],
                    'required': True,
                    'category': 'ethics'
                },
                {
                    'id': 'packaging_material',
                    'question': 'What materials are used in the product packaging?',
                    'type': 'textarea',
                    'required': True,
                    'category': 'packaging'
                }
            ],
            'Supplements & Vitamins': [
                {
                    'id': 'dosage_instructions',
                    'question': 'What are the recommended dosage instructions?',
                    'type': 'textarea',
                    'required': True,
                    'category': 'usage'
                },
                {
                    'id': 'third_party_testing',
                    'question': 'Is this product third-party tested for purity and potency?',
                    'type': 'select',
                    'options': ['Yes, by certified labs', 'Yes, internally tested', 'No testing performed', 'Unknown'],
                    'required': True,
                    'category': 'quality'
                },
                {
                    'id': 'contraindications',
                    'question': 'Are there any known contraindications or interactions?',
                    'type': 'textarea',
                    'required': True,
                    'category': 'safety'
                }
            ]
        }
    
    def generate_questions(self, form_data: Dict[str, str]) -> List[Dict[str, Any]]:
        """Generate dynamic questions based on form data"""
        logger.info(f"Generating questions for category: {form_data.get('category', 'Unknown')}")
        
        # Try AI-powered question generation first
        if AI_ENABLED and ai_service:
            try:
                logger.info("Using AI service for question generation")
                ai_questions = ai_service.generate_questions_with_perplexity(form_data)
                if ai_questions:
                    logger.info(f"AI generated {len(ai_questions)} questions")
                    return ai_questions
            except Exception as e:
                logger.warning(f"AI question generation failed, falling back to local logic: {e}")
        
        # Fallback to local logic
        logger.info("Using local logic for question generation")
        time.sleep(0.5)
        
        category = form_data.get('category', 'General')
        questions = []
        
        # Get category-specific questions
        if category in self.question_templates:
            questions.extend(self.question_templates[category])
        else:
            # Default questions for unknown categories
            questions.extend([
                {
                    'id': 'quality_standards',
                    'question': 'What quality standards does your product meet?',
                    'type': 'textarea',
                    'required': True,
                    'category': 'quality'
                },
                {
                    'id': 'environmental_impact',
                    'question': 'How does your product minimize environmental impact?',
                    'type': 'textarea',
                    'required': False,
                    'category': 'sustainability'
                }
            ])
        
        # Add intelligent follow-up based on ingredients
        ingredients = form_data.get('ingredients', '').lower()
        if 'organic' in ingredients:
            questions.append({
                'id': 'organic_certification',
                'question': 'Please provide details about your organic certification',
                'type': 'textarea',
                'required': True,
                'category': 'certifications'
            })
        
        # Add supply chain questions for all products
        questions.extend([
            {
                'id': 'supplier_audits',
                'question': 'How often do you audit your suppliers?',
                'type': 'select',
                'options': ['Monthly', 'Quarterly', 'Annually', 'As needed', 'Never'],
                'required': True,
                'category': 'supply_chain'
            },
            {
                'id': 'traceability',
                'question': 'Can you trace this product back to its raw material sources?',
                'type': 'select',
                'options': ['Complete traceability', 'Partial traceability', 'Limited traceability', 'No traceability'],
                'required': True,
                'category': 'supply_chain'
            },
            {
                'id': 'social_responsibility',
                'question': 'What social responsibility initiatives does your company support?',
                'type': 'textarea',
                'required': False,
                'category': 'ethics'
            }
        ])
        
        return questions
    
    def calculate_transparency_score(self, form_data: Dict[str, str]) -> Dict[str, Any]:
        """Calculate transparency score based on form data"""
        logger.info("Calculating transparency score")
        
        # Try AI-powered scoring first
        if AI_ENABLED and ai_service:
            try:
                logger.info("Using AI service for transparency scoring")
                ai_result = ai_service.calculate_score_with_ai(form_data)
                if ai_result and 'score' in ai_result:
                    logger.info(f"AI calculated score: {ai_result['score']}")
                    return ai_result
            except Exception as e:
                logger.warning(f"AI scoring failed, falling back to local logic: {e}")
        
        # Fallback to local logic
        logger.info("Using local logic for transparency scoring")
        time.sleep(0.3)
        
        score = 0
        max_score = 0
        
        # Base scoring for required fields
        required_fields = ['productName', 'category', 'brand', 'description', 'ingredients', 'sourcing', 'manufacturing']
        
        for field in required_fields:
            max_score += 10
            value = form_data.get(field, '')
            if value and value.strip():
                # Score based on completeness and detail
                if len(value) > 100:
                    score += 10  # Detailed response
                elif len(value) > 50:
                    score += 8   # Moderate detail
                elif len(value) > 20:
                    score += 6   # Basic response
                else:
                    score += 3   # Minimal response
        
        # Bonus points for additional transparency elements
        certifications = form_data.get('certifications', '')
        if certifications and len(certifications) > 50:
            score += 15
        max_score += 15
        
        # Score dynamic questions
        for key, value in form_data.items():
            if key not in required_fields and value and value.strip():
                max_score += 5
                if len(value) > 50:
                    score += 5
                elif len(value) > 20:
                    score += 3
                else:
                    score += 1
        
        # Ensure score is between 0 and 100
        final_score = min(100, max(0, round((score / max_score) * 100) if max_score > 0 else 0))
        
        # Generate insights
        insights = self._generate_insights(form_data, final_score)
        
        return {
            'score': final_score,
            'max_score': max_score,
            'raw_score': score,
            'insights': insights,
            'timestamp': time.time()
        }
    
    def _generate_insights(self, form_data: Dict[str, str], score: int) -> List[str]:
        """Generate insights and recommendations based on score and data"""
        insights = []
        
        if score >= 80:
            insights.append("Excellent transparency! Your product demonstrates high levels of openness and accountability.")
        elif score >= 60:
            insights.append("Good transparency with room for improvement in some areas.")
        else:
            insights.append("Consider providing more detailed information to improve transparency.")
        
        # Category-specific insights
        category = form_data.get('category', '')
        if category == 'Food & Beverages':
            if not form_data.get('nutritional_info'):
                insights.append("Consider adding detailed nutritional information to help consumers make informed choices.")
            if not form_data.get('allergen_testing'):
                insights.append("Allergen testing information would enhance consumer trust and safety.")
        
        if category == 'Cosmetics & Personal Care':
            if not form_data.get('animal_testing'):
                insights.append("Clear animal testing policies are increasingly important to consumers.")
        
        # General recommendations
        supplier_audits = form_data.get('supplier_audits', '')
        if not supplier_audits or supplier_audits == 'Never':
            insights.append("Regular supplier audits demonstrate commitment to quality and ethical sourcing.")
        
        traceability = form_data.get('traceability', '')
        if not traceability or traceability == 'No traceability':
            insights.append("Implementing supply chain traceability can significantly improve transparency scores.")
        
        return insights

# Initialize the service
transparency_service = TransparencyService()

@app.errorhandler(BadRequest)
def handle_bad_request(e):
    """Handle 400 Bad Request errors"""
    return jsonify({
        'error': 'Bad Request',
        'message': str(e)
    }), 400

@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all other exceptions"""
    logger.error(f"Unexpected error: {e}")
    return jsonify({
        'error': 'Internal Server Error',
        'message': str(e)
    }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'transparency-microservice',
        'status': 'healthy',
        'version': '1.0.0'
    })

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    """Generate dynamic questions based on form data"""
    form_data = request.get_json()
    
    # Validate required fields
    if not form_data or not isinstance(form_data, dict):
        raise BadRequest("Invalid JSON data")
    
    required_fields = ['category', 'productName']
    for field in required_fields:
        if field not in form_data:
            raise BadRequest(f"Missing required field: {field}")
    
    try:
        questions = transparency_service.generate_questions(form_data)
        return jsonify({
            'success': True,
            'questions': questions,
            'count': len(questions)
        })
    except Exception as e:
        logger.error(f"Error generating questions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/transparency-score', methods=['POST'])
def calculate_transparency_score():
    """Calculate transparency score based on form data"""
    form_data = request.get_json()
    
    # Validate required fields
    if not form_data or not isinstance(form_data, dict):
        raise BadRequest("Invalid JSON data")
    
    required_fields = ['productName', 'category']
    for field in required_fields:
        if field not in form_data:
            raise BadRequest(f"Missing required field: {field}")
    
    try:
        score = transparency_service.calculate_transparency_score(form_data)
        return jsonify(score)
    except Exception as e:
        logger.error(f"Error calculating score: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/questions/templates', methods=['GET'])
def get_question_templates():
    """Get available question templates by category"""
    try:
        templates = transparency_service.question_templates
        return jsonify(templates)
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/ai/status', methods=['GET'])
def ai_status():
    """Check AI service status and configuration"""
    try:
        status = {
            'ai_enabled': AI_ENABLED,
            'service_status': 'healthy' if ai_service else 'disabled',
            'timestamp': time.time()
        }
        return jsonify(status)
    
    except Exception as e:
        logger.error(f"Error checking AI status: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 