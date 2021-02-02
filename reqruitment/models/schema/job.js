const mongoose = require('mongoose')

const jobSchema = mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    requirement: { type: String, required: true },
    type: { type: String, required: true },
    minRate: { type: Number, required: true },
    maxRate: { type: Number, required: true },
    closedFlag: { type: Boolean, required: true, default: false },
    publishedFlag: { type: Boolean, required: true, default: false },
    createAt: { type: Date, required: true, default: Date.now() },
    updateAt: { type: Date, required: true, default: Date.now() }
})

module.exports = mongoose.model("Job", jobSchema)