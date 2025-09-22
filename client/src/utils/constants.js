export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CSV Cleaner Pro';
export const STRIPE_PUBLISHABLE_KEY = import.meta.env
  .VITE_STRIPE_PUBLISHABLE_KEY;

export const FILE_STATUS = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  QUEUED: 'queued',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 files per month',
      'Basic CSV processing',
      '100MB storage',
      'Email support',
    ],
    limits: {
      maxFiles: 5,
      maxFileSize: 10, // MB
      maxStorage: 100, // MB
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 15,
    features: [
      'Unlimited files',
      'Advanced processing',
      '10GB storage',
      'Priority support',
      'API access',
    ],
    limits: {
      maxFiles: Infinity,
      maxFileSize: 100, // MB
      maxStorage: 10240, // MB (10GB)
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 45,
    features: [
      'Unlimited everything',
      'All advanced features',
      '100GB storage',
      'Dedicated support',
      'Team management',
      'Custom integrations',
    ],
    limits: {
      maxFiles: Infinity,
      maxFileSize: 500, // MB
      maxStorage: 102400, // MB (100GB)
    },
  },
};

export const SUPPORTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

export const SUPPORTED_FILE_EXTENSIONS = ['.csv', '.xls', '.xlsx', '.txt'];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const PROCESSING_OPTIONS = {
  REMOVE_DUPLICATES: 'remove_duplicates',
  VALIDATE_EMAILS: 'validate_emails',
  STANDARDIZE_DATES: 'standardize_dates',
  CLEAN_PHONES: 'clean_phones',
  REMOVE_EMPTY: 'remove_empty',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  PROCESSING_FAILED: 'File processing failed. Please try again.',
  INVALID_FILE: 'Invalid file type. Please upload CSV or Excel files.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 100MB.',
  UNAUTHORIZED: 'Please login to access this feature.',
  FORBIDDEN: 'You do not have permission to perform this action.',
};

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'File uploaded successfully!',
  PROCESSING_SUCCESS: 'File processed successfully!',
  DELETE_SUCCESS: 'File deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};
