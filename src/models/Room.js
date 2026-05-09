const { default: mongoose } = require("mongoose");

const roomSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    pricePerNight: {
        type: Number,
        required: [true, 'توضیحات فیلد الزامی است'],
        min: [0, '']
    },
    description: {
        type: String,
        trim: true
    },
    capacity: {
        type: Number,
        min: [1, 'حداقل ظرفیت یک نفر است'],
        default: 1
    },
    images: {
        type: [String],
        default: []
    },
    city: {
        type: String,
        required: [true, 'شهر الزامی است'],
        trim: true,
        lowercase: true
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'تخفیف نیمتواند منفی باشد'],
        max: [1, 'تحفیف نمی‌تواند بیشتر از 100% باشد']
    },
    amenities: {
        type: [String],
        default: []
    }
},
    {
        timeStamps: true,
        toJson: { virtuals: true },
        toObject: { virtuals: true }
    }
)

roomSchema.index({ city: 1, pricePerNight: 1 })

roomSchema.index({ name: "text" })

module.exports = mongoose.model("Room", roomSchema)