require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

const Person = require('./models/person')

const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', (request) => {
  const data = JSON.stringify(request.body)
  return data === '{}'
    ? " "
    : data
})

app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :data'
))

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(returnedPersons => response.json(returnedPersons))
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person
    .find({})
    .then(persons => {
      response.send(`
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>
        `)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => response.json(person))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const {name, number} = request.body
  const newPerson = new Person({name, number})

  newPerson
    .save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body

  Person
    .findByIdAndUpdate(
      request.params.id,
      {name, number},
      {new: true, runValidators: true, context: 'query'})
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

const unknownEndpointsHandler = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpointsHandler)

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformed id'})
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({error: error.message})
  }

  next(error)
}
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})