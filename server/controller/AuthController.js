const AuthService = require('../services/authService') // Adjust path as necessary
const logger = require('../logger/logger')

class AuthController {
  // Register a new user
  async register(req, res, next) {
    try {
      const { firstName, middleName, lastName, email, password, passwordConfirmation, province, municipality } = req.body
      await AuthService.registerUser(firstName, middleName, lastName, email, password, passwordConfirmation, province, municipality)
      res.status(201).json({ message: 'Registration successful! Please check your email for verification.' })
    } catch (error) {
      logger.error(`Registration error - ${error.message}`)
      next(error)
    }
  }

  // Verify user email
  async verify(req, res, next) {
    try {
      const { email } = req.params
      const { verificationCode } = req.body
      await AuthService.verifyEmail(email, verificationCode)
      res.status(200).json({ message: 'Email verified successfully!' })
    } catch (error) {
      logger.error(`Verification error - ${error.message}`)
      next(error)
    }
  }

  // User login
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const { accessToken, refreshToken, userID } = await AuthService.logIn(email, password)

      // Set cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })

      res.cookie('accessToken', accessToken, { 
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })  

      res.status(200).json({
          message: 'Login successful!',
          accessToken,
          userID,
      })
    } catch (error) {
      logger.error(`Login error - ${error.message}`)
      next(error)
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body
      await AuthService.forgotPassword(email)
      res.status(200).json({ message: 'Your request has been processed, please wait 5-10 mins for our email.' })
    } catch (error) {
      logger.error(`Error forgotting password - ${error.message}`)
      next(error)
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken } = req.params
      const { newPassword, newPasswordConfirmation } = req.body
      await AuthService.resetPassword(resetToken, newPassword, newPasswordConfirmation)
      res.status(200).json({ message: 'Password reset succesfully' })
    } catch (error) {
      logger.error(`Error resetting password - ${error.message}`)
      next(error)
    }
  }
}

module.exports = new AuthController()
