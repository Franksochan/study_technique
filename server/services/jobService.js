const User = require('../models/user')
const Job = require('../models/job')
const Application = require('../models/application')
const logger = require('../logger/logger')
const JOB_TYPES = require('../constants/jobTypes')
const validator = require('validator')
const { isAfter } = require('date-fns') 
const { findMissingParams } = require('../utils/paramsValidator')

class JobService {

  async createJob(title, description, skillsRequired, deadline, maxApplicants, type, userId) {
    try {
      // Ensure required fields are provided and valid
      const requiredParams = { title, description, skillsRequired, deadline, maxApplicants, type, userId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message: "Missing required fields: title, description, skillsRequired, deadline, type and userId are required." }
      }

      // Log sanitized inputs (excluding sensitive data)
      logger.info(`Creating job with title: ${title} and type: ${type}`)

      // Validate and sanitize each input using validator functions

      // Check title - validate length and sanitize
      if (!validator.isLength(title, { min: 5, max: 100 }) || typeof title !== 'string') {
        throw { status: 400, message: "Title must be a string between 5 and 100 characters." }
      }
      title = validator.escape(title)  // Sanitize title to prevent special character injection

      // Check description - validate length and sanitize
      if (!validator.isLength(description, { min: 10 }) || typeof description !== 'string') {
        throw { status: 400, message: "Description must be a string with at least 10 characters." }
      }
      description = validator.escape(description)

      // Validate skillsRequired is an array of strings
      if (!Array.isArray(skillsRequired) || skillsRequired.some(skill => typeof skill !== 'string' || !validator.isAlphanumeric(skill.replace(/\s/g, '')))) {
        throw { status: 400, message: "SkillsRequired must be an array of alphanumeric strings." }
      }

      // Check deadline is a valid ISO date and in the future
      if (!validator.isISO8601(deadline.toString()) || !isAfter(new Date(deadline), new Date())) {
        throw { status: 400, message: "Deadline must be a valid future date." }
      }

      // Validate userId format if it's an ObjectId
      if (!validator.isMongoId(userId.toString())) {
        throw { status: 400, message: "Invalid userId format." }
      }

      // Validate maxApplicants
      if (maxApplicants !== undefined) {
        if (typeof maxApplicants !== 'number' || !Number.isInteger(maxApplicants) || maxApplicants <= 0) {
          throw { status: 400, message: "maxApplicants must be a positive integer." }
        }
      }

      // Check if type is a valid job type
      if (!JOB_TYPES.includes(type)) {
        throw { status: 400, message: `Invalid job type. Available types: ${JOB_TYPES.join(', ')}` }
      }

      // Fetch and check if the user exists in the database
      const postedBy = await User.findById(userId);
      if (!postedBy) {
        throw { status: 404, message: 'User not found.' }
      }

      // Create new job
      const job = new Job({
        title,
        description,
        skillsRequired,
        deadline: new Date(deadline),
        postedBy: userId,
        type
      })

      // Save the newly created job
      await job.save()

      logger.info(`User ${userId} successfully posted a job`)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async fetchJob(jobCategory) {
    try {
      // Log job category being fetched
      logger.info(`Fetching jobs for category: ${jobCategory}`)

      // Check if jobCategory is a string, has a minimum length of 5, and contains only alphanumeric characters
      if (!validator.isLength(jobCategory, { min: 5 }) || !validator.isAlphanumeric(jobCategory.replace(/\s/g, ''))) {
        throw { status: 400, message: 'Job category must be a string with at least 5 alphanumeric characters.' };
      }
    
      // Check if jobCategory exists in JOB_TYPES
      if (!JOB_TYPES.includes(jobCategory)) {
        throw { status: 400, message: `Invalid job category. Available categories: ${JOB_TYPES.join(', ')}` }
      }

      // Sanitize jobCategory to prevent any special characters or injection
      jobCategory = validator.escape(jobCategory)

      // Fetch jobs by category
      const jobs = await Job.find({ type: jobCategory }).populate('postedBy', 'email')
    
      // Check if jobs exist for the given category
      if (!jobs || jobs.length === 0) {
        throw { status: 204, message: 'Job category currently has no jobs' }
      }

      const filteredJobs = jobs.filter(job => job.status === 'open')
    
      // Return the jobs to the user
      return filteredJobs
    } catch (error) {
      throw new Error(error.message)
    }
    
  }  

  async deleteJobs(userId, jobId) {
    try {
      // Check if all the required parameters are present
      const requiredParams = { userId, jobId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message: "Missing required fields" }
      }

      // Log deletion info
      logger.info(`${userId} deleting job: ${jobId}`)

      // Validate userId format if it's an ObjectId
      if (!validator.isMongoId(userId.toString()) || !validator.isMongoId(jobId.toString())) {
        throw { status: 400, message: "Invalid formats." }
      }

      // Query both the User and Job collections at the same time
      const [ user, job ] = await Promise.all([
        User.findById(userId),
        Job.findById(jobId)
      ])

      // Check if both user and job exist
      if (!user) {
        throw { status: 404, message: 'User not found.' }
      }
      if (!job) {
        throw { status: 404, message: 'Job not found.' }
      }

      // Check if the user has the permission to delete
      if (job.postedBy.toString() !== user._id.toString()) {
        throw { status: 400, message: 'You dont have permission to delete this post'}
      }

      // Delete the job
      await Job.deleteOne({ _id: jobId })

      logger.info(`Job ${jobId} deleted successfully by user ${userId}`)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getJobDetails(jobId) {
    try {
      const requiredParams = { jobId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message: 'Missing required fields' }
      }

      const job = await Job.findById(jobId).populate('postedBy', 'firstName middleName lastName email profilePic' )

      if (!job) {
        throw { status: 400, message: 'Error fetching job details: Job is not found'}
      }

      return job
    } catch (error) {
      throw new Error(error.message)
    }
  }
    
  // New method to get job applicants
  async getJobApplicants(jobId) {
    try {
      const requiredParams = { jobId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message: 'Missing jobId' }
      }

      // Fetch the job to ensure it exists
      const job = await Job.findById(jobId)
      if (!job) {
        throw { status: 404, message: 'Job not found' }
      }

      // Fetch the applications associated with the job and populate applicant data
      const applications = await Application.find({ job: jobId })
        .populate('applicant', '_id firstName middleName lastName email profilePic') // Populate user details (first name, middle name, last name, email)
        .exec()

      // If no applications are found
      if (!applications || applications.length === 0) {
        return { message: 'No applications found for this job' }
      }

      // Map the applications to include relevant information
      const applicants = applications.map(application => ({
        _id: application.applicant._id,
        applicantProfilePic: application.applicant.profilePic,
        applicantName: `${application.applicant.firstName} ${application.applicant.middleName} ${application.applicant.lastName}`,
        applicantEmail: application.applicant.email, // Include applicant email
        resumeLink: application.resumeLink,
        coverLetter: application.coverLetter,
        dateApplied: application.dateApplied,
        status: application.status
      }))

      return applicants
    } catch (error) {
      throw new Error(error.message)
    }
  }
}


module.exports = new JobService()
