const mongoose = require('mongoose')
const reimburseSchema = mongoose.Schema({
    activityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Activity' },//Activity where type Luar Kota & Lembur
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
    amount: { type: Number, required: true },
    status: { type: String, required: true },//New, On Progress, Approved, Rejected, Done
    fileImg: { type: Buffer },    
    fileType: { type: String },
    createAt: { type: Date, default: Date.now() },
    updateAt: { type: Date, default: Date.now() },
})

reimburseSchema.virtual('file').get(function() {
    if(this.fileImg !== null && this.fileImg !== undefined && this.fileType !== null&& this.fileType !== undefined) {
        return `data:${this.fileType};charset=utf-8;base64,${this.fileImg.toString('base64').replace("dataimage/pngbase64", "")}`
    }
})

module.exports = mongoose.model('Reimburse', reimburseSchema)