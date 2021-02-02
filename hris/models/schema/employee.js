const mongoose = require('mongoose')
const employeeSchema = mongoose.Schema({
    employeeId: { type: String, required: true, unique: true, dropDup: true },
    identityNumber: { type: String, required: true, unique: true, dropDup: true },
    email: { type: String, required: true, unique: true, dropDup: true },
    name: { type: String, required: true },
    placeOfBirth: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    identityAddress: { type: String, required: true, default: "-" },
    identitySubDistrict: { type: String, required: true, default: "-" },
    identityDistricts: { type: String, required: true, default: "-" },
    identityProvince: { type: String, required: true, default: "-" },
    nationality: { type: String, required: true },
    phoneNumber: { type: String, required: true, default: "-" },
    status: { type: String, required: true },//Karyawan Tetap atau Kontrak
    activeFlag: { type: Boolean, required: true, default: true },
    division: { type: String, required: true },
    department: { type: String, required: true },
    jobTitle: { type: String, required: true },
    accountBank: { type: String, required: true },
    usernameEmployee: { type: String, required: true },
    // photoImg: { type: Buffer },
    // photoType: { type: String },
    // cvDoc: { type: Buffer },
    // cvType: { type: String },
    joinDate: { type: Date, required: true },
    resignDate: { type: Date, default: null },
    createAt: { type: Date, default: Date.now() },
})

// employeeSchema.virtual('photo').get(function() {
//     if(this.photoImg !== null && this.photoImg !== undefined && this.photoType !== null&& this.photoType !== undefined) {
//         return `data:${this.photoType};charset=utf-8;base64,${this.photoImg.toString('base64')}`
//     }
// })

// employeeSchema.virtual('cv').get(function() {
//     if(this.cvDoc !== null && this.cvDoc !== undefined && this.cvType !== null && this.cvType !== undefined) {
//         return `data:${this.cvType};charset=utf-8;base64,${this.cvDoc.toString('base64')}`
//     }
// })

module.exports = mongoose.model('Employee', employeeSchema)