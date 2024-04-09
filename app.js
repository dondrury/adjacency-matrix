require('dotenv').config()
const path = require('path')
const express = require('express')
const chalk = require('chalk')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const graphController = require('./controllers/graph')
mongoose.set('strictQuery', true)
const app = express()

const reconnectAttemptDuration = 2000
let connector = {}
/* eslint-disable */
var connected = false
/* eslint-enable */

connect()
function connect () {
  console.log('Attempting connection to MongoDB')
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) {
      console.log(err)
    }
  })
}
mongoose.connection.on('connected', init)
function init () {
  console.log(chalk.green('Mongoose connected with URI'))
  clearInterval(connector)
  afterConnectionTasks()
}
mongoose.connection.on('disconnected', function () {
  console.log(chalk.red('Mongoose disconnected unexpectedly'))
  clearInterval(connector)
  connector = setInterval(connect, reconnectAttemptDuration)
  // process.exit(0)
})
// If the Node process ends, close the Mongoose connection, and the Mongosh connection
process.on('SIGINT', function () {
  Promise.all([mongoose.connection.close()]).then(() => {
    console.log(chalk.red('Mongoose disconnected through app termination'))
    process.exit(0)
  })
})
// If mongoose goes away, kill the process. It will bring itself back up and try again.
mongoose.connection.on('error', () => {
  mongoose.connection.close()
  console.log(chalk.red(' MongoDB connection error. Please make sure MongoDB is running.'))
  clearInterval(connector)
  connector = setInterval(connect, reconnectAttemptDuration)
})

app.set('views', 'views')
app.set('view engine', 'ejs')
app.enable('strict routing')
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}))

app.use((req, res, next) => {
  res.locals.NODE_ENV = process.env.NODE_ENV
  next()
})

app.get('/', graphController.home)

const publicServeOptions = {
  dotfiles: 'ignore',
  etag: true,
  index: false,
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}
app.use('/', express.static(path.join(__dirname, 'public'), publicServeOptions))
app.get('/composingModes', graphController.getComposingModes)
app.get('/fourTuples', graphController.getFourTuples)
app.get('/morphs/all', graphController.getAllMorphs)
app.get('/morphs/:size', graphController.getMorphs)
app.get('/morphs/edit/:id', graphController.getEditMorph)
if (process.env.NODE_ENV === 'local') {
  app.post('/morphs/edit/:id', graphController.postEditMorph)
}
app.get('/fundamentalModes', graphController.getFundamentalModes)
app.get('/fundamentalMode/:number', graphController.getFundamentalMode)
// app.get('/composeFundamentalModes/tuple/:tupleId/composition/:compositionId', graphController.getComposeFundamentalModes)
// app.get('/fourByFourComposition/c4/:compositionNumber/:fourTupleNumber', graphController.getFourByFourComposition)
app.get('/composition/:id', graphController.getComposition)
app.get('*', (req, res) => { // if page is left unspecified, this will direct to 404
  res.status(404).render('layout', { title: 'Sorry Not Found', view: '404' })
})
app.listen(process.env.PORT, () => {
  console.log(`Adjacency app listening at http://localhost:${process.env.PORT}`)
})

function afterConnectionTasks () {
  graphController.afterConnectionTasks()
}
