const express = require('express')
const registerController = require('../controllers/auth.controller')

const appRouter = express.Router()

appRouter.post('/register', registerController)

module.exports = appRouter