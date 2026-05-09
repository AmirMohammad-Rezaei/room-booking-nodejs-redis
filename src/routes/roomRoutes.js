const router = require('express').Router()
const roomController = require('../controllers/roomController')





/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: دریافت لیست اتاق‌های موجود
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: فیلتر بر اساس شهر (مثلاً تهران)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: حداقل قیمت هر شب
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: حداکثر قیمت هر شب
 *     responses:
 *       200:
 *         description: لیست اتاق‌ها به همراه finalPricePerNight و امکانات
 */
router.get('/', roomController.getAllRooms);


/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: دریافت اطلاعات کامل یک اتاق
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: شناسه ۲۴ کاراکتری اتاق
 *     responses:
 *       200:
 *         description: اطلاعات اتاق به‌همراه وضعیت قفل (isLocked)
 *       404:
 *         description: اتاق یافت نشد
 */

router.get('/:roomId', roomController.getRoom)

/**
 * @swagger
 * /api/rooms/{id}/availability:
 *   get:
 *     summary: بررسی در دسترس بودن اتاق در یک بازه زمانی
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: شناسه اتاق
 *       - in: query
 *         name: checkIn
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: تاریخ ورود (ISO 8601)
 *       - in: query
 *         name: checkOut
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: تاریخ خروج (باید بعد از checkIn باشد)
 *     responses:
 *       200:
 *         description: نتیجه در دسترس بودن (true/false)
 *       400:
 *         description: پارامترهای الزامی ارسال نشده‌اند
 */

router.get('/:roomId/availability', roomController.checkAvailability)

module.exports = router