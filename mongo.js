const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Give the password, user, and phone number as arguments');
    process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0-i6pji.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, {useNewUrlParser: true});

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('Phonebook:');
        result.forEach(person => console.log(`${person.name} ${person.number}`));
        mongoose.connection.close();
    });
}
if (process.argv.length === 5) {
    const newPerson = new Person({
        name: String(process.argv[3]),
        number: String(process.argv[4]),
    });

    newPerson.save().then(response => {
        console.log(`Added ${response.name} number ${response.number} to the phonebook`);
        mongoose.connection.close();
    });
}


