# استفاده از Image رسمی Node.js نسخه 20 (سبک و سریع)
FROM node:20-alpine

# تنظیم دایرکتوری کاری داخل Container
WORKDIR /app

# کپی package.json و package-lock.json (برای نصب بهتر layer cache)
COPY package*.json ./

# نصب وابستگی‌ها (همه شامل devDependencies هم نصب شود چون برای seed و nodemon ممکن است لازم باشد)
RUN npm install

# کپی تمام فایل‌های پروژه
COPY . .

# پورتی که اپ روی آن گوش می‌دهد (پیش‌فرض 3000) را اعلام می‌کنیم
EXPOSE 3000

# دستور اجرای برنامه (از server.js استفاده می‌کنیم)
CMD ["node", "server.js"]