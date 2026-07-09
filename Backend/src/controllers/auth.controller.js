const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function registerController(req,res){

    const {username, email, password} = req.body
   
    try{

    const isUserAlreadyExist = await userModel.findOne({
        $or : [{username}, {email}]
    })

    if(isUserAlreadyExist){
        return res.status(400).json({
            message : 'User is Already Exist '
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username, 
        email, 
        password : hash})

    const token = jwt.sign({
        id : user._id,
        username : user.username,
        email : user.email
    }, process.env.JWT_SECRET, {
        expiresIn : '2h'
    })

    res.cookie("token", token)

    res.status(201).json({
        'message' : 'user register successfully',
        'username' : username,
        'email' : email
    })
   }

   catch(err){
    console.log(err)
   }

}

module.exports =  registerController