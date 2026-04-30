const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const rental = require("./rentalPrice");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/pictures", express.static("images"));

const formHtml = fs.readFileSync("form.html", "utf8");
const resultHtml = fs.readFileSync("result.html", "utf8");

app.post("/", (req, res) => {
  const post = req.body;

  const commonData = [
    String(post.pickup),
    String(post.dropoff),
    new Date(post.pickupdate),
    new Date(post.dropoffdate)
  ];

  const compactPrice = rental.price(
    ...commonData,
    "Compact",
    Number(post.age),
    Number(post.licenseYears)
  );

  const electricPrice = rental.price(
    ...commonData,
    "Electric",
    Number(post.age),
    Number(post.licenseYears)
  );

  const cabrioPrice = rental.price(
    ...commonData,
    "Cabrio",
    Number(post.age),
    Number(post.licenseYears)
  );

  const racerPrice = rental.price(
    ...commonData,
    "Racer",
    Number(post.age),
    Number(post.licenseYears)
  );

  const result = resultHtml
    .replace("$compact", compactPrice)
    .replace("$electric", electricPrice)
    .replace("$cabrio", cabrioPrice)
    .replace("$racer", racerPrice);

  res.send(formHtml + result);
});

app.get("/", (req, res) => {
  res.send(formHtml);
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${port}`);
});
