require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./src/models/Room');
const User = require('./src/models/User');

const rooms = [
  {
    name: 'سوئیت رویایی تهران',
    description: 'اقامتی لوکس در قلب پایتخت',
    pricePerNight: 800000,
    capacity: 2,
    images: ['https://example.com/img1.jpg'],
    city: 'تهران',
    discount: 0.15,
    amenities: ['یخچال', 'تلویزیون', 'کولر اسپلیت', 'ماشین ظرفشویی', 'وای‌فای'],
  },
  {
    name: 'ویلای دنج شیراز',
    description: 'ویلایی با باغ زیبا در نزدیکی حافظیه',
    pricePerNight: 1200000,
    capacity: 4,
    images: ['https://example.com/shiraz.jpg'],
    city: 'شیراز',
    discount: 0.1,
    amenities: ['یخچال', 'تلویزیون', 'سیستم گرمایشی'],
  },
  {
    name: 'کلبه جنگلی مازندران',
    description: 'اقامتی رویایی در دل جنگل‌های شمال',
    pricePerNight: 600000,
    capacity: 3,
    images: [],
    city: 'مازندران',
    discount: 0,
    amenities: ['یخچال'],
  },
  {
    name: 'خانه تاریخی اصفهان',
    description: 'اتاقی با معماری سنتی در بافت تاریخی',
    pricePerNight: 950000,
    capacity: 2,
    images: ['https://example.com/esfahan.jpg'],
    city: 'اصفهان',
    discount: 0.2,
    amenities: ['تلویزیون', 'کولر آبی'],
  },
  {
    name: 'اتاق اقتصادی تهران',
    description: 'گزینه‌ای مقرون‌به‌صرفه برای مسافران',
    pricePerNight: 400000,
    capacity: 2,
    images: [],
    city: 'تهران',
    discount: 0,
    amenities: [], // بدون امکانات
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // پاک کردن داده‌های قبلی
    await Room.deleteMany({});
    await User.deleteMany({});

    // درج اتاق‌ها
    await Room.insertMany(rooms);
    console.log('✅ 5 rooms inserted successfully');

    // می‌توان یک کاربر تست هم اضافه کرد
    await User.create({
      name: 'کاربر تست',
      email: 'test@example.com',
      phone: '09123456789',
      password: 'password123',
    });
    console.log('✅ Test user created (test@example.com / password123)');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();