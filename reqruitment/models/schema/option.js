const mongoose = require('mongoose')

const optionSchema = mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
    desc: { type: String, required: true },
    value: { type: Boolean, required: true, default: false },
    createAt: { type: Date, required: true, default: Date.now() },
    createBy: { type: String, required: true },                
    updateAt: { type: Date, required: true, default: Date.now() },
    updateBy: { type: String, required: true } 
})

module.exports = mongoose.model("Option", optionSchema)