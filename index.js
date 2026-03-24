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
const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .error-container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .error-message { color: #dc3545; font-size: 18px; margin-bottom: 20px; }
        .btn { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Error</h1>
        <div class="error-message">{{errorMessage}}</div>
        <a href="/" class="btn btn-primary">Back to Form</a>
    </div>
</body>
</html>
`;

app.post('/', (req, res) => {
    const post = req.body;
    
    const pickupDate = Date.parse(post.pickupdate);
    const dropoffDate = Date.parse(post.dropoffdate);
    
    if (isNaN(pickupDate) || isNaN(dropoffDate)) {
        const errorHtmlWithMsg = errorHtml.replace("{{errorMessage}}", "Invalid date format. Please check your dates.");
        return res.send(formHtml + errorHtmlWithMsg);
    }
    
    if (dropoffDate < pickupDate) {
        const errorHtmlWithMsg = errorHtml.replace("{{errorMessage}}", "Dropoff date must be after pickup date.");
        return res.send(formHtml + errorHtmlWithMsg);
    }
    
    const result = rental.price(
        String(post.pickup),
        String(post.dropoff),
        pickupDate,
        dropoffDate,
        String(post.type),
        Number(post.age),
        Number(post.licenseYears)
    );
    
    if (result.error) {
        const errorHtmlWithMsg = errorHtml.replace("{{errorMessage}}", result.error);
        return res.send(formHtml + errorHtmlWithMsg);
    }
    
    const days = Math.round((dropoffDate - pickupDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const resultHtmlWithPrice = resultHtml
        .replace("{{compactPrice}}", result.compactPrice)
        .replace("{{electricPrice}}", result.electricPrice)
        .replace("{{cabrioPrice}}", result.cabrioPrice)
        .replace("{{racerPrice}}", result.racerPrice)
        .replace("{{days}}", days);
    
    res.send(formHtml + resultHtmlWithPrice);
});

app.get('/', (req, res) => {
    res.send(formHtml);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});