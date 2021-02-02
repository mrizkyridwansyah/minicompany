const mongoose = require('mongoose')

const questionSchema = mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Job' },
    type: { type: String, required: true },
    desc: { type: String, required: true },
    weight: { type: Number, required: true, default: 0 },
    createAt: { type: Date, required: true, default: Date.now() },
    createBy: { type: String, required: true },                
    updateAt: { type: Date, required: true, default: Date.now() },
    updateBy: { type: String, required: true } 
})

module.exports = mongoose.model("Question", questionSchema)