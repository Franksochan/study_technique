import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import api from '../../../utils/api'
import './Login.css'
 
const Login = () => {
  const [ loginData, setLoginData ] = useState({})
  const navigate = useNavigate()
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
    try {
      const response = await api.post('auth/login', { email: loginData.email, password: loginData.password })

      if (response.status === 200) {
        console.log(response)
        const { userID,  accessToken } = response.data
        setAuth({ accessToken })
        alert(response.data.message)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.error.message)
      } else {
        alert('An error occurred. Please try again.')
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
            <input
              type='text'
              name='email'
              placeholder='yourname@gmail.com'
              onChange={handleFieldChange}
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
              onChange={handleFieldChange}
            />
          </form>
          <div className="form-footer">
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