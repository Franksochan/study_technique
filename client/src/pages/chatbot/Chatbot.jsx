import { useState, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

const Chatbot = () => {
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsError(false)
    setErrorMessage('')

    setIsLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/generate-questions', {
        message: message,
      })

      setResponses([...responses, { role: 'user', content: message }, { role: 'assistant', content: response.data.response }]);
      setMessage('')
    } catch (error) {
      setIsError(true)
      setErrorMessage('Error sending message to the server. Please try again.');
      console.error('Error sending message to the server:', error);
    } finally {
      setIsLoading(false)
    }
  }

  // Automatically send an initial message when the component mounts
  useEffect(() => {
    const initialMessage = "Hello! I'm your learning assistant. Please tell me what lesson or topic you want to discuss."
    setResponses((prevResponses) => [
      ...prevResponses,
      { role: 'assistant', content: initialMessage },
    ])
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Chat with AI</h2>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          height: '300px',
          overflowY: 'scroll',
          marginBottom: '20px',
          borderRadius: '5px',
        }}
      >
        {responses.map((resp, index) => (
          <div key={index} style={{ marginBottom: '15px', padding: '5px', borderRadius: '5px', backgroundColor: resp.role === 'user' ? '#e0f7fa' : '#f1f8e9' }}>
            <strong style={{ display: 'block', marginBottom: '5px' }}>{resp.role === 'user' ? 'You' : 'AI'}:</strong>
            <span>
              <ReactMarkdown>{resp.content}</ReactMarkdown>
            </span>
          </div>
        ))}
        {isLoading && (
          <div style={{ marginBottom: '10px', fontStyle: 'italic', color: '#888' }}>
            AI is typing...
          </div>
        )}
        {isError && (
          <div style={{ marginBottom: '10px', color: 'red' }}>
            {errorMessage}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
          required
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
          Send
        </button>
      </form>
    </div>
  )
}

export default Chatbot
