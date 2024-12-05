import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../../../utils/api"
import "./AccountSettings.css"

const AccountSettings = () => {
  const [passwordForEmail, setPasswordForEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const userId = localStorage.getItem('userID')

  const handleChangePassword = async () => {
    try {
      const response = await api.put(`/user/change-password/${userId}`, { currentPassword, newPassword, newPasswordConfirmation })
      
      if (response.status === 200) {
        alert(response.data.message)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.error.message)
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await api.delete("/user/delete-account")
        alert("Account deleted successfully!")
        // Redirect to login or home page
      } catch (error) {
        alert("Failed to delete account.")
      }
    }
  }

  return (
    <div className="account-settings">
      {/* Back to Vita Craft Button */}
      <Link to="/job-listings" className="back-button">
        Back to Vita Craft
      </Link>

      <h1>Account Settings</h1>
      {/* Change Password Section */}
      <div className="settings-section">
        <h2>Change Password</h2>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
        />
        <input
          type="password"
          value={newPasswordConfirmation}
          onChange={(e) => setNewPasswordConfirmation(e.target.value)}
          placeholder="Confirm new password"
        />
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <button onClick={handleChangePassword}>Save Password</button>
      </div>

      {/* Delete Account Section */}
      <div className="settings-section">
        <h2>Delete Account</h2>
        <button onClick={handleDeleteAccount} className="delete-account-button">
          Delete Account
        </button>
      </div>
    </div>
  )
}

export default AccountSettings
