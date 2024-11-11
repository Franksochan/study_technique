const mongoose = require('mongoose')

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
    enum: [
      'Computer Science & IT', 
      'Web Design & Graphic Design', 
      'Digital Marketing & Social Media', 
      'Content Creation & Writing', 
      'Photography & Visual Arts', 
      'Virtual Assistant & Administrative Support', 
      'Transcription & Translation', 
      'Consulting & Business Strategy', 
      'Sales & Marketing', 
      'Voiceovers & Audio Production', 
      'Accounting & Financial Services',
      'Legal & Intellectual Property Services',
      'Event Planning & Coordination',
      'Health, Fitness & Wellness', 
      'Education & Tutoring',
      'School Works'
    ], 
    required: true, 
  }
})

module.exports = mongoose.model('Job', JobSchema)
