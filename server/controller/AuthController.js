const AuthService = require('../services/authService') // Adjust path as necessary
const logger = require('../logger/logger')

class AuthController {
  // Register a new user
  async register(req, res, next) {
    try {
      const { username, email, password, passwordConfirmation } = req.body
      await AuthService.registerUser(username, email, password, passwordConfirmation)
      res.status(201).json({ message: 'Registration successful! Please check your email for verification.' });
    } catch (error) {
      logger.error(`Registration error - ${error.message}`)
      next(error)
    }
  }

  // Verify user email
  async verify(req, res, next) {
    try {
      const { email, verificationCode } = req.body
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
      await AuthService.logIn(email, password)
      res.status(200).json({ message: 'Login successful!' })
    } catch (error) {
      logger.error(`Login error - ${error.message}`)
      next(error)
    }
  }
}

module.exports = new AuthController()
