const express = require('express')
const {registerController} = require('../controllers/auth.controller')
const {loginController} = require('../controllers/auth.controller')

const appRouter = express.Router()

appRouter.post('/register', registerController)

appRouter.post('/login', loginController)

module.exports = appRouter