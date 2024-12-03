import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../../utils/api"
import "./ProfilePage.css"

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [bio, setBio] = useState("")
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
  })
  const [isEditingLinks, setIsEditingLinks] = useState(false)
  const [newLinkPlatform, setNewLinkPlatform] = useState("")
  const [newLinkValue, setNewLinkValue] = useState("")

  const userId = localStorage.getItem("userID")
  const navigate = useNavigate()

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await api.get(`user/get-user/${userId}`)
      if (response.status === 200) {
        setUser(response.data.user)
        setSocialLinks(response.data.user.socialLinks || {})
      }
    } catch (error) {
      alert("Failed to fetch user data.")
    }
  }

  const handleSaveBio = async () => {
    try {
      const response = await api.post(`user/add-bio/${userId}`, { newBio: bio })
      if (response.status === 200) {
        setIsEditingBio(false)
        alert("Bio updated!")
      }
    } catch (error) {
      alert("Failed to update bio.")
    }
  }

  const handleAddLink = async () => {
    if (!newLinkPlatform || !newLinkValue) {
      alert("Please fill in both platform and link.")
      return
    }
    try {
      const response = await api.post(`user/add-link/${userId}`, { platform: newLinkPlatform, link: newLinkValue })

      if (response.status === 200) {
        setSocialLinks((prevLinks) => ({
          ...prevLinks,
          [newLinkPlatform]: newLinkValue,
        }))

        setNewLinkPlatform("")
        setNewLinkValue("")
        setIsEditingLinks(false)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.error.message)
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  return (
    <div className="profile-page">
      <button className="back-button" onClick={() => navigate("/job-listings")}>
        Back to Vita Craft
      </button>
      {user ? (
        <>
          <header className="profile-header">
            <div className="profile-banner">
              <img
                src={user.bannerPic || "/default-banner.png"}
                alt="Banner"
                className="banner-image"
              />
            </div>
            <div className="profile-info">
              <img
                src={user.profilePic || "empty dp.jpg"}
                alt="Profile"
                className="profile-pic"
              />
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <p className="profile-location">{user.location}</p>
            </div>
          </header>

          <main className="profile-main">
            <section className="bio-section card">
              <h2 className="section-title">Bio</h2>
              {isEditingBio ? (
                <div className="bio-editor">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="4"
                    className="bio-textarea"
                  />
                  <button onClick={handleSaveBio} className="save-button">
                    Save
                  </button>
                  <button onClick={() => setIsEditingBio(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="bio-content">
                  <p>{user.bio || "Add a bio to tell more about yourself."}</p>
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="edit-button"
                  >
                    Edit Bio
                  </button>
                </div>
              )}
            </section>

            <section className="social-links-section card">
              <h2 className="section-title">Links</h2>
              <div className="social-links-list">
                {Object.keys(socialLinks).map(
                  (platform) =>
                    socialLinks[platform] && (
                      <div key={platform} className="social-link-item">
                        <strong>{platform}:</strong>{" "}
                        <a href={socialLinks[platform]} target="_blank" rel="noopener noreferrer">
                          {socialLinks[platform]}
                        </a>
                      </div>
                    )
                )}
              </div>
              <button
                className="add-link-button"
                onClick={() => setIsEditingLinks(!isEditingLinks)}
              >
                {isEditingLinks ? "Cancel" : "Add Link"}
              </button>
              {isEditingLinks && (
                <div className="add-link-form">
                  <select
                    value={newLinkPlatform}
                    onChange={(e) => setNewLinkPlatform(e.target.value)}
                    className="platform-select"
                  >
                    <option value="">Select Platform</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="github">Github</option>
                  </select>
                  <input
                    type="url"
                    value={newLinkValue}
                    placeholder="Enter link"
                    onChange={(e) => setNewLinkValue(e.target.value)}
                    className="link-input"
                  />
                  <button onClick={handleAddLink} className="save-link-button">
                    Save Link
                  </button>
                </div>
              )}
            </section>

            <section className="connections-section card">
              <h2 className="section-title">Connections</h2>
              <p>{user.followers.length} Followers</p>
              <p>{user.following.length} Following</p>
            </section>

            <section className="additional-info-section card">
              <p>Joined on: {new Date(user.joinedDate).toLocaleDateString()}</p>
            </section>
          </main>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default ProfilePage
