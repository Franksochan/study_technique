import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const LandingPage = () => {

  const navigate = useNavigate()

  const navigateToHamsterWheel = () => {
    navigate('/hamster-wheel')
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
        <button onClick={() => navigateToHamsterWheel()}>Get Started</button>
      </div>
      <div className='hero-section'>
        <img className='hero-image' src='hero.png' alt='hero-image'/>
      </div>
    </div>
    </>
  )
}

export default LandingPage