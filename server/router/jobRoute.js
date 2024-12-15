const express = require('express')
const router = express.Router()
const JobController = require('../controller/JobController')
const { verifyToken } = require('../middleware/jsonWebTokens')

router.post('/create-job/:userId', verifyToken, JobController.createJob)
router.get('/get-jobs/:jobCategory', verifyToken, JobController.fetchJobs)
router.delete('/delete-job/:userId/:jobId', verifyToken, JobController.deleteJobs)
router.get('/get-job-details/:jobId', verifyToken, JobController.getJobDetails)
router.get('/get-job-applicants/:jobId', verifyToken, JobController.getJobApplicants)

module.exports = router