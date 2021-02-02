require('dotenv').config()
const fetch = require('node-fetch');

async function auth(req, res, next) {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]
    if(!token) next(new Error("Internal Server Error"))
    return fetch(process.env.LOGIN_SSO, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization" : `BEARER ${token}`
        }
    })
    .then(response => {
        if(response.status == 200) {
            next()
        } else{
            next(new Error(response.statusText))
        }
    })
}

module.exports = { auth }