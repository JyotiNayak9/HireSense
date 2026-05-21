import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required().regex(/^[A-Z][a-z]+(?: [A-Z][a-z]+)+$/i)
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
    }),

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
  
  confirmPassword : Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only" : "password and confirm password should match"
    }),

  // role: Joi.string()
  //   .valid('candidate', 'employer', 'admin')
  //   .default('candidate').required()
  //   .messages({
  //     'any.only': 'Role must be one of: candidate, employer, admin',
  //   }),

  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),

  skills: Joi.array()
    .items(Joi.string().trim())
    .default([])
    .messages({
      'array.base': 'Skills must be an array',
    }),

  education: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Education must be a string',
    }),

  experience: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Experience must be a string',
    }),
});

export const validateCreateUser = (data: unknown) => {
  return createUserSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};
