const UserService = require('../services/userService')
const logger = require('../logger/logger')

class UserController {

  async fetchUser(req, res, next) {
    try { 
      const { userId } = req.params
      const user = await UserService.fetchUser(userId)
      res.status(200).json({ user , message: 'User fetchedd succesfully'})
    } catch (error) {
      logger.error(`Error fetching user - ${error.message}`)
      next(error)
    }
  }
  
  // Follow a user
  async followUser(req, res, next) {
    try {
      const { userId, followId } = req.params
      await UserService.followUser(userId, followId)
      res.status(200).json({ message: 'Succesfully followed the user'})
    } catch(error){
      logger.error(`Error following user - ${error.message}`)
      next(error)
    }
  }

  async unfollowUser(req, res, next) {
    try {
      const { userId, unfollowId} = req.params
      await UserService.unfollowUser(userId, unfollowId)
      res.status(200).json({ message: 'Succesfully unfollowed the user' })
    } catch (error) {
      logger.error(`Error unfollowing user - ${error.message}`)
      next(error)
    }
  }

  async addBio(req, res, next) {
    try {
      const { userId } = req.params
      const { newBio } = req.body
      await UserService.addBio(userId, newBio)
      res.status(200).json({ message: 'Added bio succesfully' })
    } catch (error) {
      logger.error(`Error adding bio - ${error.message}`)
      next(error)
    }
  }

  async addLink(req, res, next) {
    try {
      const { userId } = req.params
      const { platform, link } = req.body
      await UserService.addLink(userId, platform, link)
      res.status(200).json({ message: 'Link added succesfully' })
    } catch (error) {
      logger.error(`Error adding link - ${error.message}`)
      next(error)
    }
  }

  async changePassword(req, res, next) {
    try {
      const { userId } = req.params
      const { currentPassword, newPassword, newPasswordConfirmation } = req.body
      await UserService.changePassword(userId, currentPassword, newPassword, newPasswordConfirmation)
      res.status(200).json({ message: 'Password changed succesfully' })
    } catch (error) {
      logger.error(`Error changing password - ${error.message}`)
      next(error)
    }
  }

  async getNotifications(req, res, next) {
    try {
      const { userId } = req.params
      const userNotifications = await UserService.getNotifications(userId)
      res.status(200).json({ userNotifications, message: 'Notifications fetched succesfully' })
    } catch (error) {
      logger.error(`Error getting notifications - ${error.message}`)
      next(error)
    }
  }

  async uploadUserProfilePic(req, res, next) {
    try {
      const { base64Image } = req.body
      const userId = req.params.userId

      const resizedImage = await UserService.uploadUserProfilePic(base64Image, userId)
      res.status(200).json({ resizedImage, msg: 'Profile picture uploaded succesfully' })
    } catch (error) {
      logger.error(`Error changing profile picture - ${error.message}`)
      next(error)
    }
  }

  async getUserAppliedJobs(req, res, next) {
    try {
      const { userId } = req.params
      const jobs = await UserService.getUserAppliedJobs(userId)

      res.status(200).json({ jobs, message: 'Jobs fetched succesfully'})
    } catch (error) {
      logger.error(`Error getting user applied jobhs - ${error.message}`)
      next(error)
    }
  }

  async getUserPostedJobs(req, res, next) {
    try {
      const { userId } = req.params
      const jobsPosted = await UserService.getUserPostedJobs(userId)

      res.status(200).json({ jobsPosted, message: 'Jobs fetched succesfully'})
    } catch (error) {
      logger.error(`Error getting user applied jobs - ${error.message}`)
      next(error)
    }
  }
}


module.exports = new UserController()