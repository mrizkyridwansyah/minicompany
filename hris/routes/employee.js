const express = require('express')
const router = express.Router()
const Employee = require('../models/schema/employee')
const Division = require('../models/schema/division')
const Department = require('../models/schema/department')
const Salary = require('../models/schema/employee-salary')
const Contract = require('../models/schema/employee-contract')
const photoMimeTypes = ['image/jpeg', 'image/png']
const cvMimeTypes = ['application/pdf']

//Employee Table
router.post("/", async function(req, res) {
    if(!req.body.identityNumber) res.status(400).json({ message: "Identity Number is required" })
    if(!req.body.email) res.status(400).json({ message: "Email is required" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    if(!req.body.placeOfBirth) res.status(400).json({ message: "Place of Birth is required" })
    if(!req.body.dateOfBirth) res.status(400).json({ message: "Date of Birth is required" })
    if(!req.body.nationality) res.status(400).json({ message: "Nationality is required" })
    if(!req.body.division) res.status(400).json({ message: "Division is required" })
    if(!req.body.department) res.status(400).json({ message: "Department is required" })
    if(!req.body.accountBank) res.status(400).json({ message: "Account Bank is required" })
    if(!req.body.jobTitle) res.status(400).json({ message: "Job Title is required" })
    if(!req.body.joinDate) res.status(400).json({ message: "Join Date is required" })
    if(!req.body.status) res.status(400).json({ message: "Status Employee is required" })
    if(!req.body.user) res.status(400).json({ message: "User Employee is required" })

    const divisionExists = (await Division.find({ name: req.body.division })).length > 0
    if(!divisionExists) res.status(400).json({ message: "Division didn't exists" })
    const departmentExists = (await Department.find({ name: req.body.department })).length > 0
    if(!departmentExists) res.status(400).json({ message: "Department didn't exists" })

    // Employee Id = Join Date + Count employee.
    const nextId = (await Employee.find({ joinDate: req.body.joinDate })).length + 1
    const employeeId = req.body.joinDate.replace("-","").replace('-','') + nextId.toString().padStart(3, "0")
    let newEmployee = new Employee({
        employeeId: employeeId,
        identityNumber: req.body.identityNumber,
        email: req.body.email,
        name: req.body.name,
        placeOfBirth: req.body.placeOfBirth,
        dateOfBirth: req.body.dateOfBirth,
        nationality: req.body.nationality,
        division: req.body.division,
        department: req.body.department,
        accountBank: req.body.accountBank,
        jobTitle: req.body.jobTitle,
        status: req.body.status,
        joinDate: req.body.joinDate,
        usernameEmployee: req.body.user
    })

    if(req.body.identityAddress) newEmployee.identityAddress = req.body.identityAddress
    if(req.body.identitySubDistrict) newEmployee.identitySubDistrict = req.body.identitySubDistrict
    if(req.body.identityDistrict) newEmployee.identityDistrict = req.body.identityDistrict
    if(req.body.identityProvince) newEmployee.identityProvince = req.body.identityProvince
    if(req.body.phoneNumber) newEmployee.phoneNumber = req.body.phoneNumber

    // saveFileUpload(newEmployee, req.body.photo, req.body.cv)

    try {
        await newEmployee.save()
        res.status(200).json(newEmployee)
    } catch(err) {
        if(err.code === 11000){
            const key = Object.keys(err.keyValue)[0]
            res.status(400).json({ message: key.charAt(0).toUpperCase() + key.slice(1) + " duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put("/:id", async function(req, res) {
    if(!req.body.identityNumber) res.status(400).json({ message: "Identity Number is required" })
    if(!req.body.email) res.status(400).json({ message: "Email is required" })
    if(!req.body.name) res.status(400).json({ message: "Name is required" })
    if(!req.body.placeOfBirth) res.status(400).json({ message: "Place of Birth is required" })
    if(!req.body.dateOfBirth) res.status(400).json({ message: "Date of Birth is required" })
    if(!req.body.nationality) res.status(400).json({ message: "Nationality is required" })
    if(!req.body.division) res.status(400).json({ message: "Division is required" })
    if(!req.body.department) res.status(400).json({ message: "Department is required" })
    if(!req.body.accountBank) res.status(400).json({ message: "Account Bank is required" })
    if(!req.body.jobTitle) res.status(400).json({ message: "Job Title is required" })
    if(!req.body.joinDate) res.status(400).json({ message: "Join Date is required" })
    if(!req.body.status) res.status(400).json({ message: "Status Employee is required" })
    if(!req.body.user) res.status(400).json({ message: "User Employee is required" })

    const divisionExists = (await Division.find({ name: req.body.division })).length > 0
    if(!divisionExists) res.status(400).json({ message: "Division didn't exists" })
    const departmentExists = (await Department.find({ name: req.body.department })).length > 0
    if(!departmentExists) res.status(400).json({ message: "Department didn't exists" })

    // Employee Id = Join Date + Count employee.
    const employee = await Employee.findById(req.params.id)
    if(!employee) res.status(400).json({ message: "Employee didn't exists"})

    employee.identityNumber= req.body.identityNumber
    employee.email= req.body.email
    employee.name= req.body.name
    employee.placeOfBirth= req.body.placeOfBirth
    employee.dateOfBirth= req.body.dateOfBirth
    employee.nationality= req.body.nationality
    employee.division= req.body.division
    employee.department= req.body.department
    employee.accountBank= req.body.accountBank
    employee.jobTitle= req.body.jobTitle
    employee.joinDate= req.body.joinDate
    employee.status = req.body.status
    employee.usernameEmployee= req.body.user

    if(req.body.identityAddress) employee.identityAddress = req.body.identityAddress
    if(req.body.identitySubDistrict) employee.identitySubDistrict = req.body.identitySubDistrict
    if(req.body.identityDistrict) employee.identityDistrict = req.body.identityDistrict
    if(req.body.identityProvince) employee.identityProvince = req.body.identityProvince
    if(req.body.phoneNumber) employee.phoneNumber = req.body.phoneNumber

    // saveFileUpload(employee, req.body.photo, req.body.cv)

    try {
        await employee.save()
        if(employee.status === "Permanent") {
            await Contract.updateMany({ employeeId: employee.id }, { activeFlag: false })
            res.status(200).json(employee)
        } else {
            res.status(200).json(employee)
        }
    } catch(err) {
        if(err.code === 11000){
            const key = Object.keys(err.keyValue)[0]
            res.status(400).json({ message: key.charAt(0).toUpperCase() + key.slice(1) + " duplicated" })
        } else {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put("/resign/:id", async function(req, res) {
    if(!req.body.resignDate) res.status(400).json({ message: "Resign Date is required" })

    const employee = await Employee.findById(req.params.id)
    if(!employee) res.status(400).json({ message: "Employee didn't exists"})

    employee.resignDate = req.body.resignDate
    employee.activeFlag = false

    try {
        await employee.save()
        await Contract.updateMany({ employeeId: employee.id }, { activeFlag: false })
        res.status(200).json(employee)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/updatestatus/:id", async function(req, res) {
    const employee = await Employee.findById(req.params.id)
    if(!employee) res.status(400).json({ message: "Employee didn't exists"})

    employee.activeFlag = !employee.activeFlag

    try {
        await employee.save()
        res.status(200).json(employee)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Employee Salary
router.post("/salary/:idemployee", async function(req, res) {
    if(!req.body.amount) res.status(400).json({ message: "Amount of Salary is required"})
    if(isNaN(req.body.amount)) res.status(400).json({ message: "Amount of Salary is invalid"})
    if(!req.body.createBy) res.status(400).json({ message: "Created By is required"})

    const employee = await Employee.findById(req.params.idemployee)
    if(!employee) res.status(400).json({ message: "Employee didn't exists"})

    const newSalary = new Salary({
        employeeId: employee.id,
        job: employee.jobTitle,
        division: employee.division,
        department: employee.department,        
        amount: req.body.amount,        
        createBy: req.body.createBy,        
        updateBy: req.body.createBy        
})
    
    try {
        await Salary.updateMany({ employeeId: employee.id }, { activeFlag: false })
        await newSalary.save()
        res.status(200).json(newSalary)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

router.put("/salary/:id", async function (req, res) {
    if(!req.body.amount) res.status(400).json({ message: "Amount of Salary is required"})
    if(isNaN(req.body.amount)) res.status(400).json({ message: "Amount of Salary is invalid"})
    if(!req.body.updateBy) res.status(400).json({ message: "Updated By is required"})

    const salary = await Salary.findById(req.params.id)
    if(!salary) res.status(400).json({ message: "Employee Salary didn't exists"})

    salary.amount = req.body.amount
    salary.updateBy = req.body.updateBy
    salary.updateAt = Date.now()

    try {
        await salary.save()
        res.status(200).json(salary)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// Employee Contract
router.post("/contract/:idemployee", async function(req, res) {
    if(!req.body.dateFrom) res.status(400).json({ message: "From Date is required"})
    if(!req.body.dateUntil) res.status(400).json({ message: "Until Date is required"})
    if(!req.body.createBy) res.status(400).json({ message: "Created By is required"})

    const employee = await Employee.findById(req.params.idemployee)
    if(!employee) res.status(400).json({ message: "Employee didn't exists"})
    if(employee.status === "Permanent") {
        res.status(400).json({ message: "Employee Status is Permanent"})
    } else {
        const newContract = new Contract({
            employeeId: employee.id,
            dateFrom: req.body.dateFrom,
            dateUntil: req.body.dateUntil,
            createBy: req.body.createBy,        
            updateBy: req.body.createBy        
        })
        
        try {
            await Contract.updateMany({ employeeId: employee.id }, { activeFlag: false })
            await newContract.save()
            res.status(200).json(newContract)
        } catch(err) {
            res.status(500).json({ message: err.message })
        }
    }
})

router.put("/contract/:id", async function (req, res) {
    if(!req.body.dateFrom) res.status(400).json({ message: "From Date is required"})
    if(!req.body.dateUntil) res.status(400).json({ message: "Until Date is required"})
    if(!req.body.updateBy) res.status(400).json({ message: "Updated By is required"})

    const contract = await Contract.findById(req.params.id)
    if(!contract) res.status(400).json({ message: "Employee Contract didn't exists"})

    contract.dateFrom = req.body.dateFrom
    contract.dateUntil = req.body.dateUntil
    contract.updateBy = req.body.updateBy
    contract.updateAt = Date.now()

    try {
        await contract.save()
        res.status(200).json(contract)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

function saveFileUpload(employee, photoEncoded, cvEncoded) {
    if(photoEncoded == null || cvEncoded == null) return
    console.log(photoEncoded)
    // const photo = JSON.parse(photoEncoded)
    // const cv = JSON.parse(cvEncoded)
    const photo = photoEncoded
    const cv = cvEncoded

    if(photo !== null && photoMimeTypes.includes(photo.type)) {
        employee.photoImg = new Buffer.from(photo.data, 'base64')
        employee.photoType = photo.type
    }

    if(cv !== null && cvMimeTypes.includes(cv.type)) {
        employee.cvDoc = new Buffer.from(cv.data, 'base64')
        employee.cvType = cv.type
    }

}

module.exports = router