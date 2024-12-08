import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './App.css'

const Login = lazy(() => import('./pages/login/Login'))
const LandingPage = lazy(() => import('./pages/landing/LandingPage'))
const Registration = lazy(() => import('../src/pages/registration/Register'))
const Verification = lazy(() => import('../src/pages/emailVerification/Verification'))
const JobListingPage = lazy(() => import('./pages/jobListing/JobListingPage'))
const ProfilePage = lazy(() => import('./pages/profilePage/ProfilePage'))
const AccountSettings = lazy(() => import('./pages/accountSetting/AccountSettings'))
const JobApplicationPage = lazy(() => import('./pages/jobApplication/JobApplicationPage'))
const JobApplicants = lazy(() => import('./pages/jobApplicants/JobApplicants'))
const NotificationsPage = lazy(() => import('./pages/notifications/Notifications'))
const ApplicantProfilePage = lazy(() => import('./pages/applicantProfile/ApplicantProfilePage'))

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
          <Route path='/profile' element={ <ProfilePage/> } />
          <Route path='/settings' element={ <AccountSettings /> } />
          <Route path='/apply/:jobId' element={ <JobApplicationPage />} />
          <Route path='/applicants/:jobId' element={ <JobApplicants />} />
          <Route path='/notifications/:userId' element={ <NotificationsPage />} />
          <Route path='/applicant-profile-page/:applicantId/:jobId' element={ <ApplicantProfilePage />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App