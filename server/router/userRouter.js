const express = require('express')
const router = express.Router()
const UserController = require('../controller/UserController')

router.post('/follow-user/:userId/:followId', UserController.followUser)
router.delete('/unfollow-user/:userId/:unfollowId', UserController.unfollowUser)

module.exports = router