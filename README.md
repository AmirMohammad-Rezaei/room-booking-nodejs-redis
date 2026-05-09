# سیستم رزرو اقامتگاه (Room Booking API)

یک API حرفه‌ای برای رزرو اتاق/اقامتگاه با **Node.js** و **Express** که از **MongoDB** برای ذخیره‌سازی دائمی و از **Redis** برای قفل‌گذاری توزیع‌شده (جلوگیری از رزرو هم‌زمان) استفاده می‌کند.

این پروژه با هدف نمایش توانایی‌های یک توسعه‌دهنده‌ی Full-Stack در بخش backend طراحی شده و شامل احراز هویت JWT، محدودیت نرخ (Rate Limiting)، اعتبارسنجی داده‌ها، مستندات تعاملی Swagger و امنیت پایه می‌باشد.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-brightgreen)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.x-red)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ ویژگی‌های کلیدی

- **مدیریت اتاق‌ها** – جستجو، فیلتر (شهر و قیمت)، جزئیات کامل به‌همراه امکانات (amenities)
- **جلوگیری از Double Booking** – الگوریتم Distributed Lock با Redis (SET NX EX)  
  کاربر با ورود به صفحه‌ی رزرو، اتاق را قفل می‌کند. در صورت انقضای ۵ دقیقه‌ای یا لغو، قفل خودکار آزاد می‌شود.
- **احراز هویت امن** – ثبت‌نام و ورود با رمز عبور هش‌شده (bcrypt, 12 round) و صدور توکن JWT با تاریخ انقضا
- **Rate Limiting** – محدود کردن تعداد درخواست‌ها روی مسیرهای حساس (ورود، قفل‌گذاری) با Redis
- **اعتبارسنجی داده‌ها** – میدل‌ور Joi برای جلوگیری از ورود داده‌های مخرب
- **امنیت پایه** – Helmet (هدرهای امنیتی)، جلوگیری از NoSQL Injection با `mongo-sanitize`
- **مستندات تعاملی** – Swagger UI در آدرس `/api-docs`
- **محاسبه تخفیف** – قیمت نهایی هر شب (`finalPricePerNight`) در لحظه محاسبه می‌شود و در دیتابیس ذخیره نمی‌گردد
- **ایندکس‌های بهینه** – ایندکس ترکیبی روی `city+pricePerNight` و `room+checkIn+checkOut` برای جستجوی سریع

## 🛠️ تکنولوژی‌های استفاده شده

- **Runtime:** Node.js 20.x
- **Framework:** Express 4
- **Database:** MongoDB (Mongoose ODM)
- **In‑Memory Store:** Redis (ioredis)
- **Authentication:** JSON Web Token (JWT) + bcryptjs
- **Validation:** Joi
- **Security:** Helmet, Mongo Sanitize
- **API Documentation:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Rate Limiting:** Custom Redis‑based limiter

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
- [Node.js](https://nodejs.org) (نسخه ۱۶ یا بالاتر)
- [MongoDB](https://www.mongodb.com/try/download/community) (نسخه ۷)
- [Redis](https://redis.io/download) (نسخه ۷)

> **نکته برای ویندوز:** می‌توانید Redis را از [Redis for Windows](https://github.com/tporadowski/redis/releases) یا داخل WSL اجرا کنید.

### ۱. Clone کردن پروژه
```bash
git clone https://github.com/AmirMohammad-Rezaei/room-booking-nodejs-redis.git
cd room-booking-nodejs-redis