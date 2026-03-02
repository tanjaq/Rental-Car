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
        // needs functionality
        String(post.pickupLocation),
        String(post.dropoffLocation),

        Date.parse(post.pickupDate),
        Date.parse(post.dropoffDate),
        String(post.carType),
        Number(post.driverAge)
    );
    res.send(formHtml + resultHtml.replaceAll('$0', result));
});

app.get('/', (req, res) => {
    res.send(formHtml);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
