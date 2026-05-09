const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'confirmed', // در فرآیند قفل، مستقیماً confirmed ثبت می‌شود
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
);

// ایندکس ترکیبی برای جستجوی سریع در دسترس بودن
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

// ایندکس روی کاربر برای بازیابی تاریخچه رزروها
bookingSchema.index({ user: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;