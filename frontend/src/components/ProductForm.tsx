import React, { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { 
  generateFollowUpQuestions, 
  calculateTransparencyScore,
  generateInsights
} from '../services/aiService';
import { saveProductSubmission, FormData as ApiFormData } from '../services/apiService';
import type { User } from '../services/apiService';
import toast from 'react-hot-toast';

type Question = {
  id: string;
  question: string;
  type: Exclude<import('../services/aiService').Question['type'], 'number'>;
  options?: string[];
  required: boolean;
  category?: string;
};

interface FormData {
  [key: string]: string | number | string[] | Record<string, string>;
  productName: string;
  category: string;
  brand: string;
  description: string;
  ingredients: string;
  sourcing: string;
  manufacturing: string;
  certifications: string;
  dynamicResponses: Record<string, string>;
  insights: string[];
  transparencyScore: number;
  submittedAt: string;
  status: 'pending' | 'completed';
}

interface ProductFormProps {
  currentUser: User | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ currentUser }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    category: '',
    brand: '',
    description: '',
    ingredients: '',
    sourcing: '',
    manufacturing: '',
    certifications: '',
    dynamicResponses: {} as Record<string, string>,
    insights: [] as string[],
    transparencyScore: 0,
    submittedAt: '',
    status: 'pending'
  });
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const initialSteps = [
    {
      title: 'Basic Information',
      fields: [
        { name: 'productName', label: 'Product Name', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'select', required: true },
        { name: 'brand', label: 'Brand', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true }
      ]
    },
    {
      title: 'Product Details',
      fields: [
        { name: 'ingredients', label: 'Ingredients', type: 'textarea', required: true },
        { name: 'sourcing', label: 'Sourcing Information', type: 'textarea', required: true }
      ]
    },
    {
      title: 'Manufacturing & Certifications',
      fields: [
        { name: 'manufacturing', label: 'Manufacturing Process', type: 'textarea', required: true },
        { name: 'certifications', label: 'Certifications', type: 'textarea', required: true }
      ]
    }
  ];

  const categories = [
    'Food & Beverages',
    'Cosmetics & Personal Care',
    'Supplements & Vitamins',
    'Household Products',
    'Textiles & Clothing',
    'Electronics',
    'Other'
  ];

  const fieldLabels: { [key: string]: string } = {
    productName: 'Product Name',
    category: 'Category',
    brand: 'Brand',
    description: 'Description',
    ingredients: 'Ingredients',
    sourcing: 'Sourcing Information',
    manufacturing: 'Manufacturing Process',
    certifications: 'Certifications'
  };

  useEffect(() => {
    if (currentStep === initialSteps.length - 1 && formData.category && formData.productName) {
      generateDynamicQuestions();
    }
  }, [currentStep, formData.category, formData.productName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dynamic_')) {
      const questionId = name.replace('dynamic_', '');
      setFormData(prev => ({
        ...prev,
        dynamicResponses: {
          ...prev.dynamicResponses,
          [questionId]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateDynamicQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const questions = await generateFollowUpQuestions(formData);
      const filteredQuestions = questions.filter(q => q.type !== 'number') as Question[];
      setDynamicQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error generating dynamic questions:', error);
      toast.error('Failed to generate follow-up questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step >= initialSteps.length) {
      // Validate dynamic questions
      return dynamicQuestions.every(q => {
        if (q.required) {
          return formData.dynamicResponses[q.id] && formData.dynamicResponses[q.id].trim() !== '';
        }
        return true;
      });
    }
    
    const requiredFields = initialSteps[step].fields.filter(f => f.required).map(f => f.name);
    return requiredFields.every(field => {
      const value = formData[field];
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return false;
    });
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('Please sign in to submit a product');
      return;
    }

    setIsSubmitting(true);
    try {
      const score = await calculateTransparencyScore(formData);
      const generatedInsights = generateInsights(formData, score);
      
      const updatedFormData = {
        ...formData,
        transparencyScore: score,
        insights: generatedInsights,
        submittedAt: new Date().toISOString(),
        status: 'completed' as const
      };
      
      setFormData(updatedFormData);
      setInsights(generatedInsights);
      
      await saveProductSubmission(updatedFormData as ApiFormData);
      setIsSubmitted(true);
      toast.success('Product submission saved successfully!');
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Failed to save product submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (fieldName: string) => {
    const value = formData[fieldName] || '';
    const label = fieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1');

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {fieldName === 'category' ? (
          <select
            name={fieldName}
            value={value as string}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        ) : ['description', 'ingredients', 'sourcing', 'manufacturing', 'certifications'].includes(fieldName) ? (
          <textarea
            name={fieldName}
            value={value as string}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder={`Enter ${label.toLowerCase()}...`}
            required
          />
        ) : (
          <input
            type="text"
            name={fieldName}
            value={value as string}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder={`Enter ${label.toLowerCase()}...`}
            required
          />
        )}
      </div>
    );
  };

  const renderDynamicQuestion = (question: Question) => {
    const value = formData.dynamicResponses[question.id] || '';

    return (
      <div key={question.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          {question.question}
          {question.required && <span className="text-red-500">*</span>}
        </label>
        
        {question.type === 'textarea' ? (
          <textarea
            name={`dynamic_${question.id}`}
            value={value}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            required={question.required}
          />
        ) : question.type === 'select' ? (
          <select
            name={`dynamic_${question.id}`}
            value={value}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            name={`dynamic_${question.id}`}
            value={value}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          />
        )}
      </div>
    );
  };

  const totalSteps = initialSteps.length + (dynamicQuestions.length > 0 ? 1 : 0);
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Show success screen after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Transparency Submission</h1>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-green-600">✓</span>
                  <span className="ml-2">Form submitted successfully!</span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Start New Submission
                </button>
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Transparency Score</h2>
                <div className="text-2xl font-bold text-blue-600">{formData.transparencyScore}%</div>
                <div className="mt-2">
                  {insights.map((insight, index) => (
                    <div key={index} className="mt-2">
                      <CheckCircle className="w-5 h-5 text-green-500 inline-block mr-2" />
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Transparency Submission</h1>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep < initialSteps.length ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {initialSteps[currentStep].title}
              </h2>
              <div className="space-y-6">
                {initialSteps[currentStep].fields.map(field => (
                  <div key={field.name}>
                    {renderField(field.name)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI-Generated Questions
              </h2>
              {isGeneratingQuestions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">AI is analyzing your product and generating personalized questions...</p>
                  <p className="text-sm text-gray-500 mt-2">This helps us create a more comprehensive transparency report.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dynamicQuestions.map(renderDynamicQuestion)}
                </div>
              )}
            </>
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                disabled={!validateStep(currentStep) || isGeneratingQuestions}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isGeneratingQuestions || !validateStep(currentStep)}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generate Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
