const mongoose = require('mongoose')

const users = new mongoose.Schema({

    username : {
        type : String,
        trim : true,
        required : [true, 'username is required.'],
        unique : [true, 'username must be unique.']
    },

    email : {
        type : String,
        trim : true,
        required : [true, 'email is required.'],
        unique : [true, 'email must be unique']
    },

    password : {
        type : String,
        trim : true,
        required : [true, 'password is required.']
    }

}, {timestamps : true})

const userModel = mongoose.model('Users', users)

module.exports = userModel