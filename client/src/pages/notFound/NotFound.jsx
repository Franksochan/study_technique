import './NotFoundPage.css'

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-intro">
        <h1>404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <button onClick={() => window.location.href = '/job-listings'}>Go Back Home</button>
      </div>
    </div>
  )
}

export default NotFoundPage