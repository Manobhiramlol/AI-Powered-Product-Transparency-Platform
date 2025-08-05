// AI Service for dynamic question generation and scoring
export interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  required: boolean;
  category?: string;
}

import { FormData } from './apiService';

// Simulate AI-powered question generation
export const generateFollowUpQuestions = async (formData: FormData): Promise<Question[]> => {
  const { category, productName, ingredients } = formData;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const baseQuestions: Question[] = [];
  
  // Category-specific questions
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
          id: 'preservatives',
          question: 'What preservatives, if any, are used in this product?',
          type: 'textarea',
          required: false,
          category: 'ingredients'
        },
        {
          id: 'shelf_life',
          question: 'What is the typical shelf life of this product?',
          type: 'select',
          options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year'],
          required: true,
          category: 'storage'
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
        },
        {
          id: 'packaging_material',
          question: 'What materials are used in the product packaging?',
          type: 'textarea',
          required: true,
          category: 'packaging'
        }
      );
      break;
      
    case 'Supplements & Vitamins':
      baseQuestions.push(
        {
          id: 'dosage_instructions',
          question: 'What are the recommended dosage instructions?',
          type: 'textarea',
          required: true,
          category: 'usage'
        },
        {
          id: 'third_party_testing',
          question: 'Is this product third-party tested for purity and potency?',
          type: 'select',
          options: ['Yes, by certified labs', 'Yes, internally tested', 'No testing performed', 'Unknown'],
          required: true,
          category: 'quality'
        },
        {
          id: 'contraindications',
          question: 'Are there any known contraindications or interactions?',
          type: 'textarea',
          required: true,
          category: 'safety'
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
        },
        {
          id: 'environmental_impact',
          question: 'How does your product minimize environmental impact?',
          type: 'textarea',
          required: false,
          category: 'sustainability'
        }
      );
  }
  
  // Add intelligent follow-up based on ingredients
  if (ingredients && ingredients.toLowerCase().includes('organic')) {
    baseQuestions.push({
      id: 'organic_certification',
      question: 'Please provide details about your organic certification',
      type: 'textarea',
      required: true,
      category: 'certifications'
    });
  }
  
  // Add supply chain questions for all products
  baseQuestions.push(
    {
      id: 'supplier_audits',
      question: 'How often do you audit your suppliers?',
      type: 'select',
      options: ['Monthly', 'Quarterly', 'Annually', 'As needed', 'Never'],
      required: true,
      category: 'supply_chain'
    },
    {
      id: 'traceability',
      question: 'Can you trace this product back to its raw material sources?',
      type: 'select',
      options: ['Complete traceability', 'Partial traceability', 'Limited traceability', 'No traceability'],
      required: true,
      category: 'supply_chain'
    },
    {
      id: 'social_responsibility',
      question: 'What social responsibility initiatives does your company support?',
      type: 'textarea',
      required: false,
      category: 'ethics'
    }
  );
  
  return baseQuestions;
};

// Calculate transparency score based on completeness and quality of responses
export const calculateTransparencyScore = async (formData: FormData): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let score = 0;
  let maxScore = 0;
  let completedFields = 0;
  
  // Base scoring for required fields
  const requiredFields = ['productName', 'category', 'brand', 'description', 'ingredients', 'sourcing', 'manufacturing'];
  
  requiredFields.forEach(field => {
    if (formData[field]?.toString().trim()) {
      completedFields++;
    }
  });
  
  maxScore += requiredFields.length * 10;
  
  // Score based on completeness and detail
  if (formData.description?.toString().length > 100) score += 10; // Detailed response
  else if (formData.description?.toString().length > 50) score += 8; // Moderate detail
  else if (formData.description?.toString().length > 20) score += 6; // Basic response
  else if (formData.description?.toString().trim()) score += 3; // Minimal response
  
  if (formData.ingredients?.toString().length > 100) score += 10; // Detailed response
  else if (formData.ingredients?.toString().length > 50) score += 8; // Moderate detail
  else if (formData.ingredients?.toString().length > 20) score += 6; // Basic response
  else if (formData.ingredients?.toString().trim()) score += 3; // Minimal response
  
  if (formData.sourcing?.toString().length > 100) score += 10; // Detailed response
  else if (formData.sourcing?.toString().length > 50) score += 8; // Moderate detail
  else if (formData.sourcing?.toString().length > 20) score += 6; // Basic response
  else if (formData.sourcing?.toString().trim()) score += 3; // Minimal response
  
  if (formData.manufacturing?.toString().length > 100) score += 10; // Detailed response
  else if (formData.manufacturing?.toString().length > 50) score += 8; // Moderate detail
  else if (formData.manufacturing?.toString().length > 20) score += 6; // Basic response
  else if (formData.manufacturing?.toString().trim()) score += 3; // Minimal response
  
  // Bonus points for additional transparency elements
  if (formData.certifications && formData.certifications.length > 50) {
    score += 15;
  }
  maxScore += 15;
  
  // Score dynamic questions
  Object.keys(formData).forEach(key => {
    if (!requiredFields.includes(key) && formData[key] && formData[key].toString().trim().length > 0) {
      maxScore += 5;
      if (formData[key].toString().length > 50) score += 5;
      else if (formData[key].toString().length > 20) score += 3;
      else score += 1;
    }
  });
  
  // Ensure score is between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
  
  return finalScore;
};

// Generate insights and recommendations
export const generateInsights = (formData: FormData, score: number): string[] => {
  const insights: string[] = [];
  
  if (score >= 80) {
    insights.push("Excellent transparency! Your product demonstrates high levels of openness and accountability.");
  } else if (score >= 60) {
    insights.push("Good transparency with room for improvement in some areas.");
  } else {
    insights.push("Consider providing more detailed information to improve transparency.");
  }
  
  // Category-specific insights
  if (formData.category === 'Food & Beverages') {
    if (!formData.nutritional_info) {
      insights.push("Consider adding detailed nutritional information to help consumers make informed choices.");
    }
    if (!formData.allergen_testing) {
      insights.push("Allergen testing information would enhance consumer trust and safety.");
    }
  }
  
  if (formData.category === 'Cosmetics & Personal Care') {
    if (!formData.animal_testing) {
      insights.push("Clear animal testing policies are increasingly important to consumers.");
    }
  }
  
  // General recommendations
  if (!formData.supplier_audits || formData.supplier_audits === 'Never') {
    insights.push("Regular supplier audits demonstrate commitment to quality and ethical sourcing.");
  }
  
  if (!formData.traceability || formData.traceability === 'No traceability') {
    insights.push("Implementing supply chain traceability can significantly improve transparency scores.");
  }
  
  return insights;
};