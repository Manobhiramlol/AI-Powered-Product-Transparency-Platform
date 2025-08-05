// Microservice API Service for backend communication
export interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  required: boolean;
  category?: string;
}

export interface FormData {
  [key: string]: string;
}

export interface TransparencyScore {
  score: number;
  max_score: number;
  raw_score: number;
  insights: string[];
  timestamp: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Microservice configuration
const MICROSERVICE_URL = (import.meta as any).env?.VITE_MICROSERVICE_URL || 'http://localhost:5000';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${MICROSERVICE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Health check
export const checkMicroserviceHealth = async (): Promise<APIResponse<any>> => {
  return apiCall<APIResponse<any>>('/health');
};

// Generate dynamic questions based on form data
export const generateQuestions = async (formData: FormData): Promise<Question[]> => {
  const response = await apiCall<APIResponse<{ questions: Question[]; count: number }>>(
    '/generate-questions',
    {
      method: 'POST',
      body: JSON.stringify(formData),
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to generate questions');
  }

  return response.data?.questions || [];
};

// Calculate transparency score
export const calculateTransparencyScore = async (formData: FormData): Promise<TransparencyScore> => {
  const response = await apiCall<APIResponse<TransparencyScore>>(
    '/transparency-score',
    {
      method: 'POST',
      body: JSON.stringify(formData),
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to calculate transparency score');
  }

  return response.data!;
};

// Get question templates by category
export const getQuestionTemplates = async (): Promise<{
  templates: Record<string, Question[]>;
  categories: string[];
}> => {
  const response = await apiCall<APIResponse<{
    templates: Record<string, Question[]>;
    categories: string[];
  }>>('/questions/templates');

  if (!response.success) {
    throw new Error(response.error || 'Failed to get question templates');
  }

  return response.data!;
};

// Enhanced question generation with microservice fallback
export const generateFollowUpQuestions = async (formData: FormData): Promise<Question[]> => {
  try {
    // Try to use microservice first
    return await generateQuestions(formData);
  } catch (error) {
    console.warn('Microservice unavailable, falling back to local logic:', error);
    
    // Fallback to local logic (simplified version)
    const { category } = formData;
    const baseQuestions: Question[] = [];
    
    switch (category) {
      case 'Food & Beverages':
        baseQuestions.push(
          {
            id: 'nutritional_info',
            question: 'Please provide detailed nutritional information per serving',
            type: 'textarea',
            required: true,
            category: 'nutrition'
          },
          {
            id: 'allergen_testing',
            question: 'How do you test for and prevent cross-contamination with allergens?',
            type: 'textarea',
            required: true,
            category: 'safety'
          }
        );
        break;
        
      case 'Cosmetics & Personal Care':
        baseQuestions.push(
          {
            id: 'skin_type',
            question: 'What skin types is this product suitable for?',
            type: 'select',
            options: ['All skin types', 'Dry skin', 'Oily skin', 'Sensitive skin', 'Combination skin'],
            required: true,
            category: 'suitability'
          },
          {
            id: 'animal_testing',
            question: 'Has this product or its ingredients been tested on animals?',
            type: 'select',
            options: ['No, never tested on animals', 'Not tested by us, but suppliers may have', 'Yes, tested on animals', 'Unknown'],
            required: true,
            category: 'ethics'
          }
        );
        break;
        
      default:
        baseQuestions.push(
          {
            id: 'quality_standards',
            question: 'What quality standards does your product meet?',
            type: 'textarea',
            required: true,
            category: 'quality'
          }
        );
    }
    
    return baseQuestions;
  }
};

// Enhanced transparency score calculation with microservice fallback
export const calculateTransparencyScoreWithFallback = async (formData: FormData): Promise<number> => {
  try {
    // Try to use microservice first
    const result = await calculateTransparencyScore(formData);
    return result.score;
  } catch (error) {
    console.warn('Microservice unavailable, falling back to local logic:', error);
    
    // Fallback to local logic (simplified version)
    let score = 0;
    let maxScore = 0;
    
    const requiredFields = ['productName', 'category', 'brand', 'description', 'ingredients', 'sourcing', 'manufacturing'];
    
    requiredFields.forEach(field => {
      maxScore += 10;
      const value = formData[field];
      if (value && value.trim().length > 0) {
        if (value.length > 100) score += 10;
        else if (value.length > 50) score += 8;
        else if (value.length > 20) score += 6;
        else score += 3;
      }
    });
    
    if (formData.certifications && formData.certifications.length > 50) {
      score += 15;
    }
    maxScore += 15;
    
    return Math.min(100, Math.max(0, maxScore > 0 ? Math.round((score / maxScore) * 100) : 0));
  }
};

// Generate insights with microservice fallback
export const generateInsights = async (formData: FormData, score: number): Promise<string[]> => {
  try {
    // Try to use microservice first
    const result = await calculateTransparencyScore(formData);
    return result.insights;
  } catch (error) {
    console.warn('Microservice unavailable, falling back to local logic:', error);
    
    // Fallback to local logic
    const insights: string[] = [];
    
    if (score >= 80) {
      insights.push("Excellent transparency! Your product demonstrates high levels of openness and accountability.");
    } else if (score >= 60) {
      insights.push("Good transparency with room for improvement in some areas.");
    } else {
      insights.push("Consider providing more detailed information to improve transparency.");
    }
    
    if (formData.category === 'Food & Beverages') {
      if (!formData.nutritional_info) {
        insights.push("Consider adding detailed nutritional information to help consumers make informed choices.");
      }
    }
    
    return insights;
  }
};

// Test microservice connection
export const testMicroserviceConnection = async (): Promise<boolean> => {
  try {
    await checkMicroserviceHealth();
    return true;
  } catch (error) {
    console.warn('Microservice connection test failed:', error);
    return false;
  }
}; 