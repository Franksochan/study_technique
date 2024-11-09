const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./db/connect')
const logger = require('./logger/logger')

const authRoute = require('./router/authRoute')
const userRoute = require('./router/userRouter')
const errorHandler = require('./middleware/errorHandler')

const app = express();
const port = process.env.PORT || 5000

// To handle JSON requests
app.use(express.json())

const corsOptions = {
  origin: "http://localhost:5173", // replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

app.use('/auth', authRoute)
app.use('/user', userRoute)

app.use(errorHandler)
 
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)

    app.listen(port, () => {
      logger.info(`Server is now listening on ${port}`)
    })
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`)
  }
}

start()