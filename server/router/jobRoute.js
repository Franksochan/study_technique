const express = require('express')
const router = express.Router()
const JobController = require('../controller/JobController')

router.post('/create-job/:userId', JobController.createJob)
router.get('/get-jobs/:jobCategory', JobController.fetchJobs)
router.delete('/delete-job/:userId/:jobId', JobController.deleteJobs)

module.exports = router