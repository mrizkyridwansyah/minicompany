const mongoose = require('mongoose')
const Approval = require('./approval')
const Reimburse = require('./employee-reimburse')

const refApprovalSchema = mongoose.Schema({
    userId: { type: String, required: true },
    level: { type: Number, required: true }
})

refApprovalSchema.pre('remove', async function(next) {
    const reimburseNotComplete = await Reimburse.find({ status: { $in: ['New', 'On Progress'] }})
    const approval = await Approval.find({ activityId: { $in: reimburseNotComplete.map(x => x.activityId) }, userId: this.userId })
    console.log(approval.length > 0)
    if(approval.length > 0) next(new Error("Reimburse on progress for this user"))
})

module.exports = mongoose.model('RefApproval', refApprovalSchema)