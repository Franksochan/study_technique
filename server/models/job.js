const mongoose = require('mongoose')
const JOB_TYPES = require('../constants/jobTypes')

const JobSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
  },
  skillsRequired: [{
    type: String,
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  durations: {
    type: Date
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'in progress', 'completed'],
    default: 'open',
  },
  maxApplicants: {
    type: Number,
    default: 10,  
    min: 1,  
  },
  applicants: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: JOB_TYPES, 
    required: true, 
  }
})

module.exports = mongoose.model('Job', JobSchema)
