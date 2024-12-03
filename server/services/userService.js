const User = require('../models/user')
const logger = require('../logger/logger')
const { findMissingParams } = require('../utils/paramsValidator')

class UserService {
  async fetchUser(userId) {
    try {
      logger.info(`Fetching user: ${userId}`)
  
      // Validate required parameter
      const requiredParams = { userId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message: 'Failed to fetch user: User ID is not provided' }
      }
  
      // Find user by ID
      const user = await User.findById(userId)
        .select('firstName middleName lastName email province municipality profilePic bio socialLinks followers following joinedDate')
        .populate('followers', 'firstName lastName profilePic') 
        .populate('following', 'firstName lastName profilePic') 
  
      if (!user) {
        throw { status: 404, message: 'Failed to fetch user: User not found' }
      }
  
      // Return the user's attributes
      return {
        id: user._id,
        name: `${user.firstName} ${user.middleName} ${user.lastName}`,
        email: user.email,
        location: `${user.municipality}, ${user.province}`,
        profilePic: user.profilePic || null,
        bio: user.bio || "This user hasn't set up their bio yet.",
        socialLinks: user.socialLinks || { facebook: '', twitter: '', instagram: '' },
        followers: user.followers.map(follower => ({
          id: follower._id,
          name: `${follower.firstName} ${follower.lastName}`,
          profilePic: follower.profilePic || null,
        })),
        following: user.following.map(following => ({
          id: following._id,
          name: `${following.firstName} ${following.lastName}`,
          profilePic: following.profilePic || null,
        })),
        joinedDate: user.joinedDate,
      }
    } catch (error) {
      logger.error(`Error fetching user: ${error.message}`)
      throw new Error(error.message)
    }
  }
  
  async followUser(userId, followId) {
    try {
      logger.info(`Follow request received by ${userId} for ${followId}`)

      const requiredParams = { userId, followId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message:'Failed to follow, user id is not found'}
      }

      const [userToBeFollowed, user] = await Promise.all([
        User.findById(followId),
        User.findById(userId)
      ])

      if (!userToBeFollowed || !user) {
        throw { status: 400, message: 'Failed to follow, user is not found'}
      }

      if (user.following.includes(followId) && userToBeFollowed.followers.includes(userId)) {
        throw { status: 400, message: 'Failed to follow user: Already following'}
      } 

      user.following.push(followId)
      userToBeFollowed.followers.push(userId)
    
      await Promise.all([user.save(), userToBeFollowed.save()])
    
      logger.info(`User ${userId} successfully followed user ${followId}`)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async unfollowUser(userId, unfollowId) {
    try {
      logger.info(`Unfollow request received by ${userId} for ${unfollowId}`)

      const requiredParams = { unfollowId, userId } 
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message:'Failed to follow, user id is not found'}
      }
  
      const [userToBeUnfollowed, user] = await Promise.all([
        User.findById(unfollowId),
        User.findById(userId)
      ])
  
      if (!userToBeUnfollowed || !user) {
        throw { status: 400, message: 'Failed to follow, user is not found'}
      }
  
      if (!user.following.includes(unfollowId) && !userToBeUnfollowed.followers.includes(userId)) {
        throw { status: 400, message: 'Failed to unfollow user: You are not following them'}
      } 
  
      user.following = user.following.filter(id => id.toString() !== unfollowId.toString())
  
      userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(id => id.toString() !== userId.toString())
  
      await Promise.all([user.save(), userToBeUnfollowed.save()])
  
      logger.info(`User ${userId} successfully unfollowed user ${unfollowId}`)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async addBio(userId, newBio) {
    try {
      const requiredParams = { userId, newBio } 
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message:'Failed to add a bio: Please fill in all the required fields'}
      }

      const user = await User.findById(userId)

      if (!user) {
        throw { status: 404, message: 'Failed to add a bio: User is not found'}
      }

      user.bio = newBio
      await user.save()

    } catch (error) {
      throw new Error(error.message)
    }
  }

  async addLink(userId, platform, link) {
    try {
      const requiredParams = { userId, platform, link } 
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message:'Failed to add a bio: Please fill in all the required fields'}
      }

      const user = await User.findById(userId)

      if (!user) {
        throw { status: 404, message: 'Failed to add a bio: User is not found'}
      }

      const validPlatforms = ["facebook", "twitter", "instagram", "github"];
      if (!validPlatforms.includes(platform)) {
        throw { status: 400, message: 'Failed to add a link: Invalid platform' };
      }

      user.socialLinks[platform] = link

      await user.save()
      
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async changeName = (userId, )
}

module.exports = new UserService()