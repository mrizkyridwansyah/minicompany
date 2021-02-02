const express = require('express')
const router = express.Router()
const Application = require('../models/schema/app')
const Menu = require('../models/schema/menu')
const { getSingleData, getMultipleData } = require('../get-data')

router.post('/', async (req, res) => {
    if(!req.body.name) res.status(400).json({ message: "Name is required"})
    if(!req.body.application) res.status(400).json({ message: "Application is required"})
    if(!req.body.entryPoint) res.status(400).json({ message: "Entry point is required"})
    const app = await getSingleData(Application, req.body.application)
    if(!app) res.status(400).json({ message: "Application didn't exist"})
    const newMenu = new Menu({
        name: req.body.name,
        app: app.name,
        entryPoint: req.body.entryPoint
    })

    if(req.body.logo) newMenu.logo = req.body.logo
    if(req.body.parent) {
        newMenu.parent = req.body.parent  
        newMenu.logo = ""
    }

    try{
        await newMenu.save()
        res.json(newMenu)
    } catch(err) {
        if(err.code === 11000){
            res.status(400).json({ message: "Entry Point duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put('/:id', async (req, res) => {
    if(!req.body.name) res.status(400).json({ message: "Name is required"})
    if(!req.body.entryPoint) res.status(400).json({ message: "Entry point is required"})
    const menu = await getSingleData(Menu, req.params.id)
    if(!menu) res.status(400).json({ message: "Menu didn't exist"})
    menu.name = req.body.name
    menu.entryPoint = req.body.entryPoint
    
    if(req.body.logo) menu.logo = req.body.logo
    if(req.body.parent) {
        menu.parent = req.body.parent  
        menu.logo = ""
    }

    try{
        await menu.save()
        res.json(menu)
    } catch(err) {
        if(err.code === 11000){
            res.status(400).json({ message: "Entry Point duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.delete('/:id', async(req, res) => {
    const menu = await getSingleData(Menu, req.params.id)
    if(!menu) res.status(400).json({ message: "Menu didn't exist"})
    try{
        await Menu.deleteMany({ parent: menu.name }).exec()
        await menu.remove()
        res.json({ message: "Menu has been deleted" })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router