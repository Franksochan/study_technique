const express = require('express')
const router = express.Router()
const TokenController = require('../controller/TokenController')

router.post('/refresh', TokenController.refreshAccessToken)

module.exports = router