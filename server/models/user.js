const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true
  }, 
  province: {
    type: String,
    required: true
  },
  municipality: {
    type: String,
    required: true
  },
  password: {
    type: String, 
    required: true,
  },
  verificationCode: {
    type: String
  },
  verified: {
    type: Boolean, 
    default: false
  },
  profilePic: {
    type: String,
  },
  joinedDate: {
    type: Date, 
    default: Date.now 
  },
  notifications: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Notification' 
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], 
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  jobPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  portfolio: [{
    type: String
  }], 
  bio: {
    type: String,
    default: "This is my bio",
  },
  socialLinks: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    github: { type: String, default: ""}
  },  
  failedLoginAttempts: { type: Number, default: 0 }, 
  lockUntil: { type: Date },
  resetPasswordToken: { type: String, default: undefined},
  resetPasswordExpires: { type: Date, default: undefined }
})

UserSchema.methods.isLocked = async function () {
  // If lockUntil is set and in the future, account is still locked
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return true
  }

  // If lockUntil has passed, reset lock and failed login attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.failedLoginAttempts = 0
    this.lockUntil = null
    await this.save() // Save the reset state
  }
  
  return false
}


module.exports = mongoose.model('User', UserSchema)