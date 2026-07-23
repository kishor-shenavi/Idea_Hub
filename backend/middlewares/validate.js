const AppError = require('../utils/AppError');

// usage: router.post('/login', validate(loginSchema), loginController)
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return next(AppError.validation(message));
  }
  req.body = { ...req.body, ...result.data }; // merge, don't replace — preserves fields the schema doesn't own (e.g. resumeText, handled separately in the controller)
  next();
};

module.exports = validate;