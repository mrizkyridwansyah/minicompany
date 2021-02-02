const express = require('express')
const RoleAccess = require('../models/schema/role-access')
const Role = require('../models/schema/role')
const App = require('../models/schema/app')
const Menu = require('../models/schema/menu')
const { getSingleData } = require('../get-data')
const { getMultipleData } = require('../../reqruitment/get-data')
const router = express.Router()

router.post('/', async (req, res) => {
    if(!req.body.data) res.status(400).json({ message: "No Data" })
    try{
        await RoleAccess.deleteMany()
        const datas = req.body.data
        datas.map(async(data) => {
            const role = await Role.find({ name: data.role })
            const application = await App.find({ name: data.app })
            const menu = await Menu.find({ name: data.menu })
            if(role && application && menu) {
                const newAccess = new RoleAccess ({
                    role: data.role,
                    app: data.app,
                    menu: data.menu
                })
                await newAccess.save()                    
            }
        })    
        return res.status(200).json({ message: "Access Role has updated"})
    } catch(err) {
        res.status(500).json({ message: err.message})
    }
})

module.exports = router