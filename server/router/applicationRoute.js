const express = require('express')
const router = express.Router()
const ApplicationController = require('../controller/ApplicationController')
const { upload } = require('../middleware/multer')
const { verifyToken } = require('../middleware/jsonWebTokens')

router.post('/apply-job/:jobId/:applicantId', verifyToken, upload, ApplicationController.applyJob)
router.post('/offer-job/:jobId/:applicantId', verifyToken, ApplicationController.offerJob)
router.delete('/reject-job/:jobId/:applicantId', verifyToken, ApplicationController.rejectJob)

module.exports = router