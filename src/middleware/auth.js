const catchAsync = require("../middleware/catchAsync")
const ApiError = require("../utils/ApiError")
const User = require("../models/User")
const jwt = require('jsonwebtoken')

const auth = catchAsync(async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]

    }

    if (!token) {
        return next(new ApiError(400, 'توکن پیدا نشدد دوباره وارد شوید'))
    }

    // تأیید توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    // چون خطای synchronous هست بهتره از 
    // return next استفاده کنیم 
    if (!user) {
        return next(new ApiError(401, 'کاربر با این توکن یافت نشد'))
    }

    req.user = user
    next()
})

module.exports = auth