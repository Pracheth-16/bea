export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Enterprise Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

