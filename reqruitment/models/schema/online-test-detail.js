const mongoose = require('mongoose')

const onlineTestDetailSchema = mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'JobApplication' },
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
    question: { type: String, required: true },
    answerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Option' },
    answer: { type: String, required: true },
    value: { type: Number, required: true }
})

module.exports = mongoose.model('OnlineTestDetail', onlineTestDetailSchema)