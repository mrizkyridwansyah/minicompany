const express = require('express')
const router = express.Router()
const Employee = require('../models/schema/employee')
const Activity = require('../models/schema/employee-activity')
const Reimburse = require('../models/schema/employee-reimburse')
const RefApproval = require('../models/schema/ref-approval')
const Approval = require('../models/schema/approval')

router.post("/setup", async function(req, res) {
    if(!req.body.userId) res.status(400).json({ message: "User ID is required" })
    if(!req.body.level) res.status(400).json({ message: "Level is required" })
    
    const hasRefApproval = (await RefApproval.find({ userId: req.body.userId })).length > 0
    if(hasRefApproval) return res.status(400).json({ message: "User has become an Approval Reference" })
    if(!(await validationPrevLevel(req.body.level))) {
        res.status(500).json({ message: `Approval Reference Level ${req.body.level-1} has no reference` })    
    } else {
        const newRefApproval = new RefApproval({
            userId: req.body.userId,
            level: req.body.level
        })
        
        try {
            await newRefApproval.save()
            res.status(200).json(newRefApproval)
        } catch(err) {
            res.status(500).json({ message: err.message })
        }    
    }

})

router.put("/setup/:id", async function(req, res) {
    if(!req.body.level) res.status(400).json({ message: "Level is required" })
    const refApproval = await RefApproval.findById(req.params.id)
    if(!refApproval) res.status(500).json({ message: "User didn't exists" })
    if(!(await validationPrevLevel(req.body.level, refApproval.userId))) {
        res.status(500).json({ message: `Approval Reference Level ${req.body.level-1} has no reference` })
    } else {
        if(!(await validationCurrentLevel(req.body.level, req.params.id))) {
            res.status(500).json({ message: "Previous approval level must have a reference" })            
        } else {
            refApproval.level = req.body.level
        
            try {
                await refApproval.save()
                res.status(200).json(refApproval)
            } catch(err) {
                res.status(500).json({ message: err.message })
            }
        }
    } 
})

router.delete("/setup/:id", async function(req, res) {
    const refApproval = await RefApproval.findById(req.params.id)
    if(!refApproval) res.status(500).json({ message: "User didn't exists" })
    if(!(await validationCurrentLevel(refApproval.level, req.params.id))) {
        res.status(500).json({ message: "Previous approval level must have a reference" })
    } else {
        try {
            await refApproval.remove()
            res.status(200).json({ message: "Approval Reference has been deleted" })
        } catch(err) {
            res.status(500).json({ message: err.message })
        }
    }

})

router.post("/:id", async function(req, res) {
    if(!req.body.userId) res.status(400).json({ message: "Approved User is required"})
    if(req.body.approvedFlag === null) res.status(400).json({ message: "Status Approved or Rejected is required"})
    if(!req.body.notes) res.status(400).json({ message: "Notes is required"})

    const approval = await Approval.findById(req.params.id)
    if(!approval) res.status(400).json({ message: "Data Approval didn't exists" })
    const allApprover = (await Approval.find({ activityId: approval.activityId })).length
    const status = !req.body.approvedFlag || approval.level === allApprover ? "Done" : "On Progress"

    approval.approvedFlag = req.body.approvedFlag
    approval.approvedDate = Date.now()
    approval.notes = req.body.notes

    try {
        await approval.save()
        await Activity.findByIdAndUpdate(approval.activityId, { status: status })
        await Reimburse.findOneAndUpdate({ activityId: approval.activityId }, { status: status })
        res.status(200).json(approval)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

async function validationPrevLevel(level, id = "") {
    if(level > 1) {
        const prevLevel = level - 1;
        const isPrevLevelHasRef = (await RefApproval.find({ level: prevLevel, userId : {$ne: id} })).length > 0
        return isPrevLevelHasRef
    } else {
        return true
    }
}

async function validationCurrentLevel(level, id) {
    const nextLevel = level + 1;
    const isNextLevelHasAnotherRef = (await RefApproval.find({ level: nextLevel })).length > 0
    if(isNextLevelHasAnotherRef) {
        const isThisLevelHasAnotherRef = (await RefApproval.find({ level: level, id: { $ne: id} })).length > 0
        return isThisLevelHasAnotherRef
    } else {
        return true
    }
}

module.exports = router