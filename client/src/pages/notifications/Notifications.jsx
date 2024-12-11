import React, { useState, useEffect } from 'react'
import api from '../../../utils/api'
import Sidebar from '../../components/JobListingComponents/Sidebar'
import './Notifications.css'
import { useParams } from 'react-router-dom'

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([])  // Defaulting to an empty array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userId } = useParams()  // Get userId from URL params
  const [showSidebar, setShowSidebar] = useState(false)

  // API endpoint for fetching notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get(`user/notifications/${userId}`)  // Use dynamic userId
  
      if (response.status = 200) {
        console.log(response)
        const notificationsData = [response.data.userNotifications] || []
        setNotifications(notificationsData)
      }
    } catch (error) {
      setError(error.response.data.error)
    } finally {
      setLoading(false) 
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Loading screen
  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <div className="notification-page">
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} /> 
      <main className="notification-content">
        <h2 className="notification-title">Notifications</h2>
        <div className="notification-list">
         {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification._id} className="notification-item">
                <p className="notification-message">{notification.message}</p>
                <small className="notification-date">
                  {new Date(notification.date).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <div>No notifications available</div>
          )}
        </div>
      </main>
    </div>
  )
}

export default NotificationPage
