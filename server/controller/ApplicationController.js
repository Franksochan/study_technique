const ApplicationService = require('../services/applicationService')
const logger = require('../logger/logger')

class ApplicationController {
  // Apply for a job
  async applyJob(req, res, next) {
    try {
      const { jobId, applicantId } = req.params
      const { file }  = req
      const { coverLetter } = req.body

      console.log(applicantId, jobId, file)
      await ApplicationService.applyJob(applicantId, jobId, file, coverLetter)
      res.status(201).json({ message: 'Application successful! Please wait as the client review application' })
    } catch (error) {
      logger.error(`Application error - ${error.message}`)
      next(error)
    }
  }

  async offerJob(req, res, next) {
    try {
      const { jobId, applicantId } = req.params
      await ApplicationService.offerJob(jobId, applicantId) 
      res.status(200).json({ message: 'Offered the job succesfully, confirmation email for both sides has been sent' })
    } catch (error) {
      logger.error(`Offer error - ${error.message}`)
      next(error)
    }
  }
}

module.exports = new ApplicationController()