const express = require('express');
const bodyParser = require('body-parser');
const rental = require('./main/rentalPrice');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/pictures', express.static('images'));

const formHtml = fs.readFileSync('./main/form.html', 'utf8');
const resultHtml = fs.readFileSync('./main/result.html', 'utf8');

app.post('/', (req, res) => {
    const post = req.body;
    const result = rental.calculateRentalPrice(
        Date.parse(post.pickupdate),
        Date.parse(post.dropoffdate),
        String(post.type),
        Number(post.age)
    );
    res.send(formHtml + resultHtml.replace('Price: $0', result));
});

app.get('/', (req, res) => {
    res.send(formHtml);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
