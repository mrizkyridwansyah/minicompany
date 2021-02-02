const mongoose = require('mongoose')

const applicationSchema = mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Job' },
    jobTitle: { type: String, required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Candidate' },
    candidateName: { type: String, required: true },
    status: { type: String, required: true, default: "Registered" },
    onlineResult: { type: Number, required: true, default: 0 },
    onlineResultDate: { type: Date, default: null },
    notes: { type: String, default: null },
    createAt: { type: Date, required: true, default: Date.now() },
    updateAt: { type: Date, required: true, default: Date.now() },
    updateBy: { type: mongoose.Schema.ObjectId,  default: null },
})

module.exports = mongoose.model("JobApplication", applicationSchema)