const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const connectDB = require('./db/connect')
const logger = require('./logger/logger')

const authRoute = require('./router/authRoute')
const userRoute = require('./router/userRouter')
const jobRoute = require('./router/jobRoute')
const applicationRoute = require('./router/applicationRoute')
const tokenRoute = require('./router/tokenRoute')
const errorHandler = require('./middleware/errorHandler')

const app = express();
const port = process.env.PORT || 5000

// Configure Express to parse JSON requests with a maximum size limit of 50mb
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 1000000 }))

const corsOptions = {
  origin: process.env.CLIENT, // replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.use(cookieParser())

app.use('/auth', authRoute)
app.use('/user', userRoute)
app.use('/job', jobRoute)
app.use('/application', applicationRoute)
app.use('/token', tokenRoute)

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