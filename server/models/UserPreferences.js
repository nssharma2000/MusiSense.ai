const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')






const PreferenceSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user",
        required: true,
    },
    rSetting: { type: Number,
        required: true,
        default: () => 0
    },
    genres: [
        {
            number: { type: Number, required: true },
            isTrue: { type: Boolean, required: true, default: () => false }
        }
    ],
    isEnabled: { type: Boolean, required: true, default: () => true }
})



  



const PreferenceModel = mongoose.model("preference", PreferenceSchema)
module.exports = PreferenceModel



