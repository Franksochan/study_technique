// router/chatbot.js

const express = require('express')
const Groq = require('groq-sdk')
const router = express.Router()

// Load environment variables from .env file
require('dotenv').config()

// Initialize Groq with the API key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// In-memory storage for conversation history
let conversationHistory = []

// Route to generate AI questions and manage conversation history
router.post('/generate-questions', async (req, res) => {
  const userMessage = req.body.message; // Get user message from the request body
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  // Store the user's message in the conversation history
  conversationHistory.push({ role: 'user', content: userMessage })

  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": "You are a learning assistant. Your job is to generate 3 to 5 questions based on the user's lesson or topic. After each question, wait for the user to submit their answer. Once the user provides their answer, evaluate whether it is correct or incorrect, and provide feedback. After checking all the answers, summarize the user's performance, highlighting areas of strength and suggesting improvements where needed. Make sure that the user prompt is a lesson. If it's not, greet them and guide them on how to use you."
        },
        ...conversationHistory // Include the conversation history
      ],
      "model": "llama3-8b-8192",
      "temperature": 1,
      "max_tokens": 1024,
      "top_p": 1,
      "stream": true,
      "stop": null
    })

    let responseContent = ''

    // Capture the response stream
    for await (const chunk of chatCompletion) {
      responseContent += chunk.choices[0]?.delta?.content || ''
    }

    // Store the AI's response in the conversation history
    conversationHistory.push({ role: 'assistant', content: responseContent })

    // Send the full response content back to the client
    res.status(200).json({ response: responseContent })
  } catch (error) {
    console.error('Error fetching AI-generated content:', error)
    res.status(500).json({ error: 'Failed to generate questions.' })
  }
})

// Route to get conversation history (optional)
router.get('/conversation-history', (req, res) => {
  res.status(200).json(conversationHistory)
})

module.exports = router
