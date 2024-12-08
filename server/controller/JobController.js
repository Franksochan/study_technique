const JobService = require('../services/jobService')
const logger = require('../logger/logger')

class JobController {

  async createJob(req, res, next) {
    try {
      const { title, description, skillsRequired, deadline, maxApplicants, type } = req.body
      const { userId } = req.params

      await JobService.createJob(title, description, skillsRequired, deadline, maxApplicants, type, userId)
      res.status(201).json({ message: 'Job has been posted succesfully'})
    } catch (error) {
      logger.error(`Error posting the job - ${error.message}`)
      next(error)
    }
  }

  async fetchJobs(req, res, next) {
    try {
      const { jobCategory } = req.params
  
      const filteredJobs = await JobService.fetchJob(jobCategory)
      res.status(200).json({ jobs: filteredJobs, message: `Jobs fetched succesfully`})
    } catch (error) {
      logger.error(`Error fetching the jobs - ${error.message}`)
      next(error)
    }
  }

  async deleteJobs(req, res, next) {
    try {
      const { userId, jobId } = req.params
      await JobService.deleteJobs(userId, jobId) 
      res.status(200).json({ message: 'Job post succesfully deleted' })
    } catch (error) {
      logger.error(`Error deleting the job post - ${error.message}`)
      next(error)
    }
  }

  async getJobDetails(req, res, next) {
    try {
      const { jobId } = req.params
      const job = await JobService.getJobDetails(jobId)
      res.status(200).json({ job, message: 'Job details fetched succesfully'})
    } catch (error) {
      logger.error(`Error fetching the job details - ${error.message}`)
      next(error)
    }
  }

  async getJobApplicants(req, res, next) {
    try {
      const { jobId } = req.params
      const applicants = await JobService.getJobApplicants(jobId)
      res.status(200).json({ applicants, message: 'Job applicants fetched succesfully'})
    } catch (error) {
      logger.error(`Error fetching the job applicants - ${error.message}`)
      next(error)
    }
  }
}

module.exports = new JobController()
