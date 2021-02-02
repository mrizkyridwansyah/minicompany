const express = require('express')
const router = express.Router()
const Question = require('../models/schema/question')
const Option = require('../models/schema/option')
const { getSingleData, getMultipleData } = require('../get-data')

router.post("/", async (req, res) => {
    //Technical Validation
    if(!req.body.questionId) res.status(400).json({ message: "Question is required" })
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })
    if(!req.body.createBy) res.status(400).json({ message: "Creator user is required" })
    
    //Check Job exist
    const question = await getSingleData(Question, req.body.questionId)
    if(!question) res.status(400).json({ message: "Question didn't exist" })

    const option = new Option({
        questionId: req.body.questionId,
        desc: req.body.desc,
        value: req.body.value,
        createBy: req.body.createBy,
        updateBy: req.body.createBy
    })

    try{
        await option.save()
        res.json()
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/:id", async (req, res) => {
    if(!req.body.questionId) res.status(400).json({ message: "Question is required" })
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })
    if(!req.body.updateBy) res.status(400).json({ message: "Modifier user is required" })

    const option = await getSingleData(Option, req.params.id)
    if(!option) res.status(400).json({ message: "Option didn't exist" })

    option.desc = req.body.desc
    option.value = req.body.value
    option.updateBy = req.body.updateBy
    option.updateAt = Date.now()

    try{
        await option.save()
        res.json()
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete("/:id", async (req, res) => {
    const option = await getSingleData(Option, req.params.id)
    if(!option) res.status(400).json({ message: "Option didn't exist" })

    try{
        await option.remove()
        res.status(200).json({ message: "Option has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router