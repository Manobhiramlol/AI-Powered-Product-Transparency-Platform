# Transparency Microservice

A Flask-based microservice for generating dynamic questions and calculating transparency scores for product submissions.

## Features

- **Dynamic Question Generation**: Generate context-aware questions based on product category and details
- **Transparency Scoring**: Calculate comprehensive transparency scores with insights
- **RESTful API**: Clean, documented API endpoints
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling and validation
- **Logging**: Detailed logging for monitoring and debugging

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Generate Questions
```
POST /generate-questions
```
Generates dynamic questions based on form data.

**Request Body:**
```json
{
  "category": "Food & Beverages",
  "productName": "Organic Green Tea",
  "ingredients": "Organic green tea leaves",
  "brand": "Pure Leaf Co."
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "nutritional_info",
      "question": "Please provide detailed nutritional information per serving",
      "type": "textarea",
      "required": true,
      "category": "nutrition"
    }
  ],
  "count": 8
}
```

### Calculate Transparency Score
```
POST /transparency-score
```
Calculates transparency score based on form data.

**Request Body:**
```json
{
  "productName": "Organic Green Tea",
  "category": "Food & Beverages",
  "brand": "Pure Leaf Co.",
  "description": "Premium organic green tea sourced from sustainable farms",
  "ingredients": "Organic green tea leaves (Camellia sinensis)",
  "sourcing": "Sourced from certified organic farms in Fujian Province, China",
  "manufacturing": "Traditional steaming and drying process in solar-powered facility",
  "certifications": "USDA Organic, Fair Trade Certified, ISO 22000"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "score": 87,
    "max_score": 100,
    "raw_score": 87,
    "insights": [
      "Excellent transparency! Your product demonstrates high levels of openness and accountability.",
      "Consider implementing blockchain tracking for enhanced traceability"
    ],
    "timestamp": 1703123456.789
  }
}
```

### Get Question Templates
```
GET /questions/templates
```
Returns available question templates by category.

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Clone the repository and navigate to the microservice directory:**
```bash
cd project/microservice
```

2. **Create a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables (optional):**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run the development server:**
```bash
python app.py
```

The service will be available at `http://localhost:5000`

### Production Deployment

1. **Using Gunicorn:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. **Using Docker:**
```bash
docker build -t transparency-microservice .
docker run -p 5000:5000 transparency-microservice
```

## Configuration

### Environment Variables

- `SECRET_KEY`: Flask secret key (default: dev-secret-key)
- `FLASK_DEBUG`: Enable debug mode (default: False)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 5000)
- `CORS_ORIGINS`: Allowed CORS origins (default: *)
- `LOG_LEVEL`: Logging level (default: INFO)

### Example .env file:
```env
SECRET_KEY=your-secret-key-here
FLASK_DEBUG=True
HOST=0.0.0.0
PORT=5000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
LOG_LEVEL=INFO
```

## Integration with Frontend

### Update API Service

Update your frontend `apiService.ts` to use the microservice:

```typescript
// In apiService.ts
const MICROSERVICE_URL = 'http://localhost:5000';

export const generateQuestions = async (formData: any): Promise<Question[]> => {
  const response = await fetch(`${MICROSERVICE_URL}/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate questions');
  }
  
  return data.questions;
};

export const calculateTransparencyScore = async (formData: any): Promise<TransparencyScore> => {
  const response = await fetch(`${MICROSERVICE_URL}/transparency-score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to calculate score');
  }
  
  return data.result;
};
```

## Testing

### Manual Testing with curl

1. **Health Check:**
```bash
curl http://localhost:5000/health
```

2. **Generate Questions:**
```bash
curl -X POST http://localhost:5000/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Food & Beverages",
    "productName": "Organic Green Tea",
    "ingredients": "Organic green tea leaves"
  }'
```

3. **Calculate Transparency Score:**
```bash
curl -X POST http://localhost:5000/transparency-score \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Organic Green Tea",
    "category": "Food & Beverages",
    "description": "Premium organic green tea",
    "ingredients": "Organic green tea leaves",
    "sourcing": "Certified organic farms",
    "manufacturing": "Traditional process",
    "certifications": "USDA Organic"
  }'
```

## Architecture

### File Structure
```
microservice/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── models.py           # Data models
├── utils.py            # Utility functions
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── .env.example       # Environment variables template
```

### Key Components

1. **TransparencyService**: Core business logic for question generation and scoring
2. **Data Models**: Structured data classes for API requests/responses
3. **Utility Functions**: Helper functions for validation and formatting
4. **Configuration**: Environment-based configuration management

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **500 Internal Server Error**: Server-side errors
- **Standardized Error Responses**: Consistent error format

## Monitoring and Logging

- Request/response logging
- Error tracking
- Performance monitoring
- Health check endpoint

## Security Considerations

- Input sanitization
- CORS configuration
- Environment variable management
- Error message sanitization

## Future Enhancements

- Database integration for persistent storage
- Authentication and authorization
- Rate limiting
- Caching layer
- Metrics and monitoring
- API versioning
- WebSocket support for real-time updates 