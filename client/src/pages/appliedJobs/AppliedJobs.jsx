import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePrivateApi from '../../../hooks/usePrivateApi'
import Sidebar from '../../components/JobListingComponents/Sidebar'
import './AppliedJobs.css'
import { useParams } from 'react-router-dom'

const AppliedJobsPage = () => {
  const [appliedJobs, setAppliedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userId } = useParams()
  const [showSidebar, setShowSidebar] = useState(false)
  const navigate = useNavigate()
  const privateAxios = usePrivateApi()

  const fetchAppliedJobs = async () => {
    try {
      const response = await privateAxios.get(`/user/get-user-applied-jobs/${userId}`)

      if (response.status === 200) {
        setAppliedJobs(response.data.jobs || [])
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch applied jobs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppliedJobs()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="applied-jobs-page">
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <main className="applied-jobs-content">
        <h2 className="applied-jobs-title">Applied Jobs</h2>
        <button 
          className="back-to-vita-craft-button" 
          onClick={() => navigate('/job-listings')}
        >
          Back to Vita Craft
        </button>
        <div className="applied-jobs-list">
          {error ? (
            <div className="error">{error}</div>
          ) : appliedJobs.length > 0 ? (
            appliedJobs.map((job) => (
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
              </div>
            ))
          ) : (
            <div>No applied jobs available</div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AppliedJobsPage;
