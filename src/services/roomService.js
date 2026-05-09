const Room = require('../models/Room')
const Booking = require('../models/Booking')
const ApiError = require('../utils/ApiError')
const redis = require('../config/redis')

class RoomService {


    /*
   * دریافت تمام اتاق‌ها
   * @param {Object} query - پارامترهای فیلتر (اختیاری)
   * @returns {Array} لیست اتاق‌ها
   */
    async getAllRooms(query = {}) {
        const filter = {}
        if (query.city) filter.city = query.city.toLowerCase()
        if (query.minPrice || query.maxPrice) {
            filter.pricePerNight = {}
            if (query.minPrice) filter.pricePerNight.$gte = Number(query.minPrice)
            if (query.maxPrice) filter.pricePerNight.$lte = Number(query.maxPrice)
        }
        const rooms = await Room.find(filter)
        return rooms.map((room) => {
            const finalPricePerNight = room * (1 - room.discount)
            return {
                ...room.toObject(),
                finalPricePerNight: Math.round(finalPricePerNight * 100) / 100 // گرد کردن
            }
        })
    }

    async getRoomById(roomId, checkLock = false) {
        const room = await Room.findById(roomId)
        if (!room) {
            throw new ApiError(400, 'اتاق مورد نظر یافت نشد')
        }
        const finalPricePerNight = room.pricePerNight * (1 - room.discount)

        const result = {
            ...room.toObject(),
            finalPricePerNight: Number(finalPricePerNight * 100) / 100
        }
        if (checkLock) {
            const lockKey = `lock:room:${roomId}`
            const lockValue = await redis.get(lockKey)
            result.isLocked = !!lockValue; // true اگر قفل باشد  // = Boolean(lockValue)
        }

        return result
    }

    async checkAvailability(roomId, checkIn, checkOut) {
        const conflicting = await Booking.findOne({
            roomId,
            $or: [
                { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
            ]
        });

        return !conflicting;
    }

}


module.exports = new RoomService(); 