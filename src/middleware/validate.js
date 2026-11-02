const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false, 
      stripUnknown: true 
    });
    if (error) {
      const details = error.details.map(err => ({
        message: err.message,
        path: err.path
      }));
      return res.status(400).json({ details });
    }
    req[property] = value;
    next();
  };
};
module.exports = validate;
