const User = require('../models/user')
const Notification = require('../models/notification')
const Job = require('../models/job')
const Application = require('../models/application')
const logger = require('../logger/logger')
const bcrypt = require('bcrypt')
const { findMissingParams } = require('../utils/paramsValidator')
const PasswordService = require('./passwordService')
const EmailService = require('./emailService')
const sharp = require('sharp')

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
        .select('firstName middleName lastName email province municipality profilePic bio socialLinks followers following joinedDate appliedJobs')
        .populate('followers', 'firstName lastName profilePic') 
        .populate('following', 'firstName lastName profilePic') 
  
      if (!user) {
        throw { status: 404, message: 'Failed to fetch user: User not found' }
      }

      console.log(user.appliedJobs)
  
      // Return the user's attributes
      return {
        id: user._id,
        name: `${user.firstName} ${user.middleName} ${user.lastName}`,
        email: user.email,
        location: `${user.municipality}, ${user.province}`,
        profilePic: user.profilePic || null,
        bio: user.bio || "This user hasn't set up their bio yet.",
        socialLinks: user.socialLinks || { facebook: '', twitter: '', instagram: '' },
        appliedJobs: user.appliedJobs,
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

  async changePassword(userId, currentPassword, newPassword, newPasswordConfirmation) {
    try {
      const requiredParams = { userId, currentPassword, newPassword, newPasswordConfirmation } 
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message:'Failed to change password: Please fill in all the required fields'}
      }

      const user = await User.findById(userId) 
      if (!user) {
        throw { status: 404, message: 'Failed to change password: User is not found' }
      }

      const isPasswordValid = await PasswordService.comparePassword(currentPassword, user.password)
      if (!isPasswordValid) {
        throw { status: 400, message: 'Failed to change password: Current password is incorrect' }
      }

      if (newPassword !== newPasswordConfirmation) {
        throw { status: 400, message: 'Failed to change password: Passwords dont match' }
      }

      const hashedPassword = await PasswordService.hashPassword(newPassword, 10)

      user.password = hashedPassword

      await user.save()

    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getNotifications(userId) {
    try {
      const requiredParams = { userId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 400, message: 'Failed to get notifications - user id is not defined'}
      }

      const userNotifications = await Notification.findOne({ user: userId })

      if (!userNotifications) {
        throw { status: 200, message: 'No notifications available'}
      }
      
      return userNotifications
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async uploadUserProfilePic (base64Image, userId) {
  
    try {
      const requiredParams = { base64Image, userId } 
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 404, message: 'Image and user id is both required'}
      }

      const user = await User.findById(userId)
      if (!user) {
        throw { status: 404, message: 'User is not found' }
      }
      // Allowed image formats
      const allowedFormats = ['jpeg', 'jpg', 'png']
       // Detect the image format from base64 string
      const detectedFormat = base64Image.match(/^data:image\/(\w+);base64,/)
      const imageFormat = detectedFormat ? detectedFormat[1] : null
  
        // Check if image format is supported
      if (!imageFormat || !allowedFormats.includes(imageFormat.toLowerCase())) {
        throw { status: 400, message: 'Unsupported image format. Please upload a JPEG, JPG, or PNG image.' }
      }
  
       // Convert base64 image to buffer
      const imageBuffer = Buffer.from(base64Image.split(',')[1], 'base64')
  
      // Resize the image
      const resizedImage = await sharp(imageBuffer)
        .resize({
          fit: 'cover',
          width: 200,
          height: 200,
          withoutEnlargement: true,
        })
        .toFormat(imageFormat)
        .toBuffer()
  
      // Convert resized image buffer to base64
      const resizedImageBase64 = `data:image/${imageFormat};base64,${resizedImage.toString('base64')}`
  
      // Update user profile picture in the database
      await User.findOneAndUpdate(user, { profilePic: resizedImageBase64 })

      return { resizedImage: resizedImageBase64 }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getUserAppliedJobs (userId) {
    try {
      const requiredParams = { userId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 404, message: 'User ID is required' }
      }

      const user = await User.findById(userId)
      if (!user) {
        throw { status: 404, message: 'User is not found' }
      }

      const userApplications = await Application.find({ applicant: user._id })

      // Extract job IDs from the user's applications
      const jobIds = userApplications.map(app => app.job)

      // Fetch all jobs that match the job IDs
      const jobsApplied = await Job.find({ _id: { $in: jobIds } })

      return jobsApplied
    } catch (error){
      throw new Error(error.message)
    }
  }

  async getUserPostedJobs (userId) {
    try {
      const requiredParams = { userId }
      const missingParams = findMissingParams(requiredParams)
      if (missingParams) {
        throw { status: 404, message: 'User ID is required' }
      }

      const user = await User.findById(userId)
      if (!user) {
        throw { status: 404, message: 'User is not found' }
      }

      const userPostedJobs = await Job.find({ postedBy: user._id })

      return userPostedJobs
    } catch (error){
      throw new Error(error.message)
    }
  }
}

module.exports = new UserService()