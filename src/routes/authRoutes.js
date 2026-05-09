const router = require('express').Router()
const Joi = require('joi');
const authController = require('../controllers/authController')
const validate = require('../middleware/validate');
const { default: rateLimit } = require('express-rate-limit');
const rateLimiter = require('../middleware/rateLimiter');


// اسکیمای اعتبارسنجی
const registerSchema = Joi.object({
    name: Joi.string().trim().required().min(2),
    email: Joi.string().email().required(),
    phone: Joi.string().trim().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});




/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: ثبت‌نام کاربر جدید
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: علی رضایی
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ali@example.com
 *               phone:
 *                 type: string
 *                 example: "09121112233"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: ثبت‌نام موفق
 *       400:
 *         description: خطای اعتبارسنجی یا ایمیل تکراری
 */


router.post('/register', rateLimiter(10, 60), validate(registerSchema), authController.register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: ورود کاربر
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: ورود موفق و دریافت توکن JWT
 *       401:
 *         description: ایمیل یا رمز عبور نادرست
 */ 
router.post("/login", rateLimiter(10, 60), validate(loginSchema), authController.login)


module.exports = router