const mongoose = require('mongoose')
const Employee = require('./employee')

const departmentSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true, dropDup: true }
})

departmentSchema.pre('remove', async function(next) {
    const employee = await Employee.find({ department: this.name })
    if(employee.length > 0) next(new Error("Department has Employee"))
})

module.exports = mongoose.model('Department', departmentSchema)