import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt } from 'react-icons/fa'
import SuccessAlert from '../../components/Alerts/SuccessAlert/SuccessAlerts'
import api from '../../../utils/api'
import './Register.css'

const Registration = () => {

  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    selectedProvince: '',
    selectedProvinceName: '',
    selectedMunicipality: '',
    selectedMunicipalityName: '',
  })
  const [error, setError] = useState('')
  const [ successMsg, setSuccessMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    api
      .get('https://psgc.gitlab.io/api/provinces/')
      .then(response => {
        const sortedProvinces = response.data.sort((a, b) =>
          a.name.localeCompare(b.name) 
        )
        setProvinces(sortedProvinces)
        setLoading(false)
      })
      .catch(error => {
        setError('Failed to load provinces.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (registrationData.selectedProvince) {
      setMunicipalities([])
      api
        .get(`https://psgc.gitlab.io/api/provinces/${registrationData.selectedProvince}/municipalities/`)
        .then(response => {
          const sortedMunicipalities = response.data.sort((a, b) =>
            a.name.localeCompare(b.name) 
          )
          setMunicipalities(sortedMunicipalities)
        })
        .catch(error => {
          setError('Failed to load cities.')
        })
    }
  }, [registrationData.selectedProvince])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // If the name is for a select (province or municipality), update the selected name as well
    if (name === 'selectedProvince') {
      const selectedProvince = provinces.find(province => province.code === value)
      setRegistrationData((prevData) => ({
        ...prevData,
        selectedProvince: value,
        selectedProvinceName: selectedProvince ? selectedProvince.name : '', 
      }))
    } else if (name === 'selectedMunicipality') {
      const selectedMunicipality = municipalities.find(municipality => municipality.code === value)
      setRegistrationData((prevData) => ({
        ...prevData,
        selectedMunicipality: value,
        selectedMunicipalityName: selectedMunicipality ? selectedMunicipality.name : '',
      }))
    } else {
      try {
        formattedValue = JSON.parse(value)
      } catch (error) {
        // Ignore parsing errors and keep the value as a string
      }

      setRegistrationData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }))
    }
  }

  const navigateToLogin = () => {
    navigate('/login')
  }

  const navigateToLandingPage = () => {
    navigate('/')
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const response = await api.post('auth/registration', {
        firstName: registrationData.firstName,
        middleName: registrationData.middleName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        password: registrationData.password,
        passwordConfirmation: registrationData.passwordConfirmation,
        province: registrationData.selectedProvinceName,
        municipality: registrationData.selectedMunicipalityName
      })

      if (response.status === 201) {
        setSuccessMsg(response.data.message)
        setTimeout(() => {
          navigate(`/verify-email/${registrationData.email}`)
        }, 3000)
        }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error.message)
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="registration-page">
      { successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} /> }
        <h1 className='lumikha-sign' onClick={() => navigateToLandingPage()}>LUMIKHA</h1>
        <div className="registration-form">
          <h1>Register</h1>
          <form>
            <div className="input-field">
              <span className="input-icon"><FaUser /></span>
              <input
                type='text'
                name='firstName'
                placeholder='    First Name'
                onChange={handleFieldChange}
              />
            </div>
            <div className="input-field">
              <span className="input-icon"><FaUser /></span>
              <input
                type='text'
                name='middleName'
                placeholder='    Middle Name'
                onChange={handleFieldChange}
              />
            </div>
            <div className="input-field">
              <span className="input-icon"><FaUser /></span>
              <input
                type='text'
                name='lastName'
                placeholder='    Last Name'
                onChange={handleFieldChange}
              />
            </div>
            <div className="input-field">
              <span className="input-icon"><FaEnvelope /></span>
              <input
                type='text'
                name='email'
                placeholder='    yourname@gmail.com'
                onChange={handleFieldChange}
              />
            </div>
            <div className="input-field">
              <span className="input-icon"><FaLock /></span>
              <input
                type='password'
                name='password'
                placeholder='    Password'
                onChange={handleFieldChange}
              />
            </div>
            <div className="input-field">
              <span className="input-icon"><FaLock /></span>
              <input
                type='password'
                name='passwordConfirmation'
                placeholder='    Confirm Password'
                onChange={handleFieldChange}
              />
            </div>
            <select
              name="selectedProvince"
              value={registrationData.selectedProvince}
              onChange={handleFieldChange}
              required
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {registrationData.selectedProvince && (
              <select
                name='selectedMunicipality'
                value={registrationData.selectedMunicipality}
                onChange={handleFieldChange}
                required
              >
                <option>Select Municipality</option>
                {municipalities.map((municipality) => (
                  <option key={municipality.code} value={municipality.code}>
                    {municipality.name}
                  </option>
                ))}
              </select>
            )}
          </form>
          {error && <p className="error-message">{error}</p>}
          <div className="form-footer">
            <button onClick={handleSubmit}>{isLoading ? 'Registering...' : 'Register'}</button>
            <button onClick={() => navigateToLogin()}>Back to Login</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Registration
