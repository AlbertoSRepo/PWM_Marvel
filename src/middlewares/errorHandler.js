// src/middlewares/errorHandler.js
const errorHandlerMiddleware = (err, req, res, next) => {
 
  if (res.headersSent) {
      return next(err); 
  }

  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

export default errorHandlerMiddleware;