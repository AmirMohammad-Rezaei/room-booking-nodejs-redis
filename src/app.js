const express = require('express');
const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

//swagger 
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// میدل‌ورهای امنیتی
app.use(helmet()); // تنظیم هدرهای امنیتی
// app.use(mongoSanitize()); // جلوگیری از NoSQL Injection

// CORS
app.use(cors());

// تجزیه JSON
app.use(express.json());

// مسیرهای API
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);



// مسیر مستندات Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// همچنین می‌توانید فایل JSON خام مستندات را هم در اختیار بگذارید
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});



// مدیریت مسیرهای نامعتبر (بدون مسیر wildcard)
app.use((req, res, next) => {
  next(new ApiError(404, `مسیر ${req.originalUrl} یافت نشد`));
});

app.use(errorHandler);

module.exports = app;