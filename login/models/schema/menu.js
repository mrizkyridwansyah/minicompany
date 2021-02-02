const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
    name: { type: String, required: true },
    app: { type: String, required: true },
    entryPoint: { type: String, required: true, unique: true, dropDup: true },
    logo: { type: String, default: null },
    parent: { type: String, default: null }
})

module.exports = mongoose.model("Menu", menuSchema)