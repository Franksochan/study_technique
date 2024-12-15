import { useState } from 'react'
import api from '../../../utils/api'
import { useNavigate, useParams } from 'react-router-dom'
import SuccessAlert from "../../components/Alerts/SuccessAlert/SuccessAlerts"
import ErrorAlert from "../../components/Alerts/ErrorAlert/ErrorAlerts"
import './ResetPassword.css'

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', 'password-confirmation': '' })
  const [ successMsg, setSuccessMsg ] = useState(null)
  const [ errorMsg, setErrorMsg ] = useState(null)
  const { resetToken } = useParams()
  const navigate = useNavigate()

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      console.log(formData.password)
      const response = await api.put(`auth/reset-password/${resetToken}`, {
        newPassword: formData.password,
        newPasswordConfirmation: formData['password-confirmation']
      })

      if (response.status === 200) {
        setSuccessMsg(response.data.message)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error.message)
      }
    }
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  const closeAlert = () => {
    setSuccessMsg(null)
    navigate('/login')
  }
  return (
    <>
      { successMsg && <SuccessAlert message={successMsg} onClose={() => closeAlert()} /> }
      { errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}
      <div className='form-root'>
        <div className='form-container'>
          <div className='form-title'>Reset Password</div>

          <form className='form' onSubmit={handleSubmission}>
            <div className='form-group'>
              <label htmlFor='password'>Password</label>
              <input onChange={handleFieldChange} type='password' id='password' name='password' placeholder='Enter new password' required />
            </div>

            <div className='form-group'>
              <label htmlFor='password'>Confirm Password</label>
              <input onChange={handleFieldChange} type='password' id='password-confirmation' name='password-confirmation' placeholder='Confirm new password' required />
            </div>

            <button className='form-submit-btn' type='submit'>
              Change Password
            </button>
          </form>

          <p className='redirect-link'>
            <a href='/login' className='redirect-link'>
              Go back to Login
            </a>
          </p>
        </div>
      </div>
    </>
  )
}

export default ResetPassword