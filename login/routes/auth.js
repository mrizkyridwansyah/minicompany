require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/schema/user')
const { getMultipleData, getSingleData } = require('../get-data')
const router = express.Router()

router.post('/login',async (req, res) => {
    if(!req.body.username) res.status(400).json({ message: "Username is required" })
    if(!req.body.password) res.status(400).json({ message: "Password is required" })
    
    const user = await User.findOne({ username: req.body.username })
    if(!user) res.status(400).json({ message: "User didn't exist" })
    if(!user.activeFlag) res.status(400).json({ message: "User inactive" })

    jwt.verify(user.token, process.env.TOKEN_SECRET, async (err, result) => {
        if(err === null) {
            res.status(400).json({ message: "User has Logged In" })            
        } else {
            if(await bcrypt.compare(req.body.password, user.password)){
                const data = {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    employeeId: user.employeeId             
                }
                const token = await jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '1h'})
                user.token = token
                user.updateAt = Date.now()
                user.wrongPass = 0
                await user.save()
                res.status(200).json({
                    token: user.token,
                    data: data
                })
            } else {
                let message = ""
                user.updateAt = Date.now()
                user.wrongPass = user.wrongPass + 1
                message = `Wrong password ${user.wrongPass}x.\n User will be block if wrong password 3 times`
                if(user.wrongPass >= 3){
                    user.activeFlag = false
                    message = `User has been blocked. Please call Administrator`
                }
                await user.save()
                res.status(400).json({ message: message })
            }
        }
    })            
})

router.post('/logout', async (req, res) => {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]
    if(!token) res.status(400).json({ message: "Token is required" })
    const users = await getMultipleData(User, { token: token })
    if(users.length === 0) {
        res.status(400).json({ message: "User didn't exist" })
    } else {
        const user = users[0]
        user.token = null
        user.updateAt = Date.now()
        await user.save()
        res.status(200).json({ message: "Logout" })
    }
})

router.get("/", (req, res) => {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]
    if(!token) res.status(403).json({ message: "FORBIDDEN" })
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, result) => {
        if(err) res.status(500).json(err.message)
        const user = await getSingleData(User,result.id)
        if(!user) res.status(400).json({ message: "User didn't exist" })
        if(!user.token)  res.status(403).json({ message: "FORBIDDEN" })
        res.status(200).json({ message: "success" })
    })
})

async function auth(req, res, next) {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]
    if(!token) res.status(403).json({ message: "FORBIDDEN" })
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, result) => {
        if(err) res.status(403).json({ message: err.message })
        const user = await getSingleData(User,result.id)
        if(!user) res.status(400).json({ message: "User didn't exist" })
        if(!user.token)  res.status(403).json({ message: "FORBIDDEN" })
        next()
    })
}

module.exports = { router , auth }