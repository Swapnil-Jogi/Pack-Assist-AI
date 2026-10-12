const Joi = require('joi');

/**
 * ============================================================================
 * JOI VALIDATION SCHEMAS
 * ============================================================================
 */

// 1. User Registration Schema
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Full Name is required.',
    'string.min': 'Full Name must be at least 2 characters long.',
    'string.max': 'Full Name cannot exceed 100 characters.',
    'any.required': 'Full Name is required.',
  }),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email address is required.',
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email address is required.',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password must be at least 6 characters long.',
    'string.max': 'Password cannot exceed 128 characters.',
    'any.required': 'Password is required.',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'string.empty': 'Please confirm your password.',
    'any.only': 'Passwords do not match.',
    'any.required': 'Please confirm your password.',
  }),
  company: Joi.string().trim().max(150).allow('', null).default('Food Tech Innovations').messages({
    'string.max': 'Company name cannot exceed 150 characters.',
  }),
  role: Joi.string().valid(
    'Packaging Technologist',
    'Food Scientist',
    'QA Director',
    'Operations Manager',
    'Researcher'
  ).default('Packaging Technologist').messages({
    'any.only': 'Please select a valid specialization role from the list.',
  }),
});

// 2. User Login Schema
const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.',
  }),
});

// 3. Packaging Recommendation Assessment Schema (Web & API)
const recommendationSchema = Joi.object({
  commodity_name: Joi.string().trim().min(2).max(120).required().messages({
    'string.empty': 'Commodity / Food name is required.',
    'string.min': 'Commodity name must be at least 2 characters long.',
    'string.max': 'Commodity name cannot exceed 120 characters.',
    'any.required': 'Commodity / Food name is required.',
  }),
  commodity_type: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Commodity class / type is required.',
    'string.min': 'Commodity class must be at least 2 characters long.',
    'string.max': 'Commodity class cannot exceed 100 characters.',
    'any.required': 'Commodity class / type is required.',
  }),
  moisture_content: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Moisture content must be a valid number between 0% and 100%.',
    'number.min': 'Moisture content cannot be negative (min: 0%).',
    'number.max': 'Moisture content cannot exceed 100%.',
    'any.required': 'Moisture content is required.',
  }),
  fat_content: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Fat / Lipid content must be a valid number between 0% and 100%.',
    'number.min': 'Fat content cannot be negative (min: 0%).',
    'number.max': 'Fat content cannot exceed 100%.',
    'any.required': 'Fat content is required.',
  }),
  ph: Joi.number().min(0).max(14).required().messages({
    'number.base': 'Acidity / pH must be a valid number on the standard 0 to 14 scale.',
    'number.min': 'pH cannot be lower than 0.0.',
    'number.max': 'pH cannot be greater than 14.0.',
    'any.required': 'pH level is required.',
  }),
  respiration_rate: Joi.string().valid(
    'None',
    'Low',
    'Medium',
    'Moderate',
    'High',
    'Very High'
  ).required().messages({
    'string.empty': 'Respiration rate is required.',
    'any.only': 'Respiration rate must be one of: None, Low, Medium, High, or Very High.',
    'any.required': 'Respiration rate is required.',
  }),
  shelf_life_days: Joi.number().integer().min(1).max(3650).required().messages({
    'number.base': 'Desired shelf life must be a whole number of days.',
    'number.integer': 'Desired shelf life must be an integer.',
    'number.min': 'Desired shelf life must be at least 1 day.',
    'number.max': 'Desired shelf life cannot exceed 3,650 days (10 years).',
    'any.required': 'Desired shelf life is required.',
  }),
  storage_temp: Joi.number().min(-50).max(60).required().messages({
    'number.base': 'Storage temperature must be a valid number in °C.',
    'number.min': 'Storage temperature cannot be lower than -50°C.',
    'number.max': 'Storage temperature cannot exceed 60°C.',
    'any.required': 'Storage temperature is required.',
  }),
  humidity: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Ambient relative humidity must be a valid percentage between 0% and 100%.',
    'number.min': 'Relative humidity cannot be negative.',
    'number.max': 'Relative humidity cannot exceed 100%.',
    'any.required': 'Relative humidity is required.',
  }),
  storage_type: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Storage condition is required.',
    'any.required': 'Storage condition is required.',
  }),
  transport_conditions: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Logistics & transport condition is required.',
    'any.required': 'Logistics & transport condition is required.',
  }),
  packaging_type: Joi.string().trim().max(100).default('Stand-Up Pouch (Doypack)'),
  packaging_size: Joi.string().trim().max(100).default('Retail Standard (250g - 500g)'),
  map_required: Joi.string().valid('Yes', 'No', 'Auto').default('Yes').messages({
    'any.only': 'MAP selection must be Yes, No, or Auto.',
  }),
});

// 4. API Token Request Schema
const apiTokenSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email address is required.',
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email address is required.',
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.',
  }),
});

/**
 * ============================================================================
 * VALIDATION MIDDLEWARE HANDLERS
 * ============================================================================
 */

// Helper to format Joi validation errors into clean messages
const formatJoiError = (error) => {
  return error.details.map((d) => d.message.replace(/['"]/g, '')).join(' ');
};

// Web Form: Validate Registration
const validateRegister = (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMsg = formatJoiError(error);
    req.flash('error_msg', errorMsg);
    return res.redirect('/register');
  }

  req.body = value;
  next();
};

// Web Form: Validate Login
const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMsg = formatJoiError(error);
    req.flash('error_msg', errorMsg);
    return res.redirect('/login');
  }

  req.body = value;
  next();
};

// Web Form: Validate Packaging Assessment
const validateRecommendation = (req, res, next) => {
  const { error, value } = recommendationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMsg = formatJoiError(error);
    req.flash('error_msg', errorMsg);
    return res.redirect('/recommend');
  }

  req.body = value;
  next();
};

// API: Validate Recommendation (Returns JSON 400 Bad Request)
const validateApiRecommendation = (req, res, next) => {
  const { error, value } = recommendationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: Invalid input payload',
      details: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      })),
    });
  }

  req.body = value;
  next();
};

// API: Validate Auth Token Request (Returns JSON 400 Bad Request)
const validateApiToken = (req, res, next) => {
  const { error, value } = apiTokenSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: Invalid email or password format',
      details: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      })),
    });
  }

  req.body = value;
  next();
};

// Validate ID Parameter (ObjectId or Mock ID)
const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const isMockId = /^rec_[0-9]+_[0-9]+$/.test(id);

  if (!id || (!isMongoId && !isMockId)) {
    if (req.xhr || req.originalUrl.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid identifier format: must be a 24-character hexadecimal string',
      });
    }
    req.flash('error_msg', 'Invalid assessment identifier provided.');
    return res.redirect('/dashboard');
  }

  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  recommendationSchema,
  apiTokenSchema,
  validateRegister,
  validateLogin,
  validateRecommendation,
  validateApiRecommendation,
  validateApiToken,
  validateIdParam,
};
