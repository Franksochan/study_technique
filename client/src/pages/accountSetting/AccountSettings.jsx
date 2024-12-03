import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../../../utils/api"
import "./AccountSettings.css"

const AccountSettings = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleChangeEmail = async () => {
    try {
      await api.post("/user/change-email", { email })
      alert("Email updated successfully!")
    } catch (error) {
      alert("Failed to update email.")
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.")
      return
    }
    try {
      await api.post("/user/change-password", { currentPassword, newPassword })
      alert("Password updated successfully!")
    } catch (error) {
      alert("Failed to update password.")
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

      {/* Change Email Section */}
      <div className="settings-section">
        <h2>Change Email</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your new email"
        />
        <button onClick={handleChangeEmail}>Save Email</button>
      </div>

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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
        />
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
