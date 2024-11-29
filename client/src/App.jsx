import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const Login = lazy(() => import('./pages/login/Login'))
const Homepage = lazy(() => import('../src/pages/home/Homepage'))
const Registration = lazy(() => import('../src/pages/registration/Register'))
const Verification = lazy(() => import('../src/pages/emailVerification/Verification'))

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/login' element={ <Login /> } />
          <Route path='/' element={ <Homepage/> } />
          <Route path='/register' element={ <Registration/> } />
          <Route path='/verify-email/:email' element={ <Verification/> } />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App