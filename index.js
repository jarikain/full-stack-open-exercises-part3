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

let persons = []

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(returnedPersons => {
      persons = returnedPersons
      response.json(returnedPersons)
    })
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

app.get('/api/persons/:id', (request, response) => {
  Person
    .findById(request.params.id)
    .then(person => response.json(person))
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

function generateId() {
  return (
    Math.floor(Math.random() * 100000000)
  )
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'missing name or number'
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)
  response.json(newPerson)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})