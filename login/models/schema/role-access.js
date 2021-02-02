const mongoose = require('mongoose')

const roleAccessSchema = mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    app: {
        type: String,
        required: true
    },
    menu: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("RoleAccess", roleAccessSchema)