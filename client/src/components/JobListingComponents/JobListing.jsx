import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useUserData from '../../../hooks/useUserData'
import Sidebar from './Sidebar'
import './JobListing.css'
import api from '../../../utils/api'

const JOB_TYPES = [
  'Computer Science and IT',
  'Web and Graphic Design',
  'Digital Marketing and Social Media',
  'Content Creation and Writing',
  'Photography and Visual Arts',
  'Virtual Assistant and Administrative Support',
  'Transcription and Translation',
  'Consulting and Business Strategy',
  'Sales and Marketing',
  'Voiceovers and Audio Production',
  'Accounting and Financial Services',
  'Legal and Intellectual Property Services',
  'Event Planning and Coordination',
  'Health, Fitness and Wellness',
  'Education and Tutoring',
  'School Works',
]

const JobListing = () => {
  const [selectedJobType, setSelectedJobType] = useState('')
  const [showInfoPopup, setShowInfoPopup] = useState(false)
  const [jobs, setJobs] = useState([])
  const [showJobForm, setShowJobForm] = useState(false)
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    skillsRequired: [],
    deadline: '',
    maxApplicants: '',
    type: '',
  })
  const userID = localStorage.getItem('userID')

  const { user } = useUserData()

  useEffect(() => {
    if (selectedJobType) {
      fetchJobs()
    } 
  }, [selectedJobType])

  const fetchJobs = async () => {
    try {
      const response = await api.get(`job/get-jobs/${encodeURIComponent(selectedJobType)}`)
      if (response.status === 200) {
        setJobs(response.data.jobs)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setJobs('')
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  const toggleInfoPopup = () => setShowInfoPopup(prevState => !prevState)

  const handleFormChange = (e) => {
    const { name, value } = e.target
  
    // Handle comma-separated skills input
    let formattedValue = value
    if (name === "skillsRequired") {
      formattedValue = value.split(',').map(skill => skill.trim()) // Convert to array and trim spaces
    }
  
    setNewJob((prevData) => ({
      ...prevData,
      [name]: name === "maxApplicants" ? parseInt(value, 10) : formattedValue,
    }))
  }
  

  const handleJobSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post(`job/create-job/${userID}`, newJob)
      if (response.status === 201) {
        setShowJobForm(false) 
        setNewJob({
          title: '',
          description: '',
          skillsRequired: '',
          deadline: '',
          maxApplicants: '',
        }) 
        alert(response.data.message)
        fetchJobs() 
      }
    } catch (error) {
      alert('Error creating job listing. Please try again.')
    }
  }

  return (
    <main className="job-listing-section">
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} /> 
      <header>
        <h1>
          Lumikha's Vita Craft
          <span className="info-icon" onClick={toggleInfoPopup}>i</span>
        </h1>
        <p>Select a category to explore freelance opportunities</p>
      </header>

      {showInfoPopup && (
        <div className="info-popup">
          <div className="popup-content">
            <h2>What is Vita Craft?</h2>
            <p>
              "Vita Craft" is derived from two words: "Vita," meaning life, and "Craft," referring to the act of creating with skill. It signifies the journey of individuals actively crafting their lives by honing their unique skills, passions, and talents.
            </p>
            <button onClick={toggleInfoPopup}>That's so cool!</button>
          </div>
        </div>
      )}

      <div className="dropdown-container">
        <select
          className="job-dropdown"
          value={selectedJobType}
          onChange={(e) => setSelectedJobType(e.target.value)}
        >
          <option value="">Select Job Category</option>
          {JOB_TYPES.map((jobType, index) => (
            <option key={index} value={jobType}>
              {jobType}
            </option>
          ))}
        </select>
      </div>

      <div className="job-list">
        {jobs.length > 0 ? (
          jobs.map((job, index) => (
            <div key={index} className="job-card">
              <h3>{job.title}</h3>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Skills Required:</strong> {job.skillsRequired.join(', ')}</p>
              <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Max Applicants:</strong> {job.maxApplicants}</p>
              <button 
                className="apply-btn" 
                onClick={() => {
                  if (job.postedBy === userID) {
                    navigate(`/applicants/${job._id}`);
                  } else {
                    navigate(`/apply/${job._id}`);
                  }
                }}
                disabled={user.appliedJobs && user.appliedJobs.some(appliedJob => appliedJob.toString() === job._id.toString())}
              >
                {job.postedBy === userID 
                  ? 'View Your Applicants' 
                  : (user.appliedJobs && user.appliedJobs.some(appliedJob => appliedJob.toString() === job._id.toString()) 
                    ? 'Applied' 
                    : 'Apply')}
              </button>
            </div>
          ))
        ) : (
          <p>No jobs available for the selected category.</p>
        )}
      </div>

      {showJobForm && (
        <div className="job-form-popup">
          <div className="popup-content">
            <h2>Create a New Job Listing</h2>
            <form onSubmit={handleJobSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Job Title"
                value={newJob.title}
                onChange={handleFormChange}
                required
              />
              <textarea
                name="description"
                placeholder="Job Description"
                value={newJob.description}
                onChange={handleFormChange}
                required
              />
              <input
                type="text"
                name="skillsRequired"
                placeholder="Skills Required (comma separated)"
                value={newJob.skillsRequired}
                onChange={handleFormChange}
                required
              />
              <input
                type="date"
                name="deadline"
                value={newJob.deadline}
                onChange={handleFormChange}
                required
              />
              <input
                type="number"
                name="maxApplicants"
                placeholder="Max Applicants"
                value={newJob.maxApplicants}
                onChange={handleFormChange}
                required
              />
              <select
                name="type"
                value={newJob.jobType}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Job Category</option>
                {JOB_TYPES.map((jobType, index) => (
                  <option key={index} value={jobType}>
                    {jobType}
                  </option>
                ))}
              </select>
              <button type="submit">Create Job</button>
              <button type="button" onClick={() => setShowJobForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className="floating-btn"
        onClick={() => setShowJobForm(true)}
      >
        +
      </button>
    </main>
  )
}

export default JobListing