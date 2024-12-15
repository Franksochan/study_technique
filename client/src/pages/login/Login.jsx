import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import api from '../../../utils/api'
import './Login.css'
 
const Login = () => {
  const [ loginData, setLoginData ] = useState({})
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const { setAuth } = useAuth()

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

      try {
        formattedValue = JSON.parse(value)
      } catch (error) {
        // Ignore parsing errors and keep the value as a string
      }

      setLoginData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }))
    }

  const handleSubmit = async () => {
    if (!loginData.email || !loginData.password) {
      alert('Please fill in all the required fields')
      return
    }
    try {
      const response = await api.post('auth/login', { email: loginData.email, password: loginData.password }, 
        { withCredentials: true }
      )

      if (response.status === 200) {
        console.log(response)
        const { userID,  accessToken } = response.data
        console.log(accessToken)
        setAuth({ accessToken: accessToken })
        localStorage.setItem('userID', userID)
        navigate('/job-listings')
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error.message)
      } else {
        setError('An error occurred. Please try again.')
      }
    }
  }

  const navigateToRegistration = () => {
    navigate('/register')
  }

  const navigateToLandingPage = () => {
    navigate('/')
  }

  return (
    <>
     <div className="login-page">
      <h1 className='lumikha-sign' onClick={() => navigateToLandingPage()}>LUMIKHA</h1>
      <div className="login-form">
        <h1>Login</h1>
        <form>
          <div class="input-wrapper">
            <input
              type="text"
              name="email"
              placeholder="yourname@gmail.com"
              onChange={handleFieldChange}
              required
            />
            <span class="email-icon">&#9993;</span>
          </div>
          <div class="input-wrapper">
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleFieldChange}
              required
            />
            <span class="password-icon">&#128272;</span> 
          </div>
        </form>
          <div className="form-footer">
            {error && <p className="error-message">{error}</p>}
            <p>Forgot Password?</p>
            <button onClick={() => handleSubmit()}>Login</button>
            <p>Don't have an account yet?</p>
            <button onClick={() => navigateToRegistration()}>Sign in</button>
        </div>
      </div>
      </div>
    </>
  )
}

export default Login