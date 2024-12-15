import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./HamsterWheel.css"

const HamsterWheel = () => {
  const navigate = useNavigate()
  const [welcomeText, setWelcomeText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [welcomeTextOrigin, setWelcomeTextOrigin] = useState('Welcome to Lumikha...')

  useEffect(() => {
    if (currentIndex < welcomeTextOrigin.length) {
      const timeout = setTimeout(() => {
        setWelcomeText((prevtext) => prevtext + welcomeTextOrigin[currentIndex])
        setCurrentIndex((prevIndex) => prevIndex + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, welcomeTextOrigin])

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/login")
    }, 3500)

    return () => clearTimeout(timeout) 
  }, [navigate])

  return (
    <div className="hamster-container">
      <div
        aria-label="Orange and tan hamster running in a metal wheel"
        role="img"
        className="wheel-and-hamster"
      >
        <div className="wheel"></div>
        <div className="hamster">
          <div className="hamster__body">
            <div className="hamster__head">
              <div className="hamster__ear"></div>
              <div className="hamster__eye"></div>
              <div className="hamster__nose"></div>
            </div>
            <div className="hamster__limb hamster__limb--fr"></div>
            <div className="hamster__limb hamster__limb--fl"></div>
            <div className="hamster__limb hamster__limb--br"></div>
            <div className="hamster__limb hamster__limb--bl"></div>
            <div className="hamster__tail"></div>
          </div>
        </div>
        <div className="spoke"></div>
      </div>

      <div className="welcome-text">
        <h1>{welcomeText}</h1>
      </div>
    </div>
  )
}

export default HamsterWheel
