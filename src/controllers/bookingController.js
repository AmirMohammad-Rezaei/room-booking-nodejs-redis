const catchAsync = require('../middleware/catchAsync')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')
const bookingServices = require('../services/bookingService')


exports.
    lockRoom = catchAsync(async (req, res, next) => {
        const { roomId } = req.body
        const userId = req.user._id

        await bookingServices.lockRoom(roomId, userId)
        res.status(200).json({
            status: 'success',
            message: 'اتاق با موفقیت قفل شد'
        })
    })

exports.unLockRoom = catchAsync(async (req, res, next) => {
    const { roomId } = req.body
    const userId = req.user._id

    const result =  await bookingServices.unLockRoom(roomId, userId)
    res.status(200).json({
        status: 'success',
        message: result!==0? 'قفل اتاق آزاد شد': 'مشکلی در ازاد کردن قفل پیش آمده'
    })
})

exports.createBooking = catchAsync(async (req, res, next) => {
    const { roomId, checkIn, checkOut } = req.body
    const userId = req.user._id.toString()

    const booking =await bookingServices.createBooking(
        roomId,
        checkIn,
        checkOut,
        userId
    )
    res.status(201).json({
        status: 'success',
        data: {
            booking,
        },
    });
})

exports.getMyBookings = catchAsync(async (req, res, next) => {
    const userId = req.user._id
    const bookings = await bookingServices.getUserBookings(userId)
    res.status(201).json({
        status: 'success',
        data: {
            bookings,
        }
    });
})