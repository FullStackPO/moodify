const express = require('express')
const {registerController} = require('../controllers/auth.controller')
const {loginController} = require('../controllers/auth.controller')
const {getMe} = require('../controllers/auth.controller')
const authUser = require('../middleware/auth.middleware')

const appRouter = express.Router()

appRouter.post('/register', registerController)

appRouter.post('/login', loginController)

appRouter.get('/get-me', authUser, getMe)

module.exports = appRouter