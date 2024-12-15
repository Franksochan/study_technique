import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import usePrivateApi from "../../../hooks/usePrivateApi"
import Sidebar from "../../components/JobListingComponents/Sidebar"
import "./JobPosterProfile.css"

const JobPosterProfile = () => {
  const { jobPosterId, jobId } = useParams()
  const [jobPoster, setJobPoster] = useState(null)
  const privateAxios = usePrivateApi()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchJobPoster = async () => {
      try {
        const response = await privateAxios.get(`/user/get-user/${jobPosterId}`)
        if (response.status === 200) {
          setJobPoster(response.data.user)
        }
      } catch (error) {
        alert("Failed to fetch applicant data.")
      }
    }

    fetchJobPoster()
  }, [jobPosterId])

  // Helper function to check for and render social links
  const renderSocialLinks = () => {
    const { facebook, twitter, instagram, github } = jobPoster.socialLinks || {}
    const socialLinks = [
      { name: 'facebook', url: facebook, icon: '/icons/facebook.svg' },
      { name: 'twitter', url: twitter, icon: '/icons/twitter.svg' },
      { name: 'instagram', url: instagram, icon: '/icons/instagram.svg' },
      { name: 'github', url: github, icon: '/icons/github.svg' },
    ]

    return socialLinks.filter(link => link.url).length > 0 ? (
      socialLinks.map((link, index) =>
        link.url ? (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <img src={link.icon} alt={link.name} />
          </a>
        ) : null
      )
    ) : (
      <p className="no-social-links">No social links available.</p>
    )
  }

  return (
    <div className="applicant-profile-page">
      <Sidebar />
      <div className="profile-container">
        <button className="back-button" onClick={() => navigate(`/apply/${jobId}`)}>
          Back To Application
        </button>

        {jobPoster ? (
          <>
            <header className="profile-header">
              <div className="profile-banner">
                <img
                  src={jobPoster.bannerPic || "/default-banner.png"}
                  alt="Banner"
                  className="banner-image"
                />
              </div>
              <div className="profile-info">
                <div className="profile-pic-wrapper">
                  <img
                    src={jobPoster.profilePic || "/default-profile.png"}
                    alt="Profile"
                    className="profile-pic"
                  />
                </div>
                <h1 className="profile-name">{jobPoster.name}</h1>
                <p className="profile-email">{jobPoster.email}</p>
                <p className="profile-location">{jobPoster.location}</p>
                <div className="social-links">
                  {renderSocialLinks()}
                </div>
              </div>
            </header>

            <main className="profile-main">
              <section className="bio-section card">
                <h2 className="section-title">Bio</h2>
                <p>{jobPoster.bio || "No bio available."}</p>
              </section>
            </main>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

export default JobPosterProfile
