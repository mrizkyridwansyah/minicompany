const express = require('express')
const router = express.Router()
const Division = require('../models/schema/division')

router.post("/", async function(req, res) {
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    
    const newDivision = new Division({ name: req.body.name })
    try {
        await newDivision.save()
        res.status(200).json(newDivision)
    } catch(err) {
        if(err.code === 11000) {
            res.status(400).json({ message: "Division duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put("/:id", async function(req, res) {
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    
    const division = await Division.findById(req.params.id)
    division.name = req.body.name

    try {
        await division.save()
        res.status(200).json(division)
    } catch(err) {
        if(err.code === 11000) {
            res.status(400).json({ message: "Division duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.delete("/:id", async function(req, res) {
    const division = await Division.findById(req.params.id)

    try {
        await division.remove()
        res.status(200).json({ message: "Division has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
