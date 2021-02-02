const mongoose = require('mongoose')
const roleAccess = require('./role-access')

const appSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        dropDup: true,
        required: true
    },
    desc: {
        type: String,
        required: true
    }
})

appSchema.pre('remove', async function (next) {
    const accessRole = await roleAccess.find({ role: this.name })
    if(accessRole.length > 0) next(new Error("Application has Role Access"))
})

module.exports = mongoose.model("Application", appSchema)