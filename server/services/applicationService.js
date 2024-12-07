const User = require('../models/user')
const Job = require('../models/job')
const Application = require('../models/application')
const Notification = require('../models/notification')
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
}

module.exports = new ApplicationService()
