const express = require('express')
const router = express.Router()
const Department = require('../models/schema/department')

router.post("/", async function(req, res) {
    if(!req.body.name) res.status(400).json({ message: "Name is required" })

    const newDepartment = new Department({ name: req.body.name })
    try {
        await newDepartment.save()
        res.status(200).json(newDepartment)
    } catch(err) {
        if(err.code === 11000) {
            res.status(400).json({ message: "Department duplicated" })
        } else {
            res.status(500).json({ message: err.message })            
        }
    }
})

router.put("/:id", async function(req, res) {
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    
    const department = await Department.findById(req.params.id)
    department.name = req.body.name

    try {
        await department.save()
        res.status(200).json(department)
    } catch(err) {
        if(err.code === 11000) {
            res.status(400).json({ message: "Department duplicated" })
        } else {
            res.status(500).json({ message: err.message })            
        }
    }
})

router.delete("/:id", async function(req, res) {
    const department = await Department.findById(req.params.id)
    
    try {
        await department.remove()
        res.status(200).json({ message: "Department has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })            
    }    
})

module.exports = router