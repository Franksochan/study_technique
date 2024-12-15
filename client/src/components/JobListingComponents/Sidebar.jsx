import { Link } from 'react-router-dom'
import { FaUser, FaCog, FaBell, FaSuitcase, FaPaperclip, FaSignOutAlt } from 'react-icons/fa'
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
          src={user?.profilePic ? user?.profilePic : "/empty dp.jpg"}
          alt="Profile" 
          className="profile-icon"
        />
        {showSidebar && <h3 className="profile-name">{user.name}</h3>} 
      </div>
      {showSidebar && (  
        <nav className="sidebar-menu">
          <ul>
            <li><Link to='/profile'><FaUser /> Profile</Link></li>
            <li><Link to='/settings'><FaCog /> Account Settings</Link></li>
            <li><Link to={`/notifications/${userId}`}><FaBell /> Notifications</Link></li>
            <li><Link to={`/applied-jobs/${userId}`}><FaSuitcase /> Applied Jobs</Link></li>
            <li><Link to={`/posted-jobs/${userId}`}><FaPaperclip /> Posted Jobs</Link></li>
            <li><Link to='/login'><FaSignOutAlt /> Logout</Link></li>
          </ul>
        </nav>
      )}
    </aside>
  )
}

export default Sidebar
