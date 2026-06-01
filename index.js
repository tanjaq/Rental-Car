const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { price } = require("./rentalPrice");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const form = fs.readFileSync("form.html", "utf8");
const resultHtml = fs.readFileSync("result.html", "utf8");

app.get("/", (req, res) => {
    res.send(form);
});

app.post("/", (req, res) => {
    const result = price(
        "",
        "",
        new Date(req.body.pickupdate),
        new Date(req.body.dropoffdate),
        req.body.type,
        Number(req.body.age),
        Number(req.body.licenseYears)
    );

    res.send(resultHtml.replace("$0", result));
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));