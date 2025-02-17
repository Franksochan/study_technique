// errorHandler.js
const errorHandler = (err, req, res, next) => {
  
  // Set the response status code based on the error type
  const statusCode = err.statusCode || 500
  
  // Send a structured response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  })
}

module.exports = errorHandler
