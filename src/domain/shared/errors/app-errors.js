class AppError extends Error{
    constructor(message, statusCode = 500, isOperational = true){
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode
        this.isOperational = isOperational;

        if (Error.captureStackTrace){
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

module.exports = AppError