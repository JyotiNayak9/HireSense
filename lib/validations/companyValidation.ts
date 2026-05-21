import Joi from 'joi';

export const companyIndustries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Entertainment',
  'Energy',
  'Telecommunications',
  'Other',
] as const;

export const createCompanySchema = Joi.object({


  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
    }),

  confirmPassword: Joi.string().equal(Joi.ref('password')).required().messages({
    'any.only': 'Password and confirm password should match',
  }),

  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),

  companyName: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required()
    .messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 2 characters',
      'string.max': 'Company name cannot exceed 150 characters',
    }),

  location: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Location is required',
    }),

  industry: Joi.string()
    .valid(...companyIndustries)
    .required()
    .messages({
      'any.only': 'Please select a valid industry',
      'string.empty': 'Industry is required',
    }),

  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters',
    }),
});

export const validateCreateCompany = (data: unknown) => {
  return createCompanySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};
