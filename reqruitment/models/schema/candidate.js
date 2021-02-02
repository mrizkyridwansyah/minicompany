const mongoose = require('mongoose')

const candidateSchema = mongoose.Schema({
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
    photoImg: { type: Buffer },
    photoType: { type: String },
    cvDoc: { type: Buffer },
    cvType: { type: String },
    status: { type: String, required: true, default: "Registered" },
    createAt: { type: Date, default: Date.now() },
})

candidateSchema.virtual('photo').get(function() {
    if(this.photoImg !== null && this.photoImg !== undefined && this.photoType !== null&& this.photoType !== undefined) {
        return `data:${this.photoType};charset=utf-8;base64,${this.photoImg.toString('base64')}`
    }
})

candidateSchema.virtual('cv').get(function() {
    if(this.cvDoc !== null && this.cvDoc !== undefined && this.cvType !== null && this.cvType !== undefined) {
        return `data:${this.cvType};charset=utf-8;base64,${this.cvDoc.toString('base64')}`
    }
})

module.exports = mongoose.model("Candidate", candidateSchema)