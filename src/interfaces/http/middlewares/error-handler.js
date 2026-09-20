module.exports = function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ message: "Internal server error" });
};
