require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(express.static('build'));
app.use(bodyParser.json());

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

app.get('/api/persons', (request, response) => Person.find({}).then(person => response.json(person.map(p => p.toJSON()))));

app.post('/api/persons', (request, response) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => savedPerson.toJSON());
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => response.json(person.toJSON()));
});

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end());
});

app.get('/info', (request, response) => {
  const date = new Date();

  response.send(`Phonebook has info for ${Person.length} people\n\n${date}`);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknownEndpoint' });
};

app.use(unknownEndpoint);
app.use(requestLogger);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
