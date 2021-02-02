const mongoose = require('mongoose')
const salarySchema = mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    job: { type: String, required: true },
    division: { type: String, required: true },    
    department: { type: String, required: true },
    amount: { type: Number, required: true },
    activeFlag: { type: Boolean, required: true, default: true },
    createBy: { type: String, required: true },
    updateBy: { type: String, required: true },
    createAt: { type: Date, default: Date.now() },
    updateAt: { type: Date, default: Date.now() }
})

module.exports = mongoose.model('Salary', salarySchema)