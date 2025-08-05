# Product Transparency Platform

A comprehensive platform for evaluating and scoring product transparency across various categories. This full-stack application helps businesses showcase their product transparency and enables consumers to make informed purchasing decisions.

## 🚀 Features

### Frontend (React + TypeScript + Vite)
- Modern, responsive UI built with React and Tailwind CSS
- Interactive dashboard for managing product submissions
- Detailed transparency reports with visualizations
- PDF report generation
- User authentication and role-based access control

### Backend (Node.js + Express + PostgreSQL)
- RESTful API for product and user management
- JWT-based authentication
- File upload handling
- Database migrations and seeding
- Comprehensive error handling and logging

### AI Service (Python + Flask)
- Dynamic question generation based on product category
- Intelligent transparency scoring algorithm
- Context-aware response analysis
- PDF report generation with insights

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.8+)
- PostgreSQL (v13+)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3001
   DATABASE_URL=postgres://user:password@localhost:5432/transparency_db
   JWT_SECRET=your_jwt_secret
   UPLOAD_DIR=./uploads
   ```
4. Run database migrations:
   ```bash
   npm run migrate
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:3001
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### AI Service Setup
1. Navigate to the ai-service directory:
   ```bash
   cd ai-service
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the AI service:
   ```bash
   python app.py
   ```

## 📋 Sample Product Entry

```json
{
  "productName": "Organic Green Tea",
  "brand": "Pure Leaf Co.",
  "category": "Food & Beverages",
  "description": "Premium organic green tea leaves",
  "ingredients": "Organic green tea leaves, natural flavors",
  "manufacturingProcess": "Sustainably sourced and carefully processed",
  "sustainabilityPractices": ["Organic certified", "Eco-friendly packaging"]
}
```

## 📊 Example Report

### Transparency Score: 88/100 (Excellent Transparency)

#### Key Insights:
- **Ingredients**: 95% - Complete disclosure of all ingredients
- **Manufacturing**: 85% - Detailed production process provided
- **Sustainability**: 92% - Strong environmental practices
- **Social Responsibility**: 80% - Good labor practices, room for improvement in community impact

## 🤖 AI Service Documentation

The AI service provides intelligent analysis of product information to generate dynamic questions and calculate transparency scores.

### Endpoints

#### Health Check
```
GET /health
```

#### Generate Questions
```
POST /generate-questions
```
Request Body:
```json
{
  "category": "Food & Beverages",
  "productName": "Organic Green Tea"
}
```

#### Calculate Score
```
POST /calculate-score
```
Request Body:
```json
{
  "responses": [
    {"questionId": "ingredients", "answer": "Organic green tea leaves"},
    {"questionId": "manufacturing", "answer": "Sustainably sourced"}
  ]
}
```

## 🤔 Reflection

### AI in Development
AI tools were instrumental in several aspects of this project. The AI service leverages natural language processing to generate context-aware questions based on product categories. For instance, it can ask specific questions about food ingredients for food products or manufacturing processes for electronics. The scoring algorithm uses weighted factors to evaluate transparency across multiple dimensions, providing a comprehensive assessment.

### Design Principles
1. **Modularity**: The application follows a clear separation of concerns with distinct frontend, backend, and AI service layers.
2. **Scalability**: The microservices architecture allows independent scaling of components.
3. **User-Centric Design**: The UI prioritizes clarity and ease of use, with visual indicators for transparency scores.
4. **Data Integrity**: Comprehensive validation and error handling ensure data consistency.
5. **Performance**: Optimized database queries and efficient state management ensure responsive performance.

The transparency scoring logic is designed to be fair and comprehensive, considering multiple factors like ingredient disclosure, manufacturing processes, and sustainability practices. The system is built to be extensible, allowing for additional metrics and scoring dimensions as the platform evolves.
