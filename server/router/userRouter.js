const express = require('express')
const router = express.Router()
const UserController = require('../controller/UserController')

router.get('/get-user/:userId', UserController.fetchUser)
router.post('/follow-user/:userId/:followId', UserController.followUser)
router.delete('/unfollow-user/:userId/:unfollowId', UserController.unfollowUser)
router.post('/add-bio/:userId', UserController.addBio)
router.post('/add-link/:userId', UserController.addLink)
router.put('/change-password/:userId', UserController.changePassword)
router.get('/notifications/:userId', UserController.getNotifications)

module.exports = router