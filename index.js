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
    try {
        const result = rental.calculatePrice(
            Date.parse(req.body.pickupdate),
            Date.parse(req.body.dropoffdate),
            req.body.type,
            Number(req.body.age),
            Number(req.body.licenseYears)
        );

        res.send(formHtml + resultHtml.replaceAll("$0", result));
    } catch (err) {
        res.send(formHtml + `<p style="color:red;">${err.message}</p>`);
    }
});

app.get("/", (req, res) => {
    res.send(formHtml);
});

app.listen(port);