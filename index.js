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

let phonebook = [
    {
        'name': 'Ada Lovelace',
        'number': '123456789',
        'id': 1
    },
    {
        'name': 'Dan Abramov',
        'number': '12-43-234345',
        'id': 2
    },
    {
        'name': 'Mary Poppendieck',
        'number': '39-23-6423122',
        'id': 3
    },
    {
        'name': 'Jacob Biehler',
        'number': '8584845307',
        'id': 6
    },
    {
        'name': 'henlo',
        'number': '0987654321',
        'id': 7
    },
    {
        'name': 'hello',
        'number': '1234567890',
        'id': 8
    },
    {
        'name': 'wowee',
        'number': '159753456',
        'id': 9
    },
    {
        'name': 'ejwpajfio',
        'number': '1919189',
        'id': 10
    }
];

app.get('/api/persons', (request, response) => Person.find({}).then(person => response.json(person.map(p => p.toJSON()))));

app.post('/api/persons', (request, response) => {
    const body = request.body;
    let name;
    let number;

    if (body.name) {
        name = body.name;
    } else {
        return response.status(400).json({error: 'Name is missing'});
    }

    if (body.number) {
        number = body.number;
    } else {
        return response.status(400).json({error: 'Number is missing'});
    }

    const duplicateName = phonebook.filter(person => person.name === name);
    if (duplicateName.length > 0) {
        return response.status(400).json({error: 'Name must be unique'});
    }

    const person = {
        name: name,
        number: number,
        id: generateId(phonebook.length),
    };

    phonebook = phonebook.concat(person);

    response.json(person);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = phonebook.find(person => person.id === id);

    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);

    phonebook = phonebook.filter(person => person.id !== id);
    response.status(204).end();
});

app.get('/info', (request, response) => {
    const date = new Date();

    response.send(`Phonebook has info for ${phonebook.length} people\n\n${date}`);
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknownEndpoint'});
};

app.use(unknownEndpoint);
app.use(requestLogger);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
