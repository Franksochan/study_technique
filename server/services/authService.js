// services/AuthService

const User = require('../models/user')
const logger = require('../logger/logger')
const PasswordService = require('./passwordService')
const EmailService = require('./emailService')
const { findMissingParams } = require('../utils/paramsValidator')
const { generateTokens } = require('../middleware/jsonWebTokens')

class AuthService {
  async registerUser (firstName, middleName, lastName, email, password, passwordConfirmation, province, municipality) {
    try {
      console.log(passwordConfirmation)
      const maskedEmail = EmailService.maskEmail(email)
      logger.info('Registration attempt received')
  
      // Check if all required fields are filled
      const requiredParams = { firstName, middleName, lastName, email, password, passwordConfirmation, province, municipality }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        logger.warn(`Registration failed: Missing fields: ${maskedEmail}`)
        throw { statusCode: 400, message: 'Please fill in all the required fields' } // Use throw to pass the error
      }

      // Check if each parameter is a string
      const stringFields = ['firstName', 'middleName', 'lastName', 'email', 'password', 'passwordConfirmation', 'province', 'municipality'];
      for (let field of stringFields) {
        if (typeof requiredParams[field] !== 'string') {
          logger.warn(`Registration failed: Invalid type for field ${field}: ${maskedEmail}`);
          throw { statusCode: 400, message: `${field} should be a string` };
        }
      }
  
      // Check for validating email
      const validatedEmail = await EmailService.validateEmail(email)
      if (!validatedEmail.isValid) {
        logger.warn(`Registration failed: Invalid email format: ${maskedEmail}`)
        throw { statusCode: 400, message: 'Please input a valid email' }
      }
  
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        const errorMsg = existingUser.email === email && 'Email already exists'
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
      const hashedPassword = await PasswordService.hashPassword(password)
      logger.info('Password hashed successfully')
  
      // Generate verification code
      const verificationCode = await EmailService.generateVerificationCode()
      logger.info('Verification code generated')
  
      // Send verification email
      await EmailService.sendVerificationEmail(email, verificationCode)
      logger.info(`Verification email sent to: ${maskedEmail}`)
  
      // Create a new user
      const newUser = new User({
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
        province,
        municipality,
        verificationCode,
        joinedDate: new Date(),
      })
  
      // Save the new user to the database
      await newUser.save()
      logger.info(`New user saved to the database: ${maskedEmail}`)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async verifyEmail (email, verificationCode) {
    try {
      const maskedEmail = EmailService.maskEmail(email)
      logger.info(`Email verification attempt received: ${maskedEmail}`)
  
      const requiredParams = { email, verificationCode }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        logger.warn(`Verification failed: Missing required field - ${maskedEmail}`)
        throw { statusCode: 400, message: 'Please fill in all the required fields'}
      }
  
      // Find user by email
      const user = await User.findOne({ email })
  
      // Check if user email is registered
      if (!user) {
        logger.warn(`Verification failed: Email is not found - ${maskedEmail}`)
        throw { statusCode: 400, message: 'Email is not registered yet' }
      }
  
      // Check if the verification code matches
      if (user.verificationCode !== verificationCode) {
        logger.warn(`Verification failed: Verification code is incorrect - ${maskedEmail}`)
        throw { statusCode: 400, message: 'Verification code is incorrect, please try again' }
      }
  
      // Update user verification status
      user.verified = true
      user.verificationCode = null
      await user.save()
      logger.info(`User ${maskedEmail} has been verified succesfully`)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async logIn (email, password) {
    try {
      const maskedEmail = await EmailService.maskEmail(email)
      logger.info(`Login attempt received by: ${maskedEmail}`)
  
      const requiredParams = { email, password }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        logger.warn(`Login attempt failed: Missing fields - ${maskedEmail}`)
        throw { statusCode: 400, message: 'Please fill in all the required fields'}
      }
  
      // Validate email
      const validatedEmail = await EmailService.validateEmail(email)
      if (!validatedEmail.isValid) {
        logger.warn(`Login attempt failed: Invalid email format: ${maskedEmail}`)
        throw { statusCode: 400, message: 'Please input a valid email' }
      }
  
      const user = await User.findOne({ email })
      if (!user) {
        logger.warn(`Login attempt failed: Email is not associated to any users - ${maskedEmail}`)
        throw { statusCode: 400, message: 'No user is associated with that email, please try again'}
      }
  
      // Check if the account is locked
      if (await user.isLocked()) {
        logger.warn(`Login failed: Account still locked for user - ${maskedEmail}`)
        throw { statusCode: 403, message: 'Account is locked. Please try again after 3 mins.' }
      }
  
      const isPasswordValid = await PasswordService.comparePassword(password, user.password)
      if (!isPasswordValid) {
        // Increment failed login attempts
        user.failedLoginAttempts += 1
        logger.warn(`Login failed: Incorrect password for - ${maskedEmail}, Attempt: ${user.failedLoginAttempts}`)
  
        // Lock account if attempts exceed the limit (e.g., 5 attempts)
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + 3 * 60 * 1000 // Lock for 3 minutes
          logger.warn(`Login failed: Account locked due to multiple failed attempts - ${maskedEmail}`)
        }
  
        await user.save()
        throw { statusCode: 400, message: 'Incorrect password' }
      }
  
      // Reset failed login attempts after a successful login
      if (user.failedLoginAttempts > 0) {
        user.failedLoginAttempts = 0
        user.lockUntil = null
        await user.save()
      }
  
      // Check if user's email is verified
      if (user.verificationCode !== null) {
        logger.warn(`Login attempt failed: User email is not verified - ${maskedEmail}`)
        throw { status: 400, message: 'Please verify your email first' }
      }

      // Generate tokens
      const tokens = generateTokens(user)

      // Set cookies with access and refresh tokens
      const accessToken = tokens.accessToken
      const refreshToken = tokens.refreshToken

      logger.info(`Login attempt succesful - ${maskedEmail}`)
      return { accessToken, refreshToken, userID: user._id }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async forgotPassword(email) {
    try {
      console.log(email)
      // Check if user exists with the provided email
      const user = await User.findOne({ email })
  
      if (!user) {
        throw { status: 400, message: 'User is not found'}
      }
  
      // Generate reset token
      const resetToken = await EmailService.generateResetToken(user)
  
      // Save the reset token to the user object
      user.resetPasswordToken = resetToken
      await user.save()
  
      // Send reset password email
      await EmailService.sendResetPasswordEmail(email, resetToken)
    } catch (error) {
      throw new Error(error.message)
    }
  }
  
  async resetPassword(resetToken, newPassword, newPasswordConfirmation) {
    try {
      console.log(resetToken, newPassword, newPasswordConfirmation)
      // Find user by reset token
      const user = await User.findOne({ resetPasswordToken: resetToken })
  
      if (!user) {
        throw { status: 404, message: 'User is not found'}
      }
  
      // Check if reset token has expired
      if (user.resetPasswordExpires < Date.now()) {
        throw { status: 400, message: 'Reset token has expired'}
      }

      // Check if passwords are matched
      if (newPassword !== newPasswordConfirmation) {
        throw { status: 400, message: 'Passwords dont match'}
      }
  
      // Hash the password
      const hashedPassword = await PasswordService.hashPassword(newPassword)
      logger.info('Password hashed successfully')
  
      // Update user's password
      user.password = hashedPassword
      // Clear reset token and expiration time
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = new AuthService()