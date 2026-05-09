# سیستم رزرو اقامتگاه (Room Booking API)

یک API حرفه‌ای برای رزرو اتاق/اقامتگاه با **Node.js** و **Express** که از **MongoDB** برای ذخیره‌سازی دائمی و از **Redis** برای قفل‌گذاری توزیع‌شده (جلوگیری از رزرو هم‌زمان) استفاده می‌کند.

این پروژه با هدف نمایش توانایی‌های یک توسعه‌دهنده Full-Stack در بخش backend طراحی شده و شامل احراز هویت JWT، محدودیت نرخ (Rate Limiting)، اعتبارسنجی داده‌ها، مستندات تعاملی Swagger و امنیت پایه می‌باشد.

[![Node.js](https://img.shields.io/badge/Node.js-22.17-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-brightgreen)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.x-red)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ ویژگی‌های کلیدی

- **مدیریت اتاق‌ها** – جستجو، فیلتر (شهر و قیمت)، جزئیات کامل به‌همراه امکانات (amenities)
- **جلوگیری از Double Booking** – الگوریتم Distributed Lock با Redis (SET NX EX)  
  کاربر با ورود به صفحه‌ی رزرو، اتاق را قفل می‌کند. در صورت انقضای ۵ دقیقه‌ای یا لغو، قفل خودکار آزاد می‌شود.
- **احراز هویت امن** – ثبت‌نام و ورود با رمز عبور هش‌شده (bcryptjs, 12 round) و صدور توکن JWT با تاریخ انقضا
- **Rate Limiting** – محدود کردن تعداد درخواست‌ها روی مسیرهای حساس (ورود، قفل‌گذاری) با Redis
- **اعتبارسنجی داده‌ها** – میدل‌ور Joi برای جلوگیری از ورود داده‌های مخرب
- **امنیت پایه** – Helmet (هدرهای امنیتی)، جلوگیری از NoSQL Injection با `mongo-sanitize`
- **مستندات تعاملی** – Swagger UI در آدرس `/api-docs`
- **محاسبه تخفیف** – قیمت نهایی هر شب (`finalPricePerNight`) در لحظه محاسبه می‌شود و در دیتابیس ذخیره نمی‌گردد
- **ایندکس‌های بهینه** – ایندکس ترکیبی روی `city+pricePerNight` و `room+checkIn+checkOut` برای جستجوی سریع

## 🛠️ تکنولوژی‌های استفاده شده

| دسته‌بندی | نام | نسخه |
|-----------|------|------|
| Runtime | Node.js | 22.17 |
| Framework | Express | ^5.2.1 |
| Database | MongoDB (Mongoose) | 7.x (^9.6.1) |
| In‑Memory Store | Redis (ioredis) | ^5.10.1 |
| Authentication | JWT (jsonwebtoken) | ^9.0.3 |
| Password Hashing | bcryptjs | ^3.0.3 |
| Validation | Joi | ^18.2.1 |
| Security Headers | helmet | ^8.1.0 |
| NoSQL Sanitization | express-mongo-sanitize | ^2.2.0 |
| Rate Limiting | Custom (Redis‑based) + express-rate-limit | ^8.5.1 |
| API Docs | swagger-jsdoc + swagger-ui-express | ^6.2.8 / ^5.0.1 |
| CORS | cors | ^2.8.6 |
| Environment | dotenv | ^17.4.2 |

## 🧠 معماری قفل‌گذاری توزیع‌شده (Distributed Lock)

مشکل: اگر دو کاربر هم‌زمان یک اتاق را در صفحه‌ی رزرو باز کنند، ممکن است هر دو آن را رزرو کنند (Double Booking).  
راه‌حل:

1. کاربر درخواست قفل می‌دهد (`POST /api/bookings/lock`).  
2. سرور با دستور اتمی `SET lock:room:{roomId} {userId} NX EX 300` سعی می‌کند قفل بزند.  
   - اگر `OK` برگردد: قفل برای کاربر ثبت می‌شود.  
   - اگر `null` برگردد: یعنی اتاق قبلاً قفل شده → خطای `409` (Conflict) برمی‌گردد.  
3. در صورت موفقیت، کاربر ۵ دقیقه فرصت دارد رزرو را نهایی کند (`POST /api/bookings`).  
4. پس از ثبت رزرو، قفل با یک اسکریپت Lua (برای اطمینان از مالکیت) حذف می‌شود.  
5. اگر کاربر صفحه را ببندد یا دکمه‌ی لغو بزند (`DELETE /api/bookings/lock`)، قفل آزاد می‌شود.  
6. اگر در ۵ دقیقه هیچ اقدامی نکند، قفل خودکار منقضی می‌شود (Redis TTL).

این مکانیزم دقیقاً همان روشی است که در سیستم‌های رزرو واقعی (مانند رزرو بلیت یا هتل) استفاده می‌شود.

## 🚀 راه‌اندازی و اجرا

### پیش‌نیازها
- [Node.js](https://nodejs.org) (نسخه 22.17 یا بالاتر)
- [MongoDB](https://www.mongodb.com/try/download/community) (نسخه ۷)
- [Redis](https://redis.io/download) (نسخه ۷)

> **نکته برای ویندوز:** می‌توانید Redis را از [Redis for Windows](https://github.com/tporadowski/redis/releases) یا داخل WSL اجرا کنید.

### ۱. Clone کردن پروژه
```bash
git clone https://github.com/AmirMohammad-Rezaei/room-booking-nodejs-redis.git
cd room-booking-nodejs-redis