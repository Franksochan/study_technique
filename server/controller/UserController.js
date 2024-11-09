const UserService = require('../services/userService')
const logger = require('../logger/logger')

class UserController {
  
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
}

module.exports = new UserController()