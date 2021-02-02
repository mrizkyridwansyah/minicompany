const express = require('express')
const router = express.Router()
const Job = require('../models/schema/job')
const Application = require('../models/schema/application')
const Question = require('../models/schema/question')
const Option = require('../models/schema/option')
const { getSingleData, getMultipleData } = require('../get-data')

router.post("/", async (req, res) => {
    if(!req.body.title) res.status(400).json({ message: "Title is required" })
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })
    if(!req.body.requirement) res.status(400).json({ message: "Requirement is required" })
    if(!req.body.type) res.status(400).json({ message: "Type is required" })
    if(!req.body.minRate) res.status(400).json({ message: "Min. Rate is required" })
    if(!req.body.maxRate) res.status(400).json({ message: "Max. Rate is required" })
    if(req.body.minRate > req.body.maxRate) res.status(400).json({ message:  "Max. Rate must bigger than Min. Rate"})

    const job = new Job({
        title: req.body.title,
        desc: req.body.desc,
        requirement: req.body.requirement,
        type: req.body.type,
        minRate: req.body.minRate,
        maxRate: req.body.maxRate
    })

    try{
        await job.save()
        res.json(job)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/:id", async (req, res) => {
    if(!req.body.title) res.status(400).json({ message: "Title is required" })
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })
    if(!req.body.requirement) res.status(400).json({ message: "Requirement is required" })
    if(!req.body.type) res.status(400).json({ message: "Type is required" })
    if(!req.body.minRate) res.status(400).json({ message: "Min. Rate is required" })
    if(!req.body.maxRate) res.status(400).json({ message: "Max. Rate is required" })

    const job = await getSingleData(Job, req.params.id)
    if(!job) res.status(400).json({ message: "Job didn't exist" })
    if(job.closedFlag) res.status(400).json({ message: "Job has been closed" })

    const applications = await getMultipleData(Application, { jobId: req.params.id } )
    if(applications.length === 0) {
        job.title = req.body.title
        job.desc = req.body.desc
        job.requirement = req.body.requirement
        job.type = req.body.type
    }
    job.minRate = req.body.minRate
    job.maxRate = req.body.maxRate
    job.updateAt = Date.now()
    
    try{
        await job.save()
        res.json(job)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/close/:id", async (req, res) => {
    const job = await getSingleData(Job, req.params.id)
    if(!job) res.status(400).json({ message: "Job didn't exist" })

    job.closedFlag = true
    
    try{
        await job.save()
        res.json(job)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/publish/:id", async (req, res) => {
    let valid = false
    const job = await getSingleData(Job, req.params.id)
    if(!job) res.status(400).json({ message: "Job didn't exist" })
    const questions = await getMultipleData(Question, { jobId: job.id })
    if(questions.length === 0) valid = false
    let validQuestion = 0
    questions.map(async (question) => {
        let answer = 0
        const options = await getMultipleData(Option, { questionId: question.id })
        if(options.length === 0) valid = false
        options.map(option => {
            if(option.value){
                answer++
                validQuestion++
            } 
        })
    })
    
    let totalWeight = questions.reduce((acc, question) => acc + question.weight, 0)
    if(totalWeight !== 100) res.status(400).json({ message: "Total weight question must be 100" })

    if(valid && validQuestion == questions.length) {
        job.publishedFlag = true
        
        try{
            await job.save()
            res.json(job)
        } catch(err) {
            res.status(500).json({ message: err.message })
        }
    } else {
        res.status(500).json({ message: "Question or Option not complete" })
    }
})

module.exports = router