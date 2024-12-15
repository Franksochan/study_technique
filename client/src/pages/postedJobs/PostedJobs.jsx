import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePrivateApi from '../../../hooks/usePrivateApi'
import Sidebar from '../../components/JobListingComponents/Sidebar'
import './PostedJobs.css'
import { useParams } from 'react-router-dom'

const PostedJobsPage = () => {
  const [postedJobs, setPostedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userId } = useParams()
  const [showSidebar, setShowSidebar] = useState(false)
  const navigate = useNavigate()
  const privateAxios = usePrivateApi()

  const fetchPostedJobs = async () => {
    try {
      const response = await privateAxios.get(`/user/get-user-posted-jobs/${userId}`)

      if (response.status === 200) {
        setPostedJobs(response.data.jobsPosted || [])
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch posted jobs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPostedJobs()
  }, [])

  const handleViewApplicants = (jobId) => {
    navigate(`/applicants/${jobId}`)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="posted-jobs-page">
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <main className="posted-jobs-content">
        <h2 className="posted-jobs-title">Posted Jobs</h2>
        <button 
          className="back-to-vita-craft-button" 
          onClick={() => navigate('/job-listings')}
        >
          Back to Vita Craft
        </button>
        <div className="posted-jobs-list">
          {error ? (
            <div className="error">{error}</div>
          ) : postedJobs.length > 0 ? (
            postedJobs.map((job) => (
              <div key={job._id} className="job-card">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-description">{job.description}</p>
                <p className="job-deadline">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                <p className="job-status">Status: {job.status}</p>
                <p className="job-type">Type: {job.type}</p>
                <div className="job-skills">
                  <strong>Skills Required:</strong>
                  <ul>
                    {job.skillsRequired.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  className="view-applicants-button" 
                  onClick={() => handleViewApplicants(job._id)}
                >
                  View Applicants
                </button>
              </div>
            ))
          ) : (
            <div>No posted jobs available</div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PostedJobsPage
