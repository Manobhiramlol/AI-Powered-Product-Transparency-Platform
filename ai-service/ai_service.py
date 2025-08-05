"""
AI Service for dynamic question generation and transparency scoring
Uses free models like Perplexity, Grok, or Claude
"""

import requests
import json
import time
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import os
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

@dataclass
class AIQuestion:
    id: str
    question: str
    type: str
    required: bool
    category: str
    options: Optional[List[str]] = None
    reasoning: Optional[str] = None

class AIService:
    """AI Service using free models for question generation and scoring"""
    
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        self.perplexity_api_key = os.environ.get('PERPLEXITY_API_KEY')
        self.claude_api_key = os.environ.get('CLAUDE_API_KEY')
        self.grok_api_key = os.environ.get('GROK_API_KEY')
        
        # Fallback to local logic if no API keys
        self.use_local_fallback = not any([self.perplexity_api_key, self.claude_api_key, self.grok_api_key])
        
        if self.use_local_fallback:
            logger.info("No AI API keys found, using local fallback logic")
        else:
            logger.info("AI API keys found, using enhanced AI features")
    
    def generate_questions_with_perplexity(self, form_data: Dict[str, str]) -> List[Dict[str, Any]]:
        """Generate questions using Perplexity API"""
        if not self.perplexity_api_key:
            logger.info("Perplexity API not configured, using local fallback")
            return self._get_fallback_questions()
        
        logger.info("Using Perplexity API for question generation")
        logger.debug(f"Input data: {form_data}")
        
        prompt = self._build_question_prompt(form_data)
        logger.debug(f"Generated prompt: {prompt}")
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'llama-3.1-sonar-small-128k-online',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are an expert in product transparency and consumer safety. Generate relevant follow-up questions based on product information.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 1000,
            'temperature': 0.7,
            'api_key': self.perplexity_api_key
        }
        
        try:
            logger.info("Sending request to Perplexity API")
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers=headers,
                json=payload,
                timeout=30
            )
            
            logger.info(f"API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                logger.debug(f"API Response: {result}")
                content = result['choices'][0]['message']['content']
                return self._parse_ai_response(content)
            else:
                logger.error(f"Perplexity API error: {response.status_code}")
                logger.error(f"Error response: {response.text}")
                raise Exception(f"API request failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Perplexity API call failed: {e}")
            raise
        
        prompt = self._build_question_prompt(form_data)
        
        headers = {
            'Authorization': f'Bearer {self.perplexity_api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'llama-3.1-sonar-small-128k-online',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are an expert in product transparency and consumer safety. Generate relevant follow-up questions based on product information.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 1000,
            'temperature': 0.7
        }
        
        try:
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                return self._parse_ai_response(content)
            else:
                logger.error(f"Perplexity API error: {response.status_code}")
                raise Exception(f"API request failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Perplexity API call failed: {e}")
            raise
    
    def generate_questions_with_claude(self, form_data: Dict[str, str]) -> List[Dict[str, Any]]:
        """Generate questions using Claude API"""
        if not self.claude_api_key:
            raise ValueError("Claude API key not configured")
        
        prompt = self._build_question_prompt(form_data)
        
        headers = {
            'x-api-key': self.claude_api_key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        payload = {
            'model': 'claude-3-haiku-20240307',
            'max_tokens': 1000,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]
        }
        
        try:
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['content'][0]['text']
                return self._parse_ai_response(content)
            else:
                logger.error(f"Claude API error: {response.status_code}")
                raise Exception(f"API request failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Claude API call failed: {e}")
            raise
    
    def calculate_score_with_ai(self, form_data: Dict[str, str]) -> Dict[str, Any]:
        """Calculate transparency score using AI"""
        prompt = self._build_scoring_prompt(form_data)
        logger.info("Using AI for scoring")
        logger.debug(f"Scoring prompt: {prompt}")
        
        try:
            # Try Perplexity first, then Claude, then local fallback
            if self.perplexity_api_key:
                return self._score_with_perplexity(prompt)
            elif self.claude_api_key:
                return self._score_with_claude(prompt)
            else:
                return self._score_with_local_logic(form_data)
        except Exception as e:
            logger.error(f"AI scoring failed: {e}")
            return self._score_with_local_logic(form_data)
    
    def _score_with_perplexity(self, prompt: str) -> Dict[str, Any]:
        """Score using Perplexity API"""
        headers = {
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'llama-3.1-sonar-small-128k-online',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are an expert in product transparency scoring. Analyze the provided information and return a JSON response with score, insights, and recommendations.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 800,
            'temperature': 0.3,
            'api_key': self.perplexity_api_key
        }
        
        try:
            logger.info("Sending scoring request to Perplexity API")
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers=headers,
                json=payload,
                timeout=30
            )
            
            logger.info(f"API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                logger.debug(f"Scoring response: {result}")
                content = result['choices'][0]['message']['content']
                return self._parse_scoring_response(content)
            else:
                logger.error(f"Perplexity scoring failed: {response.status_code}")
                logger.error(f"Error response: {response.text}")
                raise Exception(f"Scoring request failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Perplexity scoring failed: {e}")
            raise
    
    def _score_with_claude(self, prompt: str) -> Dict[str, Any]:
        """Score using Claude API"""
        headers = {
            'x-api-key': self.claude_api_key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        payload = {
            'model': 'claude-3-haiku-20240307',
            'max_tokens': 800,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]
        }
        
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['content'][0]['text']
            return self._parse_scoring_response(content)
        else:
            raise Exception(f"Claude scoring failed: {response.status_code}")
    
    def _build_question_prompt(self, form_data: Dict[str, str]) -> str:
        """Build prompt for question generation"""
        category = form_data.get('category', 'General')
        product_name = form_data.get('productName', 'Unknown Product')
        ingredients = form_data.get('ingredients', '')
        brand = form_data.get('brand', '')
        
        prompt = f"""
Generate 5-8 relevant follow-up questions for a product transparency assessment.

Product Information:
- Category: {category}
- Product Name: {product_name}
- Brand: {brand}
- Ingredients: {ingredients}

Requirements:
1. Questions should be specific to the product category
2. Include questions about safety, sourcing, certifications, and environmental impact
3. Mix of required and optional questions
4. Use appropriate question types (text, textarea, select, number)
5. For select questions, provide relevant options
6. Return JSON format with array of question objects

Question object format:
{{
  "id": "unique_identifier",
  "question": "Question text",
  "type": "text|textarea|select|number",
  "required": true|false,
  "category": "category_name",
  "options": ["option1", "option2"] // only for select type
}}

Focus on transparency, safety, and consumer trust.
"""
        return prompt
    
    def _build_scoring_prompt(self, form_data: Dict[str, str]) -> str:
        """Build prompt for transparency scoring"""
        prompt = f"""
Analyze the following product information and calculate a transparency score (0-100) with insights.

Product Data:
{json.dumps(form_data, indent=2)}

Requirements:
1. Calculate a transparency score (0-100)
2. Provide 3-5 specific insights
3. Give actionable recommendations
4. Consider completeness, detail, and trustworthiness
5. Return JSON format

Response format:
{{
  "score": 85,
  "max_score": 100,
  "raw_score": 85,
  "insights": [
    "Excellent transparency with comprehensive organic certifications",
    "Strong sustainability practices with solar-powered manufacturing",
    "Consider implementing blockchain tracking for enhanced traceability"
  ],
  "recommendations": [
    "Add more detailed supplier audit information",
    "Consider third-party verification of claims"
  ]
}}

Focus on transparency, consumer trust, and regulatory compliance.
"""
        return prompt
    
    def _parse_ai_response(self, content: str) -> List[Dict[str, Any]]:
        """Parse AI response into structured questions"""
        try:
            # Try to extract JSON from the response
            if '{' in content and '}' in content:
                start = content.find('{')
                end = content.rfind('}') + 1
                json_str = content[start:end]
                
                # Handle array format
                if json_str.startswith('['):
                    questions = json.loads(json_str)
                else:
                    # Handle single object or wrapped format
                    data = json.loads(json_str)
                    questions = data.get('questions', [data])
                
                # Validate and clean questions
                cleaned_questions = []
                for q in questions:
                    if isinstance(q, dict) and 'question' in q:
                        cleaned_q = {
                            'id': q.get('id', f'q_{len(cleaned_questions)}'),
                            'question': q.get('question', ''),
                            'type': q.get('type', 'textarea'),
                            'required': q.get('required', False),
                            'category': q.get('category', 'general'),
                            'options': q.get('options', [])
                        }
                        cleaned_questions.append(cleaned_q)
                
                return cleaned_questions
            else:
                raise ValueError("No JSON found in response")
                
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.error(f"Response content: {content}")
            return self._get_fallback_questions()
    
    def _parse_scoring_response(self, content: str) -> Dict[str, Any]:
        """Parse AI scoring response"""
        try:
            # Try to extract JSON from the response
            if '{' in content and '}' in content:
                start = content.find('{')
                end = content.rfind('}') + 1
                json_str = content[start:end]
                
                result = json.loads(json_str)
                
                return {
                    'score': result.get('score', 0),
                    'max_score': result.get('max_score', 100),
                    'raw_score': result.get('raw_score', 0),
                    'insights': result.get('insights', []),
                    'recommendations': result.get('recommendations', []),
                    'timestamp': time.time()
                }
            else:
                raise ValueError("No JSON found in response")
                
        except Exception as e:
            logger.error(f"Failed to parse scoring response: {e}")
            return self._score_with_local_logic({})
    
    def _get_fallback_questions(self) -> List[Dict[str, Any]]:
        """Get fallback questions when AI fails"""
        return [
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
        ]
    
    def _score_with_local_logic(self, form_data: Dict[str, str]) -> Dict[str, Any]:
        """Fallback scoring using local logic"""
        score = 0
        max_score = 0
        
        required_fields = ['productName', 'category', 'brand', 'description', 'ingredients', 'sourcing', 'manufacturing']
        
        for field in required_fields:
            max_score += 10
            value = form_data.get(field, '')
            if value and value.strip():
                if len(value) > 100:
                    score += 10
                elif len(value) > 50:
                    score += 8
                elif len(value) > 20:
                    score += 6
                else:
                    score += 3
        
        if form_data.get('certifications', ''):
            score += 15
        max_score += 15
        
        final_score = min(100, max(0, round((score / max_score) * 100) if max_score > 0 else 0))
        
        insights = []
        if final_score >= 80:
            insights.append("Excellent transparency! Your product demonstrates high levels of openness.")
        elif final_score >= 60:
            insights.append("Good transparency with room for improvement.")
        else:
            insights.append("Consider providing more detailed information to improve transparency.")
        
        return {
            'score': final_score,
            'max_score': max_score,
            'raw_score': score,
            'insights': insights,
            'recommendations': [],
            'timestamp': time.time()
        } 