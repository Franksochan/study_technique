import './Sidebar.css'

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="profile-section">
        <img 
          src="https://via.placeholder.com/80" 
          alt="Profile" 
          className="profile-icon"
        />
        <h3 className="profile-name">John Doe</h3>
      </div>
      <nav className="sidebar-menu">
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/saved-jobs">Saved Jobs</a></li>
          <li><a href="/applied-jobs">Applied Jobs</a></li>
          <li><a href="/settings">Account Settings</a></li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
