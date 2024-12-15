import { useState, useEffect } from "react"
import usePrivateApi from "./usePrivateApi"
import { useNavigate } from "react-router-dom"

const useUserData = () => {
  const [user, setUser] = useState({})
  const userID = localStorage.getItem('userID')
  const navigate = useNavigate()
  const privateAxios = usePrivateApi()

  useEffect(() => {
    console.log(userID)
    const fetchUserData = async () => {
      try {
        const response = await privateAxios.get(
          `/user/get-user/${userID}`
        )
        setUser(response.data.user)
      } catch (error) {
        console.log(error)
        if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 404 || error.response.status === 500 || error.response.status === 400)) {
          console.log("Token expired. Navigating to /login")
          navigate('/login')
        }
      }
    }

    if (userID) { 
      fetchUserData()
    }
  }, [userID])

  return { user }
}

export default useUserData
