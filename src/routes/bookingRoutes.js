const router = require('express').Router()
const Joi = require('joi')
const auth = require('../middleware/auth')
const rateLimiter = require('../middleware/rateLimiter')
const validate = require('../middleware/validate')
const bookingcontroller = require('../controllers/bookingController')

router.use(auth)

const lockUnlockSchema = Joi.object({
    roomId: Joi.string().required().hex().length(24)
})

const createBookingSchema = Joi.object({
    roomId: Joi.string().required().hex().length(24),
    checkIn: Joi.date().iso().required(),
    checkOut: Joi.date().iso().required().greater(Joi.ref('checkIn'))
})

// محدودیت نرخ ویژه برای قفل (مثلاً ۵ درخواست در دقیقه) 


/**
 * @swagger
 * /api/bookings/lock:
 *   post:
 *     summary: قفل کردن اتاق برای رزرو
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *             properties:
 *               roomId:
 *                 type: string
 *                 description: شناسه‌ی ۲۴ کاراکتری اتاق
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: قفل با موفقیت گرفته شد
 *       409:
 *         description: اتاق قبلاً قفل شده است
 */
router.post('/lock', rateLimiter(5, 60), validate(lockUnlockSchema), bookingcontroller.lockRoom);

/**
 * @swagger
 * /api/bookings/lock:
 *   delete:
 *     summary: آزاد کردن قفل اتاق (توسط مالک قفل)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *             properties:
 *               roomId:
 *                 type: string
 *                 description: شناسه اتاق
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: قفل آزاد شد
 *       401:
 *         description: احراز هویت ناموفق
 */
router.delete("/lock", rateLimiter(10, 60), validate(lockUnlockSchema), bookingcontroller.unLockRoom)


/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: ثبت رزرو نهایی (باید قفل را در دست داشته باشد)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - checkIn
 *               - checkOut
 *             properties:
 *               roomId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               checkIn:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-01"
 *               checkOut:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-04"
 *     responses:
 *       201:
 *         description: رزرو با موفقیت ثبت شد
 *       400:
 *         description: اتاق قفل نشده یا پارامترهای نامعتبر
 *       403:
 *         description: مالک قفل نیستید
 *       409:
 *         description: تداخل زمانی با رزرو دیگر
 */
router.post("/", validate(createBookingSchema), bookingcontroller.createBooking)


/**
 * @swagger
 * /api/bookings/me:
 *   get:
 *     summary: تاریخچه رزروهای کاربر جاری
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: آرایه‌ای از رزروهای کاربر (با اطلاعات خلاصه اتاق)
 *       401:
 *         description: احراز هویت ناموفق
 */
router.get("/me", bookingcontroller.getMyBookings)
module.exports = router