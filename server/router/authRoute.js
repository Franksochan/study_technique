// router/authRoute.js

const express = require('express')
const router = express.Router()
const logger = require('../logger/logger')
const User = require('../models/user')
const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const nodemailer = require('nodemailer') // Importing nodemailer for sending emails
const crypto = require('crypto') // Importing crypto for generating random codes
require('dotenv').config()

// Function to hash the password
const hashPassword = async (password) => {
  try {
    // Hash the password with bcrypt
    return await bcrypt.hash(password, 10)
  } catch (error) {
    // Handle errors and throw an error for the caller to handle
    logger.error('Error hashing password:', error)
    throw new Error('Failed to hash password.')
  }
}

// Function to validate email
const validateEmail = (email) => {
  const emailRegex = /^[\w.-]+@gmail\.com$/
  if (!emailRegex.test(email)) {
    return { isValid: false, errorMessage: 'Invalid email format. Please use your valid gmail account' }
  }
  return { isValid: true }
}


// Sends a verification email with a verification code.
const sendVerificationEmail = async (email, verificationCode) => {
  try {
     // Create a transporter using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
      },
    })

    // Configure email options
    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Email Verification',
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    }

    // Send the email
    await transporter.sendMail(mailOptions)
  } catch (error) {
    // Handle errors and throw an error for the caller to handle
    logger.error('Error sending verification email:', error.message)
    throw new Error('Failed to send verification email.')
  }
}

// Generates a random verification code.
const generateVerificationCode = () => {
  // Generate random bytes and convert them to hexadecimal string
  return crypto.randomBytes(3).toString('hex')
}

// Function to mask the email address
const maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  // Mask from the 3rd character onward, keeping the first two characters visible
  const maskedLocalPart = localPart.length > 2 
    ? localPart.slice(0, 2) + '*'.repeat(localPart.length - 2) 
    : '*'.repeat(localPart.length); // Mask the entire local part if too short
  return `${maskedLocalPart}@${domain}`;
}

router.post('/registration', async (req, res, next) => {
  const { username, email, password, passwordConfirmation } = req.body
  const maskedEmail = email ? maskEmail(email) : 'No email provided'

  try {
    // Log the registration attempt
    logger.info('Registration attempt received')

    // Check if all required fields are filled
    if (!username || !email || !password || !passwordConfirmation) {
      logger.warn(`Registration failed: Missing fields: ${maskedEmail}`)
      throw { statusCode: 400, message: 'Please fill in all the required fields' } // Use throw to pass the error
    }

    // Check if username length is valid
    if (username.length < 6 || username.length > 12) {
      logger.warn(`Registration failed: Invalid username length: ${maskedEmail}`)
      throw { statusCode: 400, message: 'Username should be longer than 5 characters and a maximum of 12 characters' }
    }

    // Check for validating email
    const validatedEmail = validateEmail(email)
    if (!validatedEmail.isValid) {
      logger.warn(`Registration failed: Invalid email format: ${maskedEmail}`)
      throw { statusCode: 400, message: 'Please input a valid email' }
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      const errorMsg = existingUser.username === username ? 'Username already taken' : 'Email already exists'
      logger.warn(`Registration failed: ${errorMsg} - ${maskedEmail}`)
      throw { statusCode: 400, message: errorMsg }
    }

    // Validate password length
    if (password.length < 6 || password.length > 16) {
      logger.warn(`Registration failed: Invalid password length: ${maskedEmail}`)
      throw { statusCode: 400, message: 'Passwords should be longer than 6 characters and a maximum of 16 characters' }
    }

    // Check if password and passwordConfirmation match
    if (password !== passwordConfirmation) {
      logger.warn(`Registration failed: Passwords do not match: ${maskedEmail}`)
      throw { statusCode: 400, message: 'Passwords do not match' }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)
    logger.info('Password hashed successfully')

    // Generate verification code
    const verificationCode = generateVerificationCode()
    logger.info('Verification code generated')

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      joinedDate: new Date(),
    })

    // Save the new user to the database
    await newUser.save()
    logger.info(`New user saved to the database: ${maskedEmail}`)

    // Send verification email
    await sendVerificationEmail(email, verificationCode)
    logger.info(`Verification email sent to: ${maskedEmail}`)

    // Respond with success message
    res.status(201).json({ msg: 'Verification code sent. Please check your email' })

  } catch (error) {
    next(error) // Pass the error to the next middleware
  }
})

module.exports = router
