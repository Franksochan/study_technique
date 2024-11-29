const express = require('express')
const router = express.Router()
const AuthController = require('../controller/AuthController')

router.post('/registration', AuthController.register) 
router.post('/verify-email/:email', AuthController.verify)
router.post('/login', AuthController.login)

module.exports = router
