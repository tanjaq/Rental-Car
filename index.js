const express = require('express');
const rental = require('./rentalPrice');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/pictures', express.static('images'));

const formHtml = fs.readFileSync('form.html', 'utf8');
const resultHtml = fs.readFileSync('result.html', 'utf8');

app.post('/', (req, res) => {
  const { pickupdate, dropoffdate, type, age, licenseYearsHeld } = req.body;

  const result = rental.price({
    pickupDate: Date.parse(pickupdate),
    dropoffDate: Date.parse(dropoffdate),
    type: String(type),
    age: Number(age),
    licenseYearsHeld: Number(licenseYearsHeld),
  });

  res.send(formHtml + resultHtml.replaceAll('$0', result));
});

app.get('/', (req, res) => {
  res.send(formHtml);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});