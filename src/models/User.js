const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'نام الزامی است']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'ایمیل الزامی است'],
        trim: true,
        match: [/.+@.+\..+/, 'لطفاً یک ایمیل معتبر وارد کنید'],
    },
    phone: {
        type: String,
        required: [true, 'شماره تلفن الزامی است'],
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'رمز عبور الزامی است'],
        minlength: [6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'],
        select: false
    }
},
    {
        timestamps: true
    }
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    //save hash code 2
    // return bcrypt.hash(this.password, 12).then((hashed) => {
    //     this.password = hashed
    // })

    //save hash code 1
    this.password = await bcrypt.hash(this.password, 12)
});


userSchema.methods.comparePassword = async function (enterredPassword) {
    return await bcrypt.compare(this.password, enterredPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User