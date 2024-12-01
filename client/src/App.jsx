import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'


const Login = lazy(() => import('./pages/login/Login'))
const LandingPage = lazy(() => import('./pages/landing/LandingPage'))
const Registration = lazy(() => import('../src/pages/registration/Register'))
const Verification = lazy(() => import('../src/pages/emailVerification/Verification'))
const JobListingPage = lazy(() => import('./pages/jobListing/JobListingPage'))

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/login' element={ <Login /> } />
          <Route path='/' element={ <LandingPage/> } />
          <Route path='/register' element={ <Registration/> } />
          <Route path='/verify-email/:email' element={ <Verification/> } />
          <Route path='/job-listings' element={ <JobListingPage/> } />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App