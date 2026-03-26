const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const rental = require("./rentalPrice");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  const {
    pickup,
    dropoff,
    pickupdate,
    dropoffdate,
    type,
    age,
    licenseYears
  } = req.body;

  const result = rental.price(
    String(pickup),
    String(dropoff),
    String(pickupdate),
    String(dropoffdate),
    String(type),
    Number(age),
    Number(licenseYears)
  );

  res.redirect(`/result.html?result=${encodeURIComponent(result)}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

app.get("/result.html", (req, res) => {
  res.sendFile(path.join(__dirname, "result.html"));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${port}`);
});
