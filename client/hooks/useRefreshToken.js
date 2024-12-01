import api from "../utils/api"
import useAuth from "./useAuth"

const useTokenRefresh = () => {
  const { setAuth } = useAuth()

  const refreshAccessToken = async () => {
    try {
      const refreshResponse = await api.post(
        '/token/refresh', {},
        { withCredentials: true }
      )

      const newAccessToken = refreshResponse.data.newAccessToken

      setAuth({ accessToken: newAccessToken })

      return newAccessToken
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError)
    }
  }

  return refreshAccessToken
}

export default useTokenRefresh