import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const Authentication = lazy(() => import('./pages/auth/Login'))
const Homepage = lazy(() => import('../src/pages/home/Homepage'))

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/auth' element={ <Authentication /> } />
        <Route path='/' element={ <Homepage/> } />
      </Routes>
    </Router>
  )
}

export default App