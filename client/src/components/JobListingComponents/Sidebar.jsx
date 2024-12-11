import { useEffect, useState } from 'react'
import useUserData from '../../../hooks/useUserData'
import './Sidebar.css'

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const { user } = useUserData()
  const userId = localStorage.getItem('userID')

  // Toggle sidebar visibility when the profile icon is clicked
  const handleProfileClick = () => {
    setShowSidebar(!showSidebar)
  }

  return (
    <aside className={`sidebar ${showSidebar ? 'expanded' : 'collapsed'}`}>
      <div className="profile-section" onClick={handleProfileClick}>
        <img 
          src={user?.profilePic ? user?.profilePic : "empty dp.jpg"}
          alt="Profile" 
          className="profile-icon"
        />
        {showSidebar && <h3 className="profile-name">{user.name}</h3>}  {/* Show name only when expanded */}
      </div>
      {showSidebar && (  
        <nav className="sidebar-menu">
          <ul>
            <li><a href='/profile'>Profile</a></li>
            <li><a href='/settings'>Account Settings</a></li>
            <li><a href={`/notifications/${userId}`}>Notifications</a></li>
            <li><a href='/login'>Logout</a></li>
          </ul>
        </nav>
      )}
    </aside>
  )
}

export default Sidebar
