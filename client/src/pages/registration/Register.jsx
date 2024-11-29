import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Register.css'

const Registration = () => {
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedMunicipality, setSelectedMunicipalities] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get('https://psgc.gitlab.io/api/provinces/')
      .then(response => {
        setProvinces(response.data)
        setLoading(false)
      })
      .catch(error => {
        setError('Failed to load provinces.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      console.log(selectedProvince)
      setMunicipalities([])
      axios
        .get(`https://psgc.gitlab.io/api/provinces/${selectedProvince}/municipalities/`)
        .then(response => {
          setMunicipalities(response.data)
        })
        .catch(error => {
          setError('Failed to load cities.')
        })
    }
  }, [selectedProvince])

  const handleProvinceChange = (event) => {
    setSelectedProvince(event.target.value)
  }

  const handleMunicipalityChange = (event) => { 
    setSelectedMunicipalities(event.target.value)
  }

  const navigateToLogin = () => {
    navigate('/login')
  }

  return (
    <>
      <div className="registration-page">
      <h1 className='lumikha-sign'>LUMIKHA</h1>
      <div className="registration-form">
        <h1>Register</h1>
        <form>
            <input
              type='text'
              name='first-name'
              placeholder='First Name'
            />
            <input
              type='text'
              name='middle-name'
              placeholder='Middle Name'
            />
            <input
              type='text'
              name='last-name'
              placeholder='Last Name'
            />
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
             <input
              type='password'
              name='password-confirmation'
              placeholder='Confirm Password'
            />
            <select
              name="province"
              value={selectedProvince}
              onChange={handleProvinceChange}
              required
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            { selectedProvince && 
                <select
                  name='city'
                  value={selectedMunicipality}
                  onChange={handleMunicipalityChange}
                  required
                >
                <option>Select City</option>
                {municipalities.map((municipality) => (
                  <option key={municipality.code} value={municipality.code}>
                    {municipality.name}
                  </option>
                ))}
                </select>
            }            
          </form>
          <div className="form-footer">
            <button>Register</button>
            <button onClick={() => navigateToLogin()}>Back to Login</button>
        </div>
      </div>
      </div>
    </>
  )
}

export default Registration