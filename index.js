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
        String(post.pickup),
        String(post.dropoff),
        Date.parse(post.pickupdate),
        Date.parse(post.dropoffdate),
        String(post.type),
        Number(post.age),
        Number(post.licenseYears)
    );

    const compactPrice = result.compactPrice || "N/A";
    const electricPrice = result.electricPrice || "N/A";
    const cabrioPrice = result.cabrioPrice || "N/A";
    const racerPrice = result.racerPrice || "N/A";

    const resultHtmlWithPrice = resultHtml
        .replace("{{compactPrice}}", compactPrice)
        .replace("{{electricPrice}}", electricPrice)
        .replace("{{cabrioPrice}}", cabrioPrice)
        .replace("{{racerPrice}}", racerPrice);

    res.send(formHtml + resultHtmlWithPrice);
});

app.get('/', (req, res) => {
    res.send(formHtml);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
