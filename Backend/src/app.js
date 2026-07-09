const express = require('express')
const cookieParser = require('cookie-parser')
const appRouter = require('./routes/auth.route')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', appRouter)

module.exports = app