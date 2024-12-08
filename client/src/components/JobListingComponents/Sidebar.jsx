import { useEffect, useState } from 'react'
import useUserData from '../../../hooks/useUserData'
import './Sidebar.css'

const Sidebar = () => {
  const { user } = useUserData()

  const userId = localStorage.getItem('userID')
  return (
    <aside className="sidebar">
      <div className="profile-section">
        <img 
          src={ user?.profilePic ? user?.profilePic : "https://via.placeholder.com/80" }
          alt="Profile" 
          className="profile-icon"
        />
        <h3 className="profile-name">{user.name}</h3>
      </div>
      <nav className="sidebar-menu">
        <ul>
          <li><a href='/profile'>Profile</a></li>
          <li><a href='/dashboard'>Dashboard</a></li>
          <li><a href='/settings'>Account Settings</a></li>
          <li><a href={`/notifications/${userId}`}>Notifications</a></li>
          <li><a href='/login'>Logout</a></li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
