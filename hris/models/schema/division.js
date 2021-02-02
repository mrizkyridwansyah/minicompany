const mongoose = require('mongoose')
const Employee = require('./employee')

const divisionSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true, dropDup: true }
})

divisionSchema.pre('remove', async function(next) {
    const employee = await Employee.find({ division: this.name })
    if(employee.length > 0) next(new Error("Division has Employee"))
})

module.exports = mongoose.model('Division', divisionSchema)