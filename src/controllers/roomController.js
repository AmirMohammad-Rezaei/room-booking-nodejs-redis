const catchAsync = require('../middleware/catchAsync')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')
const roomServices = require('../services/roomService')


const getAllRooms = catchAsync(async (req, res, next) => {
    const rooms = await roomServices.getAllRooms(req.query)
    res.status(200).json({
        success: true,
        results: rooms.length,
        data: {
            rooms,
        }
    })
})

const getRoom = catchAsync(async (req, res, next) => {
    const room = await roomServices.getRoomById(req.params.roomId, true)
    res.status(200).json({
        success: true,
        data: {
            room
        }
    })
})

const checkAvailability = catchAsync(async (req, res, next) => {

    const { checkIn, checkOut } = req.query
    if (!checkIn || !checkOut) {
        throw new ApiError(400, 'تاریخ ورود و خروجی به اتاق را وارد نمایید')
    }

    const available = await roomServices.checkAvailability(
        req.params.id,
        new Date(checkIn),
        new Date(checkOut)
    )
    res.status(200).json({
        success: true,
        data: {
            available
        }
    })
})

module.exports = {
    getRoom, getAllRooms, checkAvailability
}