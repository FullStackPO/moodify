const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

function authUser(req, res, next){

    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message : 'unauthorized access'
        })
    }

    try{
       const decoded = jwt.verify(token, process.env.JWT_SECRET)
       req.user = decoded
       next()
    }

    catch(err){
        console.log(err);
    }
}

module.exports = authUser