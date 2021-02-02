const express = require('express')
const Role = require('../models/schema/role')
const { getSingleData } = require('../get-data')
const router = express.Router()

router.post('/', async (req, res) => {
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    const role = new Role ({
        name: req.body.name,
    })
    
    try{
        await role.save()
        res.json(role)
    } catch(err) {
        if(err.code === 11000){
            res.status(400).json({ message: "Role duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put('/:id', async (req, res) => {
    const role = await getSingleData(Role, req.params.id)
    if(!role) res.status(400).json({ message: "Role didn't exist" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })    
    role.name = req.body.name
    
    try{
        await role.save()
        res.json(role)
    } catch(err) {
        if(err.code === 11000){
            const key = Object.keys(err.keyValue)[0]
            res.status(400).json({ message: "Role duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.delete('/:id', async (req, res) => {
    const role = await getSingleData(Role, req.params.id)
    if(!role) res.status(400).json({ message: "Role didn't exist" })
    
    try{
        await role.remove()
        res.json({ message: "Role has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router