// API Service for backend communication
export interface FormData {
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
  [key: string]: string | string[] | number | Record<string, string>;
}

export interface ProductSubmission {
  id: string;
  productName: string;
  brand: string;
  category: string;
  description: string;
  ingredients: string;
  sourcing: string;
  manufacturing: string;
  certifications: string;
  transparencyScore: number;
  submittedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dynamicResponses: Record<string, string>;
  insights: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Mock data for demonstration
import { PDFDocument, rgb } from 'pdf-lib';

const mockSubmissions: ProductSubmission[] = [
  {
    id: '1',
    productName: 'Organic Green Tea',
    brand: 'PureLeaf',
    category: 'Food & Beverages',
    description: 'Premium organic green tea leaves',
    ingredients: 'Organic green tea leaves',
    sourcing: 'Sourced from certified organic farms',
    manufacturing: 'Traditional Japanese processing',
    certifications: 'USDA Organic, Non-GMO',
    transparencyScore: 95,
    submittedAt: new Date().toISOString(),
    status: 'completed',
    dynamicResponses: {
      organic: 'Yes, all ingredients are certified organic',
      manufacturingProcess: 'Traditional Japanese processing methods used'
    },
    insights: [
      'High transparency score due to organic certification',
      'Detailed manufacturing process provided',
      'Clear sourcing information'
    ]
  },
  {
    id: '2',
    productName: 'Natural Face Moisturizer',
    brand: 'GlowSkin',
    category: 'Cosmetics & Personal Care',
    description: 'Hydrating face moisturizer with natural botanical extracts',
    ingredients: 'Aloe vera, jojoba oil, vitamin E, natural preservatives',
    sourcing: 'Botanical ingredients sourced from certified suppliers globally',
    manufacturing: 'GMP-certified facility with cruelty-free practices',
    certifications: 'Leaping Bunny Certified, Organic Certification Pending',
    transparencyScore: 74,
    submittedAt: '2024-01-12T14:15:00Z',
    status: 'completed',
    dynamicResponses: {},
    insights: []
  }
];

export const saveProductSubmission = async (formData: FormData): Promise<void> => {
  try {
    // Validate required fields
    const requiredFields = ['productName', 'category', 'brand', 'description', 'ingredients', 'sourcing', 'manufacturing', 'certifications'];
    const missingFields = requiredFields.filter(field => !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === ''));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate dynamic responses
    if (Object.keys(formData.dynamicResponses).length === 0) {
      throw new Error('No dynamic questions answered');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create submission object
    const submission: ProductSubmission = {
      id: Date.now().toString(),
      productName: formData.productName,
      brand: formData.brand,
      category: formData.category,
      description: formData.description,
      ingredients: formData.ingredients,
      sourcing: formData.sourcing,
      manufacturing: formData.manufacturing,
      certifications: formData.certifications,
      transparencyScore: formData.transparencyScore || 0,
      submittedAt: new Date().toISOString(),
      status: formData.status || 'pending',
      dynamicResponses: formData.dynamicResponses || {},
      insights: formData.insights || []
    };
    
    // Add to mock submissions
    mockSubmissions.push(submission);
    
    // Simulate successful response
    return Promise.resolve();
  } catch (error) {
    throw new Error('Failed to save product submission');
  }
};

// Mock authentication functions
export const login = async (email: string, password: string): Promise<User> => {
  if (email === 'demo@altibbe.com' && password === 'demo123') {
    return {
      id: '1',
      email,
      name: 'Demo User',
      company: 'Altibbe Demo',
      role: 'user',
      createdAt: new Date().toISOString()
    };
  }
  throw new Error('Invalid credentials');
};

export const register = async (email: string, password: string, company: string, name: string): Promise<User> => {
  if (email && password && company && name) {
    return {
      id: Date.now().toString(),
      email,
      name,
      company,
      role: 'user',
      createdAt: new Date().toISOString()
    };
  }
  throw new Error('Registration failed');
};

export const getProductSubmissions = async (): Promise<ProductSubmission[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockSubmissions];
};

export const getProductSubmission = async (id: string): Promise<ProductSubmission | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockSubmissions.find(submission => submission.id === id) || null;
};

export const generatePDFReport = async (id: string): Promise<Blob> => {
  try {
    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid submission ID');
    }

    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const submission = await getProductSubmission(id);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Validate submission data
    if (!submission.productName || !submission.transparencyScore) {
      throw new Error('Incomplete submission data');
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Set font size and colors
    const fontSize = 12;
    const titleFontSize = 24;
    const sectionFontSize = 16;

    // Add title
    page.drawText('Product Transparency Report', {
      x: 50,
      y: height - 50,
      size: titleFontSize,
      color: rgb(0, 0, 0)
    });

    // Add product details section
    const detailsY = height - 100;
    page.drawText('Product Details:', {
      x: 50,
      y: detailsY,
      size: sectionFontSize,
      color: rgb(0, 0, 0)
    });

    // Add product information
    const infoY = detailsY - 30;
    const infoText = `
      Name: ${submission.productName}
      Brand: ${submission.brand}
      Category: ${submission.category}
      Score: ${submission.transparencyScore}%
      Status: ${submission.status}
      Submitted At: ${new Date(submission.submittedAt).toLocaleString()}
    `;
    page.drawText(infoText, {
      x: 50,
      y: infoY,
      size: fontSize,
      color: rgb(0, 0, 0)
    });

    // Add line separator
    page.drawLine({
      start: { x: 50, y: infoY - 60 },
      end: { x: width - 50, y: infoY - 60 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Add insights section
    const insightsY = infoY - 80;
    page.drawText('Insights:', {
      x: 50,
      y: insightsY,
      size: sectionFontSize,
      color: rgb(0, 0, 0)
    });

    // Add insights text
    const insightsText = submission.insights?.join('\n\n') || 'No insights available';
    page.drawText(insightsText, {
      x: 50,
      y: insightsY - 30,
      size: fontSize,
      color: rgb(0, 0, 0)
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Create Blob
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error instanceof Error ? error : new Error('Failed to generate PDF');
  }
};

// Mock data for authentication
const mockUsers: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    company: 'Altibbe',
    createdAt: new Date().toISOString()
  }
];

// Authentication service
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would authenticate with the backend
      const user = mockUsers.find(user => user.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Clear any existing auth state
      localStorage.removeItem('authState');
      
      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error instanceof Error ? error : new Error('Authentication failed');
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Clear auth state
      localStorage.removeItem('authState');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Logout error:', error);
      throw error instanceof Error ? error : new Error('Logout failed');
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Check if we have an auth state
      const authState = localStorage.getItem('authState');
      if (!authState) {
        return null;
      }

      // Parse the auth state
      const user = JSON.parse(authState);
      
      // Verify the user exists in our mock data
      const validUser = mockUsers.find(u => u.id === user.id);
      if (!validUser) {
        return null;
      }

      // Return the valid user
      return validUser;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error instanceof Error ? error : new Error('Failed to get current user');
    }
  },

  register: async (email: string, password: string, company: string): Promise<User> => {
    try {
      // Validate input
      if (!email || !password || !company) {
        throw new Error('All fields are required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would create a new user in the database
      const existingUser = mockUsers.find(user => user.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      return {
        id: Date.now().toString(),
        email: email,
        name: 'New User',
        company: company,
        role: 'user',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  }
};;