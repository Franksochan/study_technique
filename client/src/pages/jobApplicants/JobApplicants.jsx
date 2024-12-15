import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import usePrivateApi from '../../../hooks/usePrivateApi'
import Sidebar from '../../components/JobListingComponents/Sidebar'
import './JobApplicants.css'

const JobApplicants = () => {
  const { jobId } = useParams()
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState({}) 
  const [rejectLoading, setRejectLoading] = useState({}) 
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(false)
  const privateAxios = usePrivateApi()

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await privateAxios.get(`/job/get-job-applicants/${jobId}`)
        if (response.status === 200) {
          console.log(response.data.applicants)
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
      setLoading(prevState => ({ ...prevState, [applicantId]: true })) 
      const response = await privateAxios.post(`/application/offer-job/${jobId}/${applicantId}`)
      if (response.status === 200) {
        alert('Job offered successfully!')

        setApplicants(prevApplicants =>
          prevApplicants.map(applicant =>
            applicant._id === applicantId
              ? { ...applicant, status: 'Offered' }
              : { ...applicant, status: applicant.status === 'pending' ? 'Rejected' : applicant.status }
          )
        )
      }
    } catch (error) {
      alert('Failed to offer the job. Please try again.')
    } finally {
      setLoading(prevState => ({ ...prevState, [applicantId]: false })) // Reset loading for the applicant
    }
  }

  const handleReject = async (applicantId) => {
    try {
      setRejectLoading(prevState => ({ ...prevState, [applicantId]: true }))
      const response = await privateAxios.delete(`/application/reject-job/${jobId}/${applicantId}`)
      if (response.status === 200) {
        alert('Application rejected successfully.')

        setApplicants(prevApplicants =>
          prevApplicants.map(applicant =>
            applicant._id === applicantId
              ? { ...applicant, status: 'Rejected' }
              : applicant
          )
        )
      }
    } catch (error) {
      alert('Failed to reject the application. Please try again.')
    } finally {
      setRejectLoading(prevState => ({ ...prevState, [applicantId]: false })) // Reset loading for the applicant
    }
  }

  return (
    <div className="view-applicants-page">
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} /> 

      <div className="applicants-container">
        <h1>Applicants for Job</h1>

        {applicants.length > 0 ? (
          <div className="applicants-list">
            {applicants.map((applicant) => (
              <div key={applicant._id} className="applicant-card">
                <div className='applicant-details'>
                  <img 
                    src={ applicant?.applicantProfilePic ? applicant?.applicantProfilePic : "empty dp.jpg"}
                    alt="Profile"
                    className="profile-pic"
                  />
                  <h3 onClick={() => navigate(`/applicant-profile-page/${applicant._id}/${jobId}`)}>{applicant.applicantName}</h3>
                </div>
                <p><strong>Email:</strong> {applicant.applicantEmail}</p>
                <p><strong>Resume:</strong> <a href={applicant.resumeLink} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                <p><strong>Cover Letter:</strong> {applicant.coverLetter}</p>
                <p><strong>Applied On:</strong> {new Date(applicant.dateApplied).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`status ${applicant.status.toLowerCase()}`}>{applicant.status}</span></p>

                {applicant.status === 'pending' && (
                  <div className="action-buttons">
                    <button 
                      className="offer-button" 
                      onClick={() => handleOffer(applicant._id)}
                      disabled={loading[applicant._id] || applicant.status === 'Offered'} // Disable if loading or already offered
                    >
                      {loading[applicant._id] ? 'Offering...' : 'Offer Opportunity'}
                    </button>
                    <button 
                      className='reject-button' 
                      onClick={() => handleReject(applicant._id)}
                      disabled={loading[applicant._id]} // Disable if loading
                    >
                      {rejectLoading[applicant._id] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                )}

                {applicant.status === 'Rejected' && (
                  <div className="action-buttons">
                    <button className="offer-button" disabled>
                      Rejected
                    </button>
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
