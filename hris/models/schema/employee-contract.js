const mongoose = require('mongoose')
const contractSchema = mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    dateFrom: { type: Date, required: true },
    dateUntil: { type: Date, required: true },
    activeFlag: { type: Boolean, required: true, default: true },
    createAt: { type: Date, default: Date.now() },
    createBy: { type: String, required: true },
    updateAt: { type: Date, default: Date.now() },
    updateBy: { type: String, required: true }
})

module.exports = mongoose.model('Contract', contractSchema)