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
          <li><a href='/profile'>Profile</a></li>
          <li><a href='/dashboard'>Dashboard</a></li>
          <li><a href='/settings'>Account Settings</a></li>
          <li><a href='/messages'>Messages</a></li>
          <li><a href='/notifications'>Notifications</a></li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
