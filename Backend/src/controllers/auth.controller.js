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

async function loginController(req,res){

    const {username, email, password} = req.body;

    const user = await userModel.findOne({
        $or:[{username} , {email}]
    })

    if(!user){
        return res.status(400).json({
            'message' : 'Invalid Credentials'
        })
        }

    const hashPassword = await bcrypt.compare(password, user.password)

    if(!hashPassword){
        return res.status(400).json({
            'message' : 'Invalid Credentials'
        })
    }

    const token = jwt.sign({
        id : user._id,
        username : user.username,
        email : user.email
    }, process.env.JWT_SECRET, {
        expiresIn : '2h'
    })

    res.cookie("token", token)

    res.status(200).json({
        'message':'user login successfully',
        'username' : user.username,
        'email' : user.email
    })
}

module.exports =  {registerController , loginController}