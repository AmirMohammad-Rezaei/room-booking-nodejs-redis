const redis = require('../config/redis');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const ApiError = require('../utils/ApiError');
const constants = require('../utils/constants')

class BookingRoom {
    /*
    @param roomId
    @param userId
    if locked throw ApiError
    */

    async lockRoom(roomId, userId) {
        const key = `lock:room:${roomId}`;
        const result = await redis.set(key, userId, 'NX', 'EX', constants.LOCK_TTL)
        if (result !== 'OK') {
            throw new ApiError(409, 'این اتاق قبلا توسط شخص دیگری در حال رزرو است')
        }
        return true
    }

    async unLockRoom(roomId, userId) {
        const key = `lock:room:${roomId}`

        // استفاده از یک اسکریپت Lua برای اتمیک بودن عملیات بررسی و حذف
        const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        await redis.eval(luaScript, 1, key, userId) // argv =userId
    }

    async createBooking(roomId, checkIn, checkOut, userId) {
        const lockKey = `lock:room:${roomId}`;

        const lockOwner = await redis.get(lockKey)
        if (!lockOwner) {
            throw new ApiError(400, 'اتاق قفل نشده است ابتدا باید قفل شود!')
        }

        if (lockOwner !== userId) {
            throw new ApiError(403, 'اتاق در حال رزرو توسط شخص دیگری است')
        }

        // get room data
        const room = await Room.findById(roomId)
        if (!room) {
            throw new ApiError(400, 'اتاق مورد نظر یافت نشد')
        }

        // محاسبه قیمت
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)

        const nights = Math.ceil(
            (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
        );
        const finalPricePerNight = room.pricePerNight * (1 - room.discount)
        const totalPrice = finalPricePerNight * nights

        // ۴. بررسی مجدد در دسترس بودن (با ایندکس ترکیبی)
        const conflicting = await Booking.findOne({
            room: roomId,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    checkIn: { $lt: checkOutDate },
                    checkOut: { $gt: checkInDate },
                }
            ]
        });
        
 
        if (conflicting) {
            await this.unLockRoom(roomId, userId)
            throw new ApiError(409, 'اتاق در این بازه زمانی رزرو شده است')
        }

        // ذخیره رزرو
        const booking = await Booking.create({
            user: userId,
            room: roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalPrice,
            status: 'confirmed',
        })

        await this.unLockRoom(roomId, userId)
        return booking;
    }

    async getUserBookings(userId) {
        const bookings = await Booking.find({ user: userId }).
            populate({
                path: 'room',
                select: ['name', 'city', 'images']
            }).sort({ createdAt: -1 })

        return bookings
    }

}

module.exports = new BookingRoom()