const express = require('express')
const router = express.Router()
const asyncFunction = require('async')
const Employee = require('../models/schema/employee')
const Activity = require('../models/schema/employee-activity')
const Reimburse = require('../models/schema/employee-reimburse')
const RefApproval = require('../models/schema/ref-approval')
const Approval = require('../models/schema/approval')
const typeActivity = ['Permission', 'Sick', 'Paid Leave', 'Business Trip', 'Overtime']
const fileMimeTypes = ['image/jpeg', 'image/png']

//Employee Activity
router.post("/:idemployee", async function(req, res) {
    if(!req.body.type) res.status(400).json({ message: "Type is required" })
    if(!req.body.dateFrom) res.status(400).json({ message: "From Date is required" })
    if(!req.body.dateUntil) res.status(400).json({ message: "Until Date is required" })
    if(!req.body.notes) res.status(400).json({ message: "Notes is required" })
    
    const refApprovals = await RefApproval.find()
    const arrType = typeActivity.indexOf(req.body.type)
    if(arrType < 0) res.status(400).json({ message: "Type is invalid" })
    if(arrType > 2 && !req.body.amount) res.status(400).json({ message: "Amount is required" })
    if(arrType > 2 && isNaN(req.body.amount)) res.status(400).json({ message: "Amount is invalid" })
    if(arrType > 2 && refApprovals.length === 0) return res.status(400).json({ message: "Approval Reference has not been set" })

    const status = arrType > 2 ? "New" : "Done"
    const employee = await Employee.findById(req.params.idemployee)
    if(!employee) res.status(400).json({ message: "Employee didn't exists"})
    
    const newActivity = new Activity({
        employeeId: employee.id,
        name: employee.name,
        type: req.body.type,
        dateFrom: req.body.dateFrom,
        dateUntil: req.body.dateUntil,
        status: status,
        notes: req.body.notes
    })

    let newReimburse = new Reimburse({
        employeeId: employee.id,
        amount: req.body.amount,
        status: "New"
    })    
    
    await saveFileUpload(newReimburse, req.body.file)

    newActivity.save().then(
        async () => {
            if(arrType > 2) {
                newReimburse.activityId = newActivity.id
                await newReimburse.save()
    
                const refApprovals = await RefApproval.find()
                asyncFunction.forEach(refApprovals, async (ref) => {
                    const newApproval = new Approval({
                        activityId: newActivity.id,
                        userId: ref.userId,
                        level: ref.level                    
                    })
    
                    try{
                        await newApproval.save()
                    } catch(err) {
                        res.status(500).json({ message: err.message })
                    }                    
                }, (err) => { 
                    if(err) res.status(500).json({ message: err.message })
                    res.status(200).json(newActivity)
                })        
            } else {
                res.status(200).json(newActivity)
            }    
        }
    ).catch(err => {
        res.status(200).json({ message: err.message })
    })
    // try {
    //     await newActivity.save()
    // } catch(err) {
    // }
})

router.put("/:id", async function(req, res) {
    if(!req.body.dateFrom) res.status(400).json({ message: "From Date is required" })
    if(!req.body.dateUntil) res.status(400).json({ message: "Until Date is required" })
    if(!req.body.notes) res.status(400).json({ message: "Notes is required" })
    
    const activity = await Activity.findById(req.params.id)
    if(!activity) res.status(400).json({ message: "Employee Activity didn't exists"})
    if(activity.status !== "New") return res.status(400).json({ message: "Cannot edit this activity which on progress"})
    
    const arrType = typeActivity.indexOf(activity.type)
    if(arrType < 0) res.status(400).json({ message: "Type is invalid" })
    if(arrType > 2 && !req.body.amount) res.status(400).json({ message: "Amount is required" })
    if(arrType > 2 && isNaN(req.body.amount)) res.status(400).json({ message: "Amount is invalid" })

    activity.dateFrom = req.body.dateFrom
    activity.dateUntil = req.body.dateUntil
    activity.notes = req.body.notes

    const reimburse = await Reimburse.findOne({ activityId: req.params.id })
    if(arrType > 2) {
        if(!reimburse.length === 0) res.status(400).json({ message: "Employee Reimburse didn't exists"})
        reimburse.amount = req.body.amount            
        await saveFileUpload(reimburse, req.body.file)
    }

    try {
        await activity.save()

        if(arrType > 2) {
            await reimburse.save()
            res.status(200).json(activity)
        } else {
            res.status(200).json(activity)
        }
    } catch(err) {
        res.status(500).json({ message: err.message })        
    }

})

router.delete("/:id", async function(req, res) {
    const activity = await Activity.findById(req.params.id)
    if(!activity) res.status(400).json({ message: "Employee Activity didn't exists"})
    if(activity.status !== "New") return res.status(400).json({ message: `Cannot delete this activity which ${activity.status.toString().toLowerCase()}`})

    const arrType = typeActivity.indexOf(activity.type)
    try {
        await activity.remove()
        if(arrType > 2) {
            await Reimburse.findOneAndRemove({ activityId: req.params.id })
            await Approval.deleteMany({ activityId: req.params.id })
            res.status(200).json({ message: "Activity has been deleted"})
        } else {
            res.status(200).json({ message: "Activity has been deleted"})
        }
    } catch(err) {
        res.status(500).json({ message: err.message })
    }

})

async function saveFileUpload(reimburse, file) {
    if(file == null) return

    if(file !== null && fileMimeTypes.includes(file.type)) {
        reimburse.fileImg = new Buffer.from(file.data.split(",")[1], 'base64')
        reimburse.fileType = file.type
    }
}

module.exports = router