import { useState } from 'react'
import api from '../../../utils/api'
import SuccessAlert from "../../components/Alerts/SuccessAlert/SuccessAlerts"
import ErrorAlert from "../../components/Alerts/ErrorAlert/ErrorAlerts"
import './ForgotPassword.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmission = async (e) => {
    setIsLoading(true)
    e.preventDefault()
    try {
      const response = await api.post('auth/forgot-password', { email })

      if (response.status === 200) {
        console.log(response.data)
        setSuccessMsg(response.data.message)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} />}
      {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}
      <div className="form-root">
        <div className="form-container">
          <h1 className="form-title">Forgot Password</h1>
          <form className="form" onSubmit={handleSubmission}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                type="text" 
                id="email" 
                name="email" 
                placeholder="Enter your email" 
                required 
              />
            </div>
            <button className="form-submit-btn" type="submit"> { isLoading ? 'Sending...' : 'Send Email' }</button>
          </form>
          <p className="redirect-link">
            <a href="/login">Go back to Login</a>
          </p>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword

