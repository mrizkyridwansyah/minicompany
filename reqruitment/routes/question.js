const express = require('express')
const asyncFunction = require('async')
const router = express.Router()
const Job = require('../models/schema/job')
const Question = require('../models/schema/question')
const Option = require('../models/schema/option')
const { getSingleData, getMultipleData } = require('../get-data')

router.post("/", async (req, res) => {
    //Technical Validation
    if(!req.body.jobId) res.status(400).json({ message: "Job is required" })
    if(!req.body.type) res.status(400).json({ message: "Type is required" })
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })
    if(!req.body.weight) res.status(400).json({ message: "Weight is required" })
    if(!req.body.createBy) res.status(400).json({ message: "Creator user is required" })
    if(req.body.weight === 0) res.status(400).json({ message: "Weight must more than 0" })
    if(req.body.options.length === 0) res.status(400).json({ message: "Options is required" })    

    //Check Job exist
    const job = await getSingleData(Job, req.body.jobId)
    if(!job) res.status(400).json({ message: "Job didn't exist" })

    req.body.options.map(option => {
        if(!option.desc) res.status(400).json({ message: "Option description is required" })
    })

    let rightAnswer = req.body.options.filter(option => option.value).length
    if(rightAnswer === 0) res.status(400).json({ message: "Please choose the correct answer" })
    if(req.body.type === "Single" && rightAnswer !== 1) res.status(400).json({ message: "More than 1 correct answer" })

    const question  = new Question({
        jobId: req.body.jobId,
        type: req.body.type,
        desc: req.body.desc,
        weight: req.body.weight,
        createBy: req.body.createBy,
        updateBy: req.body.createBy
    })

    try{
        await question.save()
        let options = []
        asyncFunction.forEach(req.body.options, async function(option, callback) {
            const newOption = new Option({
                questionId: question._id,
                desc: option.desc,
                value: option.value,
                createBy: question.createBy,
                updateBy: question.createBy        
            })

            try{
                await newOption.save()
                options.push(newOption)
            } catch(err) {
                await Option.deleteMany({ questionId: question._id });
                await question.remove();
                res.status(500).json({ message: err.message })
            }
        }, async function(err) {
            if(err) {
                await question.remove();
                res.status(500).json({ message: err.message })
            } 
            res.json({ question: question, options: options})
        })          
    } catch(err) {
        await question.remove();
        res.status(500).json({ message: err.message })
    }
})

router.put("/:id", async (req, res) => {
    if(!req.body.type) res.status(400).json({ message: "Type is required" })
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })
    if(!req.body.weight) res.status(400).json({ message: "Weight is required" })
    if(!req.body.updateBy) res.status(400).json({ message: "Creator user is required" })
    if(req.body.options.length === 0) res.status(400).json({ message: "Options is required" })    

    const question = await getSingleData(Question, req.params.id)
    if(!question) res.status(400).json({ message: "Question didn't exist" })

    req.body.options.map(option => {
        if(!option.desc) res.status(400).json({ message: "Option description is required" })
    })

    let rightAnswer = req.body.options.filter(option => option.value).length
    if(rightAnswer === 0) res.status(400).json({ message: "Please choose the correct answer" })
    if(req.body.type === "Single" && rightAnswer !== 1) res.status(400).json({ message: "More than 1 correct answer" })

    question.desc = req.body.desc
    question.type = req.body.type
    question.weight = req.body.weight
    question.updateBy = req.body.updateBy
    question.updateAt = Date.now()

    try{
        await question.save()
        await Option.deleteMany({ questionId: req.params.id })
        let options = []
        asyncFunction.forEach(req.body.options, async function(option, callback) {
            const newOption = new Option({
                questionId: req.params.id,
                desc: option.desc,
                value: option.value,
                createBy: question.createBy,
                updateBy: question.createBy        
            })

            try{
                await newOption.save()
                options.push(newOption)
            } catch(err) {
                res.status(500).json({ message: err.message })
            }
        }, function(err) {
            if(err) res.status(500).json({ message: err.message })
            res.json({ question: question, options: options})
        })          
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete("/:id", async (req, res) => {
    const question = await getSingleData(Question, req.params.id)
    if(!question) res.status(400).json({ message: "Question didn't exist" })

    try{
        await Option.deleteMany({ questionId: question.id })
        await question.remove()
        res.status(200).json({ message: "Question has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.post("/copy", async(req, res) => {
    if(!req.body.origin) res.status(400).json({ message: "Origin job is required" })
    if(!req.body.destination) res.status(400).json({ message: "Destination job is required" })
    if(!req.body.createBy) res.status(400).json({ message: "Creator user is required" })

    const questions = await getMultipleData(Question, { jobId: req.body.origin })
    if(questions.length === 0) res.status(400).json({ message: "Question didn't exist" })

    asyncFunction.forEach(questions, async (question, callback) => {        
        const options = await getMultipleData(Option, { questionId: question.id })
        if(options.length === 0) res.status(400).json({ message: "Option didn't exist" })
        question.options = options
        const newQuestion = new Question({
            jobId: req.body.destination,
            type: question.type,
            desc: question.desc,
            weight: question.weight,
            createBy: req.body.createBy,
            updateBy: req.body.createBy
        })   

        try{
            await newQuestion.save()
            options.map(async (option) => {
                const newOption = new Option({
                    questionId: newQuestion._id,
                    desc: option.desc,
                    value: option.value,
                    createBy: req.body.createBy,
                    updateBy: req.body.createBy
                })
    
                try{
                    await newOption.save()
                } catch(err) {
                    await Option.deleteMany({ questionId: newQuestion._id })
                    await Question.deleteMany({ jobId: req.body.destination })
                    res.status(500).json({ message: err.message })
                }
            })     
        } catch(err) {
            await Question.deleteMany({ jobId: req.body.destination })
            res.status(500).json({ message: err.message })
        }
    }, function (err) {
        if(err) res.status(500).json({ message: err.message })
        res.json({ message: "Copy Question success" })
    })
})

module.exports = router