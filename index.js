const express = require('express');
const bodyParser = require('body-parser');
const rental = require('./rentalPrice');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <h1>Car Rental Booking Form</h1>
    <form method="post" action="/">
      <label>
        Pickup location
        <input name="pickup" required>
      </label>
      <br>
      <label>
        Dropoff location
        <input name="dropoff" required>
      </label>
      <br>
      <label>
        Pickup date
        <input type="date" name="pickupdate" required>
      </label>
      <br>
      <label>
        Dropoff date
        <input type="date" name="dropoffdate" required>
      </label>
      <br>
      <label>
        Car type
        <select name="type">
          <option>Compact</option>
          <option>Electric</option>
          <option>Cabrio</option>
          <option>Racer</option>
        </select>
      </label>
      <br>
      <label>
        Driver age
        <input type="number" name="age" min="18" required>
      </label>
      <br>
      <label>
        License years
        <input type="number" name="licenseYears" min="0" step="0.1" required>
      </label>
      <br>
      <button type="submit">Search</button>
    </form>
  `);
});

app.post('/', (req, res) => {
  const result = rental.price(
    String(req.body.pickup),
    String(req.body.dropoff),
    req.body.pickupdate,
    req.body.dropoffdate,
    String(req.body.type),
    Number(req.body.age),
    Number(req.body.licenseYears),
  );

  res.send(`<h1>Rental price</h1><p>${result}</p><a href="/">Back</a>`);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
