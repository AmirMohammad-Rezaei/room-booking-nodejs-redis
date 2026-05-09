const ApiError = require('../utils/ApiError');

/**
 * میدل‌ور سراسری مدیریت خطا
 */
module.exports = (err, req, res, next) => {
    // برخی خطاهای Mongoose ممکن است statusCode نداشته باشند
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';

    // خطای شناسه نامعتبر Mongoose
    if (err.name === 'CastError') {
        const message = `منبع با این شناسه یافت نشد`;
        error = new ApiError(404, message);
    }

    // خطای Duplicate key (مثلاً ایمیل تکراری)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `مقدار ${field} تکراری است. لطفاً مقدار دیگری انتخاب کنید`;
        error = new ApiError(400, message);
    }

    // خطای اعتبارسنجی Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        const message = `داده‌های ورودی نامعتبر: ${messages.join('. ')}`;
        error = new ApiError(400, message);
    }

    // خطای احراز هویت JWT
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'توکن نامعتبر. لطفاً دوباره وارد شوید');
    }
    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'توکن منقضی شده. لطفاً دوباره وارد شوید');
    }

    // پاسخ نهایی
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};