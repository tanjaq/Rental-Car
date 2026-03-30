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
    const input = {
        pickup: String(post.pickup),
        dropoff: String(post.dropoff),
        pickupDate: post.pickupdate,
        dropoffDate: post.dropoffdate,
        type: String(post.type),
        age: Number(post.age),
    };

    const result = rental.calculatePrice(input);

    if (!result.success) {
        return res.send(formHtml + `<p style="color:red">${result.message}</p>`);
    }

    const filled = resultHtml
        .replaceAll('{{CAR_TYPE}}', result.carClass)
        .replaceAll('{{DAYS}}', String(result.days))
        .replaceAll('{{PRICE_PER_DAY}}', '$' + result.perDay)
        .replaceAll('{{TOTAL}}', '$' + result.total);

    res.send(formHtml + filled);
});

app.get('/', (req, res) => {
    res.send(formHtml);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
