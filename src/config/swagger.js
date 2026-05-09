const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'سیستم رزرواسیون اتاق',
      version: '1.0.0',
      description: 'مستندات API برای رزرو اتاق با قفل توزیع‌شده (Redis)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'سرور توسعه',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [], // در بعضی مسیرها override می‌شود
  },
  apis: ['./src/routes/*.js'], // کامنت‌ها از فایل‌های route خوانده می‌شوند
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;