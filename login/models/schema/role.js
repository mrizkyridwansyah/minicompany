const mongoose = require('mongoose')
const user = require('./user')

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        dropDup: true,
        required: true
    }
})

roleSchema.pre('remove', async function(next) {
    const userWithRole = await user.find({ role: this.name })
    if(userWithRole.length > 0) next(new Error("Role has User"))    
})

module.exports = mongoose.model("Role", roleSchema)