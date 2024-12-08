const User = require('../models/user')
const Job = require('../models/job')
const Application = require('../models/application')
const Notification = require('../models/notification')
const EmailService = require('./emailService')
const logger = require('../logger/logger')
const { findMissingParams } = require('../utils/paramsValidator')
const admin = require('../config/firebase.config')

class ApplicationService {
  // Retry logic for file upload
  async retryUpload(bucket, file, maxRetries = 3, delay = 2000) {
    let attempt = 0;
    const fileUpload = bucket.file(`lumikha-resume/${file.originalname}`)
    
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = fileUpload.createWriteStream({
        resumable: true,
        contentType: file.mimetype,
      })

      stream.on('error', (error) => {
        if (attempt < maxRetries) {
          attempt++;
          console.log(`Retrying upload... Attempt ${attempt}`)
          setTimeout(() => this.retryUpload(bucket, file, maxRetries, delay), delay)
        } else {
          reject(new Error('Upload failed after multiple attempts'))
        }
      })

      stream.on('finish', () => resolve(fileUpload))

      // Pipe the file buffer into the stream
      stream.end(file.buffer)
    })

    return uploadPromise
  }

  async applyJob(applicantId, jobId, file, coverLetter) {
    try {
      const requiredParams = { applicantId, jobId, file, coverLetter }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { statusCode: 400, message: 'Please fill in all the required fields' }
      }

      const job = await Job.findById(jobId)
      if (!job) {
        throw { statusCode: 400, message: 'Error applying - Job is not found' }
      }

      const user = await User.findById(applicantId)
      if (!user) {
        throw { statusCode: 400, message: 'Error applying - User is not found' }
      }

      console.log(user)

      if (user.appliedJobs.includes(job._id)) {
        throw { statusCode: 400, message: 'Error applying - You already applied to this job' }
      }

      // Check if the job can accept more applicants
      if (job.applications && job.applications.length >= job.maxApplicants) {
        throw { statusCode: 400, message: 'Job has reached its maximum number of applicants' }
      }

      // Create a reference to the Firebase Storage bucket location
      const bucket = admin.storage().bucket()

      // Retry the file upload
      try {
        const fileUpload = await this.retryUpload(bucket, file)
        // Generate the download URL
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`

        // Save the application
        const application = new Application({
          job: jobId,
          applicant: applicantId,
          coverLetter,
          resumeLink: downloadURL,
          status: 'pending',
          dateApplied: new Date(),
        })

        const savedApplication = await application.save()

        // Update the job with the new application reference
        job.applications = job.applications || []
        job.applications.push(savedApplication._id)
        await job.save()

        user.appliedJobs = user.appliedJobs || []
        user.appliedJobs.push(job._id)
        console.log(user.appliedJobs)
        await user.save()

        // Notify the job poster
        const jobPoster = await User.findById(job.postedBy)
        if (jobPoster) {
          const notification = new Notification({
            user: job.postedBy,
            message: `${user.firstName} ${user.middleName} ${user.lastName} submitted an application for your job posting: "${job.title}".`,
            type: 'alert',
            date: new Date(),
          })

          const savedNotification = await notification.save()

          // Add the notification to the job poster's notifications array
          jobPoster.notifications = jobPoster.notifications || []
          jobPoster.notifications.push(savedNotification._id)
          await jobPoster.save()

          const applicantName = (`${user.firstName} ${user.middleName} ${user.lastName}`)
          const applicantEmail = user.email
          
          await EmailService.sendApplicationEmail(jobPoster.email, applicantName, applicantEmail )
        }
      } catch (error) {
        console.error('Upload failed after multiple attempts:', error.message)
        throw new Error('Error uploading file to Firebase Storage')
      }
    } catch (error) {
      console.error(error)
      throw { statusCode: error.statusCode || 500, message: error.message || 'Server Error' }
    }
  }

  async offerJob(jobId, applicantId) {
    try {
      const requiredParams = { jobId, applicantId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 404, message: 'Missing required parameters' }
      }
  
      const job = await Job.findById(jobId).populate('postedBy', 'email title firstName middleName lastName')
      if (!job) {
        throw { status: 400, message: 'Job is not found' }
      }
  
      const applicant = await User.findById(applicantId)
      if (!applicant) {
        throw { status: 400, message: 'Applicant is not found' }
      }
  
      const jobPosterName = `${job.postedBy.firstName} ${job.postedBy.middleName} ${job.postedBy.lastName}`
      const applicantFullName = `${applicant.firstName} ${applicant.middleName} ${applicant.lastName}`
  
      // Notify the chosen applicant (Offer notification)
      await EmailService.sendJobOfferEmail(
        jobPosterName, // Employer name
        job.postedBy.email, // Employer email
        applicantFullName, // Applicant name
        applicant.email, // Applicant email
        job.title // Job title
      )
  
      // Notify the employer about the chosen applicant
      await EmailService.notifyEmployerAboutCandidate(
        jobPosterName, // Employer name
        job.postedBy.email, // Employer email
        applicantFullName, // Applicant name
        applicant.email, // Applicant email
        job.title // Job title
      )
  
      // Change the status of the chosen applicant's application to 'offered'
      const chosenApplication = await Application.findOne({ job: jobId, applicant: applicantId })
      if (chosenApplication) {
        chosenApplication.status = 'accepted'
        await chosenApplication.save()
      }
  
      // Change the job status to 'closed'
      job.status = 'closed'
      await job.save()
  
      // Notify the other applicants that they weren't chosen and update their status to 'rejected'
      const otherApplications = await Application.find({ job: jobId, status: 'pending' })
      
      for (const application of otherApplications) {
        const otherApplicant = await User.findById(application.applicant)
        if (otherApplicant) {
          // Create a rejection notification
          const notification = new Notification({
            user: otherApplicant._id,
            message: `We regret to inform you that your application for the job '${job.title}' has not been selected.`,
            type: 'alert',
          })
          await notification.save()
  
          // Save the notification to the applicant's notifications
          otherApplicant.notifications.push(notification._id)
          await otherApplicant.save()
  
          // Update the application status to 'rejected'
          application.status = 'rejected'
          await application.save()
        }
      }
  
    } catch (error) {
      throw new Error(error.message)
    }
  }  
}

module.exports = new ApplicationService()
