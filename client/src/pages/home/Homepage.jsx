import { useNavigate } from 'react-router-dom'
import './Homepage.css'

const Homepage = () => {

  const navigate = useNavigate()

  const navigateToAuth = async () => {
    navigate('/auth')
  }

  return (
    <>
    <div className="home-page">
      <div className='home-intro'>
        <h1>LUMIKHA</h1>
        <p>
          Empowering Filipino freelancers and clients to collaborate and succeed together.<br />
          Join us in building a thriving freelance community!
        </p>
        <button onClick={() => navigateToAuth()}>Get Started</button>
      </div>
      <div className='hero-section'>
        <img className='hero-image' src='hero.png' alt='hero-image'/>
      </div>
    </div>
    </>
  )
}

export default Homepage