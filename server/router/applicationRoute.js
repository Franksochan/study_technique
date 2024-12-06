const express = require('express')
const router = express.Router()
const ApplicationController = require('../controller/ApplicationController')
const { upload } = require('../middleware/multer')

router.post('/apply-job/:jobId/:applicantId', upload, ApplicationController.applyJob)

module.exports = router