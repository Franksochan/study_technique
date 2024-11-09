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
});

module.exports = mongoose.model('Job', JobSchema);
