const catchAsync = require('../middleware/catchAsync')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')
const jwt = require('jsonwebtoken')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
  };

const register = catchAsync(async (req, res, next) => {
    const { name, email, phone, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return next(new ApiError(400, 'این ایمیل قبلا ثبت شده است'))
    }
    const user = await User.create({
        name, email, phone, password
    })
    const token = signToken(user._id)
    res.status(201).json({
        token,
        user
    })
})

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new ApiError(400, 'لطفا ایمیل و پسورد را وارد نمایید!'))
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.comparePassword(password)) {
        return next(new ApiError(401, 'ایمیل یا رمز عبور نادرست است'));
    }

    const token = signToken(user._id)
    res.status(200).json({
        token, user
    })
})

module.exports = {
    login, register
}