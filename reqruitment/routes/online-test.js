const express = require('express')
const Application = require('../models/schema/application')
const Detail = require('../models/schema/online-test-detail')
const router = express.Router()
const asyncFunction = require('async')

router.post('/', async (req, res) => {
    if(!req.body.applicationId) res.status(400).json({ message: "Job Application is required" })
    if(!req.body.result) res.status(400).json({ message: "Online Test Result is required" })
    if(!req.body.listQA || req.body.listQA.length === 0) res.status(400).json({ message: "Question and Answer is required" })
    if(isNaN(req.body.result)) res.status(400).json({ message: "Online Test Result invalid" })

    const application = await Application.findById( req.body.applicationId )
    if(!application) res.status(400).json({ message: "Job Application didn't exists" })
    // if(application.onlineResultDate !== null) res.status(400).json({ message: "you have done the online test"})

    application.onlineResultDate = Date.now()
    application.onlineResult = req.body.result

    try {
        await application.save()
    } catch(err) {
        await Detail.deleteMany({ applicationId: req.body.applicationId})
        res.status(500).json({ message: err.message })
    }

    asyncFunction.forEach(req.body.listQA, async (qa, callback) => {
        const newDetail = new Detail({
            applicationId: req.body.applicationId,
            questionId: qa.questionId,
            question: qa.question,
            answerId: qa.answerId,
            answer: qa.answer,
            value: qa.value
        })

        try{
            await newDetail.save()            
        } catch(err) {
            await Detail.deleteMany({ applicationId: req.body.applicationId})
            res.status(500).json({ message: err.message })
        }
    }, (err) => {
        if(err) res.status(500).json({ message: err.message })
        res.json({ message: "Test Online success" })
    })
})

module.exports = router