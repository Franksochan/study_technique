import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './JobApplication.css'
import Sidebar from '../../components/JobListingComponents/Sidebar'
import api from '../../../utils/api'

const JobApplicationPage = () => {
  const { jobId } = useParams()
  const [jobDetails, setJobDetails] = useState(null)
  const [resume, setResume] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(falses)
  const userId = localStorage.getItem('userID')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`job/get-job-details/${jobId}`)
        if (response.status === 200) {
          setJobDetails(response.data.job)
        }
      } catch (error) {
        setError('Error fetching job details')
      }
    }

    fetchJobDetails()
  }, [jobId])

  const handleResumeChange = (e) => {
    setResume(e.target.files[0])
  }

  const handleCoverLetterChange = (e) => {
    setCoverLetter(e.target.value)
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    if (!resume) {
      setError('Please upload your resume')
      return
    }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', resume)
      formData.append('coverLetter', coverLetter)

      const response = await api.post(`application/apply-job/${jobId}/${userId}`, formData, { 
        headers: {
          'Content-Type': 'multiform/data'
        }
      })
      if (response.status === 201) {
        alert('Application submitted successfully!')
        setError('')
        setResume(null)
        setCoverLetter('')
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="job-application-container">
      <Sidebar />
      {jobDetails ? (
        <main className="job-application-section">
          <header>
            <h1>Apply for Job: {jobDetails.title}</h1>
            <button onClick={() => navigate('/job-listings')} className="back-button">Back to Job Listings</button>
          </header>

          <div className="job-details">
            <h3>{jobDetails.title}</h3>
            <p><strong>Description:</strong> {jobDetails.description}</p>
            <p><strong>Skills Required:</strong> {jobDetails.skillsRequired?.join(', ')}</p>
            <p><strong>Deadline:</strong> {new Date(jobDetails.deadline).toLocaleDateString()}</p>
            <p><strong>Applicants:</strong> {jobDetails.applications.length}/{jobDetails.maxApplicants}</p>
          </div>

          <form onSubmit={handleApplySubmit} className="application-form">
            <h2>Application Form</h2>

            <label htmlFor="resume">Upload Resume</label>
            <input
              type="file"
              id="resume"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              required
            />

            <label htmlFor="coverLetter">Cover Letter</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              placeholder="Write your cover letter here"
              value={coverLetter}
              onChange={handleCoverLetterChange}
              required
            />

            {error && <p className="error">{error}</p>} 

            <button type="submit">{ isLoading ? 'Submitting' : 'Submit Application' }</button>
          </form>
        </main>
      ) : (
        <div>Loading job details...</div>
      )}
    </div>
  )
}

export default JobApplicationPage
