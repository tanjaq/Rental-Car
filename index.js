const express = require('express');
const bodyParser = require('body-parser');
const rental = require('./rentalPrice');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/pictures', express.static('images'));

const formHtml = fs.readFileSync('form.html', 'utf8');
const resultHtml = fs.readFileSync('result.html', 'utf8');

app.post('/', (req, res) => {
    const post = req.body;
    const result = rental.price(
        Date.parse(post.pickupdate),
        Date.parse(post.dropoffdate),
        String(post.carType),
        Number(post.driverAge),
        Number(post.licenseDuration)
    );
    const carNames = {
        "Compact": "Compact Car",
        "Electric": "Electric Car",
        "Cabrio": "Cabrio Car",
        "Racer": "Racer Car"
    };
    const filteredResultHtml = resultHtml
        .replace('Car Name', carNames[post.carType])
        .replace('Price: $0 per day', `Price: ${result} per day`);

    res.send(formHtml + filteredResultHtml);
});

app.get('/', (req, res) => {
    res.send(formHtml);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
