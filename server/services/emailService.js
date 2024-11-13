const nodemailer = require('nodemailer')
const crypto = require('crypto')
const logger = require('../logger/logger')
require('dotenv').config()

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    })
  }

  async sendVerificationEmail(email, verificationCode) {
    try {
      const mailOptions = {
        from: process.env.USER,
        to: email,
        subject: 'Email Verification',
        html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
      }

      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      logger.error('Error sending verification email:', error.message)
      throw new Error('Failed to send verification email.')
    }
  }

  generateVerificationCode() {
    return crypto.randomBytes(3).toString('hex')
  }

  validateEmail(email) {
    const re = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/
    const isValid = re.test(String(email).toLowerCase())
    return { isValid }
  }
  
  maskEmail(email) {
    const [localPart, domain] = email.split('@')
    const maskedLocalPart = localPart.length > 2 ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1] : localPart
    return `${maskedLocalPart}@${domain}`
  }
}

module.exports = new EmailService()
