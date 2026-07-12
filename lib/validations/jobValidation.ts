import Joi from 'joi';

export const createJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Job title is required',
    'string.min': 'Job title must be at least 3 characters',
    'string.max': 'Job title cannot exceed 100 characters',
  }),
  jobType: Joi.string()
    .valid('Full-time', 'Part-time', 'Remote', 'Internship')
    .required()
    .messages({
      'any.only': 'Please select a valid job type',
      'string.empty': 'Job type is required',
    }),
  location: Joi.string().trim().required().messages({
    'string.empty': 'Location is required',
  }),
  salaryRange: Joi.string().trim().allow('', null).max(100).messages({
    'string.max': 'Salary range cannot exceed 100 characters',
  }),
  deadline: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Deadline must be a valid date',
    'date.greater': 'Deadline must be a future date',
    'any.required': 'Deadline is required',
  }),
  description: Joi.string().trim().min(20).max(3000).required().messages({
    'string.empty': 'Job description is required',
    'string.min': 'Job description must be at least 20 characters',
    'string.max': 'Job description cannot exceed 3000 characters',
  }),
  requiredSkills: Joi.array().items(Joi.string().trim().required()).min(1).required().messages({
    'array.min': 'Please add at least one required skill',
    'any.required': 'Required skills are required',
  }),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Job title is required',
    'string.min': 'Job title must be at least 3 characters',
    'string.max': 'Job title cannot exceed 100 characters',
  }),
  jobType: Joi.string()
    .valid('Full-time', 'Part-time', 'Remote', 'Internship')
    .required()
    .messages({
      'any.only': 'Please select a valid job type',
      'string.empty': 'Job type is required',
    }),
  location: Joi.string().trim().required().messages({
    'string.empty': 'Location is required',
  }),
  salaryRange: Joi.string().trim().allow('', null).max(100).messages({
    'string.max': 'Salary range cannot exceed 100 characters',
  }),
  deadline: Joi.date().iso().required().messages({
    'date.base': 'Deadline must be a valid date',
    'any.required': 'Deadline is required',
  }),
  description: Joi.string().trim().min(20).max(3000).required().messages({
    'string.empty': 'Job description is required',
    'string.min': 'Job description must be at least 20 characters',
  }),
  requiredSkills: Joi.array().items(Joi.string().trim().required()).min(1).required().messages({
    'array.min': 'Please add at least one required skill',
    'any.required': 'Required skills are required',
  }),
});
