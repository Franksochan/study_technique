import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const Chatbot = lazy(() => import('../src/pages/chatbot/Chatbot'))
const Authentication = lazy(() => import('../src/pages/auth/Authentication'))
const Homepage = lazy(() => import('../src/pages/home/Homepage'))

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/auth' element={ <Authentication /> } />
        <Route path='/' element={ <Homepage/> } />
        <Route path='/chatbot' element={ <Chatbot /> } />
      </Routes>
    </Router>
  )
}

export default App