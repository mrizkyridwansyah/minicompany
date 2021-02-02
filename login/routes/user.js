const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/schema/user')
const { getSingleData } = require('../get-data')
const router = express.Router()

router.post('/', async (req, res) => {
    if(!req.body.username) res.status(400).json({ message: "Username is required" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    if(!req.body.email) res.status(400).json({ message: "Email is required" })
    if(!req.body.role) res.status(400).json({ message: "Role is required" })
    if(!req.body.password || !req.body.confirmPassword) res.status(400).json({ message: "Password & Confirm Password is required" })
    if(req.body.password !== req.body.confirmPassword) res.status(400).json({ message: "Password & Confirm Password didn't match" })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(req.body.password, salt)
    const user = new User ({
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: passwordHash,
        role: req.body.role
    })
    
    try{
        await user.save()
        res.json(user)
    } catch(err) {
        if(err.code === 11000){
            const key = Object.keys(err.keyValue)[0]
            res.status(400).json({ message: key.charAt(0).toUpperCase() + key.slice(1) + " duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put('/:id', async (req, res) => {
    const user = await getSingleData(User, req.params.id)
    if(!user) res.status(400).json({ message: "User didn't exist" })
    if(!req.body.username) res.status(400).json({ message: "Username is required" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    if(!req.body.email) res.status(400).json({ message: "Email is required" })
    if(!req.body.role) res.status(400).json({ message: "Role is required" })
    if(req.body.password && req.body.confirmPassword) {
        if(req.body.password !== req.body.confirmPassword) res.status(400).json({ message: "Password & Confirm Password didn't match" })
        
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(req.body.password, salt)
        user.password = passwordHash
    }
    
    user.username = req.body.username,
    user.name = req.body.name,
    user.email = req.body.email,
    user.role = req.body.role
    
    try{
        await user.save()
        res.json(user)
    } catch(err) {
        if(err.code === 11000){
            const key = Object.keys(err.keyValue)[0]
            res.status(400).json({ message: key.charAt(0).toUpperCase() + key.slice(1) + " duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put('/update-employee/:username', async(req, res) => {
    if(!req.body.employeeId) res.status(400).json({ message: "Employee ID is required" })

    const destinationUser = await User.findOne({ username: req.params.username })
    if(!destinationUser) res.status(400).json({ message: "Destination User didn't exist" })

    destinationUser.employeeId = req.body.employeeId
    
    try{
        await User.findOneAndUpdate({ employeeId: req.body.employeeId }, { employeeId: null })
        await destinationUser.save()
        res.json(destinationUser)
    } catch(err) {
        if(err.code === 11000){
            const key = Object.keys(err.keyValue)[0]
            res.status(400).json({ message: key.charAt(0).toUpperCase() + key.slice(1) + " duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }    
})
router.delete('/:id', async (req, res) => {
    const user = await getSingleData(User, req.params.id)
    if(!user) res.status(400).json({ message: "User didn't exist" })
    
    try{
        await user.remove()
        res.json({ message: "User has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put('/updatestatus/:id', async (req, res) => {
    const user = await getSingleData(User, req.params.id)
    if(!user) res.status(400).json({ message: "User didn't exist" })
    user.activeFlag = !user.activeFlag

    try{
        await user.save()
        res.json(user)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router