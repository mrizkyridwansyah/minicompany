const express = require('express')
const router = express.Router()
const Candidate = require('../models/schema/candidate')
const Job = require('../models/schema/job')
const Application = require('../models/schema/application')
const { getSingleData } = require('../get-data')

router.post("/", async (req, res) => {
    const candidate = await getSingleData(Candidate, req.body.candidateId)
    if(!candidate) res.status(400).json({ message: "Candidate didn't exist" })
    const job = await getSingleData(Job, req.body.jobId)
    if(!job) res.status(400).json({ message: "Job didn't exist" })
    
    const application = new Application({
        jobId: job.id,
        jobTitle: job.title,
        candidateId: candidate.id,
        candidateName: candidate.name
    })

    try{
        await application.save()
        res.json(application)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/:id", async (req, res) => {
    if(!req.body.updateBy) res.status(400).json({ message: "Modifier user is required" })

    const application = await getSingleData(Application, req.params.id)
    if(!application) res.status(400).json({ message: "Job Application didn't exist" })

    application.notes = req.body.notes
    application.updateAt = Date.now()
    application.updateBy = req.body.updateBy

    try{
        await application.save()
        res.json(application)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/test/:id", async (req, res) => {
    if(!req.body.result) res.status(400).json({ message: "Result invalid" })
    if(!req.body.updateBy) res.status(400).json({ message: "Modifier user is required" })
    const application = await getSingleData(Application, req.params.id)
    if(!application) res.status(400).json({ message: "Job Application didn't exist" })
    
    application.onlineResult = req.body.result
    application.onlineResultDate = Date.now()
    application.updateAt = Date.now()
    application.updateBy = req.body.updateBy

    try{
        await application.save()
        res.json(application)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }

})

router.put("/updatestatus/:id", async (req, res) => {
    if(!req.body.status) res.status(400).json({ message: "Status is required" })
    const application = await getSingleData(Application, req.params.id)
    if(!application) res.status(400).json({ message: "Job Application didn't exist" })

    application.status = req.body.status
    application.updateAt = Date.now()
    application.updateBy = req.body.updateBy    

    try{
        await application.save()
        await Candidate.findByIdAndUpdate(application.candidateId, { status: req.body.status }).exec()
        res.json(application)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router