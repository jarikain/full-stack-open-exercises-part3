const mongoose = require('mongoose')
const username = process.env.MONGO_USERNAME
const [, , password, name, number] = process.argv

if (process.argv.length < 3) {
  console.log('Not enough arguments. At least password required.')
  process.exit(1)
}

const url =
    `mongodb+srv://${username}:${password}@cluster0.l1m99u3.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)
    .catch(() => {
      console.log('Could not establish database connection. ' +
          'Remember to add MONGO_USERNAME environment variable and give password as argument')
      process.exit(1)
    })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Person = mongoose.model('Person', personSchema)

if (name && number) {
  const person = new Person({name, number})

  person.save()
      .then(() => {
        console.log(`added ${name} number ${number} to phonebook`)
      })
      .finally(() => {
        mongoose.connection.close()
      })

} else {
  Person.find({})
      .then(result => {
        console.log('phonebook:')

        result.forEach(person => {
          console.log(person.name, person.number)
        })
      })
      .finally(() => {
        mongoose.connection.close()
      })
}