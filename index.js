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

  const pickup = String(post.pickup);
  const dropoff = String(post.dropoff);
  const pickupDate = Date.parse(post.pickupdate);
  const dropoffDate = Date.parse(post.dropoffdate);
  const carType = String(post.type);
  const age = Number(post.age);
  const licenseYears = Number(post.licenseYears); // uus väli juhiloa kestus

  try {
    const result = rental.price(pickup, dropoff, pickupDate, dropoffDate, carType, age, licenseYears);

    res.send(formHtml + resultHtml.replaceAll('$0', result));
  } catch (err) {
    // Kui price() viskab errori (vanus/juhiluba)
    res.send(formHtml + resultHtml.replaceAll('$0', err.message));
  }
});

app.get('/', (req, res) => {
  res.send(formHtml);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});