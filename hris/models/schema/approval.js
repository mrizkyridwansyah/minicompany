const mongoose = require('mongoose')
const approvalSchema = mongoose.Schema({
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' , required: true },
    userId: { type: String, required: true },
    level: { type: Number, required: true },
    approvedFlag: { type: Boolean, default: null },
    approvedDate: { type: Date, default: null },
    notes: { type: String, default: "" }
})

module.exports = mongoose.model('Approval', approvalSchema)