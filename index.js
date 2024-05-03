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
    const formData = req.body;
    const carClass = formData.type;
    const rentalPrice = rental.calculateRentalPrice(
        formData.pickupdate,
        formData.dropoffdate,
        carClass,
        parseInt(formData.age),
        parseInt(formData.licenseYears) 
    );

    const script = `
        <script>
            document.querySelectorAll('.car-item').forEach(item => {
                item.style.display = 'none';
            });
            document.getElementById('${carClass.toLowerCase()}-result').style.display = 'block';
        </script>
    `;

    let resultHtmlWithPrice = resultHtml.replaceAll('$0', rentalPrice);

    
    resultHtmlWithPrice += script;

    res.send(formHtml + resultHtmlWithPrice);

});

app.get('/', (req, res) => {
    res.send(formHtml);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});