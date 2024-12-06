const User = require('../models/user')
const Job = require('../models/job')
const Application = require('../models/application')
const logger = require('../logger/logger')
const { findMissingParams } = require('../utils/paramsValidator')
const admin = require('../config/firebase.config') 

class ApplicationService {
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

      // Create a reference to the Firebase Storage bucket location
      const bucket = admin.storage().bucket() // Get the storage bucket

      // Upload the file to Firebase Storage
      const fileUpload = bucket.file(`lumikha-resume/${file.originalname}`)
      const stream = fileUpload.createWriteStream({
        resumable: true,
        contentType: file.mimetype,
      })

      stream.on('error', (error) => {
        console.error('Upload failed with error: ', error.message)
        throw new Error('Error uploading file to Firebase Storage')
      })

      stream.on('finish', async () => {
        // Once the file is uploaded, generate the download URL
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
        console.log('Upload successful. File available at: ', downloadURL)

        const resumePath = fileUpload.name; // Store the file path
        const application = new Application({
          job: jobId,
          applicant: applicantId,
          coverLetter,
          resumeLink: downloadURL,
        })

        const savedApplication = await application.save();
        console.log(`Application saved successfully. ID: ${savedApplication._id}`)
      })

      // Pipe the file buffer into the stream
      stream.end(file.buffer)

    } catch (error) {
      throw { statusCode: error.statusCode || 500, message: error.message || 'Server Error' }
    }
  }
}

module.exports = new ApplicationService()


