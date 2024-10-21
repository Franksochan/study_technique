const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    maxlength: 12,
    minlength: 5
  },
  email: {
    type: String,
    unique: true,
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