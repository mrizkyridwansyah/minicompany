const mongoose = require('mongoose')
const activitySchema = mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    name: { type: String, required: true },
    type: { type: String, required: true },//Non Approval(Permission, Sick, Paid Leave) Approval(Business Trip, Overtime)    
    dateFrom: { type: Date, required: true },
    dateUntil: { type: Date, required: true },
    status: { type: String, required: true },
    notes: { type: String, required: true },
    createAt: { type: Date, default: Date.now() },
    updateAt: { type: Date, default: Date.now() }
})

module.exports = mongoose.model('Activity', activitySchema)