const JobService = require('../services/jobService')
const logger = require('../logger/logger')

class JobController {

  async createJob(req, res, next) {
    try {
      const { title, description, skillsRequired, deadline, maxApplicants, type } = req.body
      const { userId } = req.params

      await JobService.createJob(title, description, skillsRequired, deadline, maxApplicants, type, userId)
      res.status(200).json({ message: 'Job has been posted succesfully'})
    } catch (error) {
      logger.error(`Error posting the job - ${error.message}`)
      next(error)
    }
  }
}

module.exports = new JobController()
