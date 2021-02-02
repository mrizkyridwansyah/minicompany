const express = require('express')
const router = express.Router()
const Candidate = require('../models/schema/candidate')
const Application = require('../models/schema/application')
const { getSingleData } = require('../get-data')
const photoMimeTypes = ['image/jpeg', 'image/png']
const cvMimeTypes = ['application/pdf']

router.post("/", async (req, res) => {
    if(!req.body.identityNumber) res.status(400).json({ message: "Identity Number is required" })
    if(!req.body.email) res.status(400).json({ message: "Email is required" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    if(!req.body.placeOfBirth) res.status(400).json({ message: "Place of Birth is required" })
    if(!req.body.dateOfBirth) res.status(400).json({ message: "Date of Birth is required" })
    if(!req.body.nationality) res.status(400).json({ message: "Nationality is required" })
    if(!req.body.phone) res.status(400).json({ message: "Phone Number is required" })

    const candidate = new Candidate({
        identityNumber: req.body.identityNumber,
        email: req.body.email,
        name: req.body.name,
        placeOfBirth: req.body.placeOfBirth,
        dateOfBirth: req.body.dateOfBirth,
        nationality: req.body.nationality,
        identityAddress: req.body.identityAddress,
        identitySubDistrict: req.body.identitySubDistrict,
        identityDistricts: req.body.identityDistricts,
        identityProvince: req.body.identityProvince,
        phoneNumber: req.body.phone
    })

    saveFileUpload(candidate, req.body.photo, req.body.cv)

    try{
        await candidate.save()
        res.json(candidate)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/:id", async (req, res) => {
    if(!req.body.identityNumber) res.status(400).json({ message: "Identity Number is required" })
    if(!req.body.email) res.status(400).json({ message: "Email is required" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    if(!req.body.placeOfBirth) res.status(400).json({ message: "Place of Birth is required" })
    if(!req.body.dateOfBirth) res.status(400).json({ message: "Date of Birth is required" })
    if(!req.body.nationality) res.status(400).json({ message: "Nationality is required" })
    if(!req.body.phone) res.status(400).json({ message: "Phone Number is required" })
    if(!req.body.identityAddress) res.status(400).json({ message: "Identity Address is required" })
    if(!req.body.identitySubDistrict) res.status(400).json({ message: "Identity Subdistrict is required" })
    if(!req.body.identityDistricts) res.status(400).json({ message: "Identity District is required" })
    if(!req.body.identityProvince) res.status(400).json({ message: "Identity Province is required" })

    const candidate = await getSingleData(Candidate, req.params.id)
    if(!candidate) res.status(400).json({ message: "Candidate didn't exist" })
    candidate.identityNumber= req.body.identityNumber
    candidate.email= req.body.email
    candidate.name= req.body.name
    candidate.placeOfBirth= req.body.placeOfBirth
    candidate.dateOfBirth= req.body.dateOfBirth
    candidate.nationality= req.body.nationality
    candidate.identityAddress= req.body.identityAddress
    candidate.identitySubDistrict= req.body.identitySubDistrict
    candidate.identityDistricts= req.body.identityDistricts
    candidate.identityProvince= req.body.identityProvince
    candidate.phoneNumber = req.body.phone

    saveFileUpload(candidate, req.body.photo, req.body.cv)

    try{
        await candidate.save()
        res.json(candidate)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete("/:id", async (req, res) => {
    const candidate = await getSingleData(Candidate, req.params.id)
    if(!candidate) res.status(400).json({ message: "Candidate didn't exist" })
    
    try{
        await candidate.remove()
        res.status(200).json({ message: "Candidate has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/updatestatus/:id", async (req, res) => {
    if(!req.body.status) res.status(400).json({ message: "Status is required" })
    const candidate = await getSingleData(Candidate, req.params.id)
    if(!candidate) res.status(400).json({ message: "Candidate didn't exist" })
    candidate.status = req.body.status

    
    try{
        await candidate.save()
        await Application.findOneAndUpdate({ candidateId: req.params.id, status: [{ $ne: "Accepted "}, { $ne: "Failed"}]}, {status: req.body.status})
        res.json(candidate)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

function saveFileUpload(candidate, photoEncoded, cvEncoded) {
    if(photoEncoded == null || cvEncoded == null) return
    const photo = JSON.parse(photoEncoded)
    const cv = JSON.parse(cvEncoded)

    if(photo !== null && photoMimeTypes.includes(photo.type)) {
        candidate.photoImg = new Buffer.from(photo.data, 'base64')
        candidate.photoType = photo.type
    }

    if(cv !== null && cvMimeTypes.includes(cv.type)) {
        candidate.cvDoc = new Buffer.from(cv.data, 'base64')
        candidate.cvType = cv.type
    }
}

module.exports = router