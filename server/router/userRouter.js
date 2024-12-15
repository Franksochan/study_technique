const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/jsonWebTokens')
const UserController = require('../controller/UserController')

router.get('/get-user/:userId', verifyToken, UserController.fetchUser)
router.post('/follow-user/:userId/:followId', verifyToken, UserController.followUser)
router.delete('/unfollow-user/:userId/:unfollowId', UserController.unfollowUser)
router.post('/add-bio/:userId', verifyToken, UserController.addBio)
router.post('/add-link/:userId', verifyToken, UserController.addLink)
router.put('/change-password/:userId', verifyToken, UserController.changePassword)
router.get('/notifications/:userId', verifyToken, UserController.getNotifications)
router.post('/upload-profile-pic/:userId', verifyToken, UserController.uploadUserProfilePic)
router.get('/get-user-applied-jobs/:userId', verifyToken, UserController.getUserAppliedJobs)
router.get('/get-user-posted-jobs/:userId', UserController.getUserPostedJobs)

module.exports = router