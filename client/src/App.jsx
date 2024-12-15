import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '../context/AuthContext'
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
const AppliedJobsPage = lazy(() => import('./pages/appliedJobs/AppliedJobs'))
const PersistLogin = lazy(() => import('./components/PersistLogin'))
const PostedJobsPage = lazy(() => import('./pages/postedJobs/PostedJobs'))
const JobPosterProfile = lazy(() => import('./pages/jobPosterProfile/JobPosterProfile'))
const HamsterWheel = lazy(() => import('./components/HamsterWheel/HamsterWheel'))
const NotFoundPage = lazy(() => import('./pages/notFound/NotFound'))
const ForgotPassword = lazy(() => import('./pages/forgotPassword/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/resetPassword/ResetPassword'))

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/login' element={ <Login /> } />
            <Route path='/' element={ <LandingPage/> } />
            <Route path='/register' element={ <Registration/> } />
            <Route path='/verify-email/:email' element={ <Verification/> } />
            <Route path='/hamster-wheel' element={ <HamsterWheel/>} />
            <Route path='/forgot-password' element={ <ForgotPassword />} />
            <Route path='/reset-password/:resetToken' element={ <ResetPassword />} />
            <Route element={<PersistLogin />}>
              <Route path='/job-listings' element={ <JobListingPage/> } />
              <Route path='/profile' element={ <ProfilePage/> } />
              <Route path='/settings' element={ <AccountSettings /> } />
              <Route path='/apply/:jobId' element={ <JobApplicationPage />} />
              <Route path='/applicants/:jobId' element={ <JobApplicants />} />
              <Route path='/notifications/:userId' element={ <NotificationsPage />} />
              <Route path='/applicant-profile-page/:applicantId/:jobId' element={ <ApplicantProfilePage />} />
              <Route path='/job-poster-profile/:jobPosterId/:jobId' element={ <JobPosterProfile />} />
              <Route path='/applied-jobs/:userId' element={ <AppliedJobsPage />} />
              <Route path='/posted-jobs/:userId' element={ <PostedJobsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App