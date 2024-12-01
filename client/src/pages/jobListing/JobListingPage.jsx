import Sidebar from '../../components/JobListingComponents/Sidebar'
import JobListing from '../../components/JobListingComponents/JobListing'

const JobListingPage = () => {
  return (
    <div className="job-listing-container">
      <Sidebar />
      <JobListing />
    </div>
  )
}

export default JobListingPage
