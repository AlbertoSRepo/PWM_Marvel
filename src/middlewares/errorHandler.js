// src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Log the error stack for debugging (optional in production)
    console.error(err.stack);
  
    // Set the response status code; if it's not set, default to 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;
  
    // Respond with the error message and status code
    res.status(statusCode).json({
      message: err.message || 'An unexpected error occurred',
      // Optionally include stack trace in development mode for debugging purposes
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
  };
  
  // Use ES6 export default syntax to export the middleware
  export default errorHandler;
  