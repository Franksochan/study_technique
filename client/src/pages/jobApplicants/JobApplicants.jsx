import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../../utils/api'
import Sidebar from '../../components/JobListingComponents/Sidebar'
import './JobApplicants.css'

const JobApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([])

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await api.get(`/job/get-job-applicants/${jobId}`)
        if (response.status === 200) {
          setApplicants(response.data.applicants)
        }
      } catch (error) {
        alert('Failed to fetch applicants. Please try again.')
      }
    }

    fetchApplicants()
  }, [jobId])

  const handleOffer = async (applicantId) => {
    try {
      const response = await api.post(`/job/offer-job/${applicantId}`, { jobId })
      if (response.status === 200) {
        alert('Job offered successfully!')
        setApplicants(prevApplicants => 
          prevApplicants.map(applicant =>
            applicant._id === applicantId
              ? { ...applicant, status: 'Offered' }
              : applicant
          )
        )
      }
    } catch (error) {
      alert('Failed to offer the job. Please try again.')
    }
  }

  const handleReject = async (applicantId) => {
    try {
      const response = await api.post(`/job/reject-job/${applicantId}`, { jobId })
      if (response.status === 200) {
        alert('Applicant rejected.')
        setApplicants(prevApplicants => 
          prevApplicants.map(applicant =>
            applicant._id === applicantId
              ? { ...applicant, status: 'Rejected' }
              : applicant
          )
        )
      }
    } catch (error) {
      alert('Failed to reject applicant. Please try again.')
    }
  }

  return (
    <div className="view-applicants-page">
      <Sidebar /> {/* Assuming Sidebar component is already created */}

      <div className="applicants-container">
        <h1>Applicants for Job</h1>

        {applicants.length > 0 ? (
          <div className="applicants-list">
            {applicants.map((applicant, index) => (
              <div key={index} className="applicant-card">
                <h3>{applicant.applicantName}</h3>
                <p><strong>Email:</strong> {applicant.applicantEmail}</p>
                <p><strong>Resume:</strong> <a href={applicant.resumeLink} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                <p><strong>Cover Letter:</strong> {applicant.coverLetter}</p>
                <p><strong>Applied On:</strong> {new Date(applicant.dateApplied).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`status ${applicant.status.toLowerCase()}`}>{applicant.status}</span></p>
                
                {applicant.status === 'pending' && (
                  <div className="action-buttons">
                    <button className="offer-button" onClick={() => handleOffer(applicant._id)}>Offer Opportunity</button>
                    <button className="reject-button" onClick={() => handleReject(applicant._id)}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No applicants have applied for this job yet.</p>
        )}
      </div>
    </div>
  )
}

export default JobApplicants
