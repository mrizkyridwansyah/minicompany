const express = require('express')
const App = require('../models/schema/app')
const { getSingleData } = require('../get-data')
const router = express.Router()

router.post('/', async (req, res) => {
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })
    const app = new App ({
        name: req.body.name,
        desc: req.body.desc
    })
    
    try{
        await app.save()
        res.json(app)
    } catch(err) {
        if(err.code === 11000){
            res.status(400).json({ message: "Application duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put('/:id', async (req, res) => {
    const app = await getSingleData(App, req.params.id)
    if(!app) res.status(400).json({ message: "Application didn't exist" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })    
    if(!req.body.desc) res.status(400).json({ message: "Description is required" })    
    
    app.name = req.body.name
    app.desc = req.body.desc

    try{
        await app.save()
        res.json(app)
    } catch(err) {
        if(err.code === 11000){
            // const key = Object.keys(err.keyValue)[0]
            res.status(400).json({ message: "Application duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.delete('/:id', async (req, res) => {
    const app = await getSingleData(App, req.params.id)
    if(!app) res.status(400).json({ message: "Application didn't exist" })
    
    try{
        await app.remove()
        res.json({ message: "Application has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router