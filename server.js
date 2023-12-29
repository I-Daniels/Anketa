const express = require('express');
const bodyParser = require('body-parser');
const sanitize = require('sanitize-filename');
const { chromium } = require('playwright');

const app = express();
const port = 3050;

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {
  try {
    const {
      lastName,
      firstName,
      middleName,
      familyStatus,
      moveCheckedValues,
      selectedLevel,
      moveChecked,
      selectedRadio,
      transferDataResult,
      languageData,
      educationData,
    } = req.body;

    console.log('Received data:', {
      lastName,
      firstName,
      middleName,
      familyStatus,
      moveCheckedValues,
      selectedLevel,
      moveChecked,
      selectedRadio,
      transferDataResult,
      languageData,
      educationData,
    });

    const encodedLastName = encodeURIComponent(lastName);
    const encodedFirstName = encodeURIComponent(firstName);
    const encodedMiddleName = encodeURIComponent(middleName);
    const encodedFamilyStatus = encodeURIComponent(familyStatus);
    const encodedMoveCheckedValues = encodeURIComponent(moveCheckedValues);
    const encodedSelectedRadio = encodeURIComponent(selectedRadio);

    const page = await browser.newPage();

    await page.goto(
      `http://localhost:3050/serverpagepdf.html?last=${encodedLastName}
      &first=${encodedFirstName}
      &middle=${encodedMiddleName}
      &familyStatus=${encodedFamilyStatus}
      &moveCheckedValues=${encodedMoveCheckedValues}
      &selectedRadio=${encodedSelectedRadio}`
    );

    await page.waitForTimeout(2000);

    const pdfBuffer = await page.pdf({
      margin: { top: 50, bottom: 50 },
    });

    const sanitizedFilename = sanitize(`${lastName}.pdf`);
    const encodedFilename = encodeURIComponent(sanitizedFilename);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.on('error', (error) => {
  console.error('Server error:', error);
});

app.listen(port, () => console.log(`Сервер работает на порту ${port}`));

let browser;
chromium.launch({ headless: true }).then((browserInstance) => {
  browser = browserInstance;
});

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit();
});
