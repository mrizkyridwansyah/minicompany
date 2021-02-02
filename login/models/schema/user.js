const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        dropDups: true        
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        dropDups: true        
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    activeFlag: {
        type: Boolean,
        default: true
    },
    wrongPass: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
        default: null
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    updateAt: {
        type: Date,
        default: Date.now,
    },
    employeeId: {
        type: String,
        default: null
    }
})

module.exports = mongoose.model('User', userSchema)