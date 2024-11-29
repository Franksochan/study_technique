import { useNavigate } from 'react-router-dom'
import './Login.css'
 
const Login = () => {
  const navigate = useNavigate()

  const navigateToRegistration = () => {
    navigate('/register')
  }

  return (
    <>
     <div className="login-page">
      <h1 className='lumikha-sign'>LUMIKHA</h1>
      <div className="login-form">
        <h1>Login</h1>
        <form>
            <input
              type='text'
              name='email'
              placeholder='yourname@gmail.com'
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
            />
          </form>
          <div className="form-footer">
            <p>Forgot Password?</p>
            <button>Login</button>
            <p>Don't have an account yet?</p>
            <button onClick={() => navigateToRegistration()}>Sign in</button>
        </div>
      </div>
      </div>
    </>
  )
}

export default Login