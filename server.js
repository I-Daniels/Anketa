const express = require('express');
const bodyParser = require('body-parser');
const sanitize = require('sanitize-filename');
const { chromium } = require('playwright');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');

const app = express();
const port = 3050;
const globalData = {
  uploadedFiles: [], // Общая переменная для хранения данных об изображениях
};

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

app.post('/log', (req, res) => {
  const data = req.body;

  console.log('Received data:', data);

  res.status(200).send('Data received successfully');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.headers['userid'];
    const userFolderPath = `uploads/images/${userId}`;

    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    cb(null, userFolderPath);
  },
  filename: (req, file, cb) => {
    const userId = req.headers['userid'];
    cb(null, `${userId}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.post('/upload-image', upload.array('image', 3), async (req, res) => {
  const userId = req.headers['userid'];
  try {
    const images = req.files;
    if (!images) {
      return res.status(400).json({ error: 'No image provided' });
    }

    globalData.uploadedFiles.push(...images);
    console.log('Before using uploadedFiles:', globalData.uploadedFiles);
    const imageUrls = images.map((image) => `/uploads/images/${userId}_${image.originalname}`);
    res.status(200).json({ imageUrl: imageUrls });
  } catch (error) {
    console.error('Error processing image upload:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/submit', async (req, res) => {
  try {
    const userId = req.headers['userid'];
    const uploadedFiles = [...globalData.uploadedFiles]; 
    const {
      lastName,
      firstName,
      middleName,
      familyStatus,
      selectedLevel,
      moveChecked,
      selectedRadio,
      languageData,
      educationData,
      attestationData,
      qualificationData,
      studiesData,
      jobData,
      supervisorData,
      jobtitleData,
      relativesData,
      data,
    } = req.body;

    const imageUrlArray = globalData.uploadedFiles.map((image) => `/uploads/images/${userId}/${userId}_${image.originalname}`);
    console.log('Image uploaded successfully. Image URLs:', imageUrlArray);


    console.log('Before using uploadedFiles:', uploadedFiles);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(
      `http://localhost:3050/serverpagepdf.html?last=${encodeURIComponent(lastName)}` +
      `&middle=${encodeURIComponent(middleName)}` +
      `&first=${encodeURIComponent(firstName)}` +
      `&familyStatus=${encodeURIComponent(familyStatus)}` +
      `&moveCheckedValues=${encodeURIComponent(moveChecked)}` +
      `&selectedRadio=${encodeURIComponent(selectedRadio)}` +
      `&level=${encodeURIComponent(selectedLevel)}` +
      `&imageUrlArray=${encodeURIComponent(JSON.stringify(imageUrlArray))}`
    );

    const newHtmlContent = await page.content();
    await page.setContent(newHtmlContent);

    try {
      await page.type('#Family', encodeURIComponent(lastName));
      await page.type('#NameMiddleName', encodeURIComponent(`${firstName} ${middleName}`));
    } catch (error) {
      console.error('Error typing on the page:', error);
    }
    await page.type('#data', encodeURIComponent(selectedRadio));

    await page.type('#education', encodeURIComponent(moveChecked));
    await page.type('#skills', encodeURIComponent(selectedLevel));

    async function updateTable(page, tableId, tableData) {
      await page.evaluate(({ id, data }) => {
        const table = document.getElementById(id);

        data.forEach((row) => {
          const newRow = table.insertRow();

          Object.values(row).forEach((value) => {
            const cell = newRow.insertCell();
            const textNode = document.createTextNode(value);
            cell.appendChild(textNode);
          });
        });
      }, { id: tableId, data: tableData });
    }
    async function updateLabels(page, labelIds, data) {
      await page.evaluate(({ ids, data }) => {
        ids.forEach((id, index) => {
          const label = document.getElementById(id);
          if (label) {
            label.textContent = data[index];
          }
        });
      }, { ids: labelIds, data });
    }

    await updateTable(page, 'education-table', educationData);
    await updateTable(page, 'attestation-table', attestationData);
    await updateTable(page, 'qualification-table', qualificationData);
    await updateTable(page, 'studies-table', studiesData);
    await updateTable(page, 'job-table', jobData);
    await updateTable(page, 'supervisor-table', supervisorData);
    await updateTable(page, 'jobtitle-table', jobtitleData);
    await updateTable(page, 'relatives-table', relativesData);
    await updateTable(page, 'language-table', languageData);
    const labelIds = Object.keys(data);
    await updateLabels(page, labelIds, Object.values(data));
    await page.waitForTimeout(2000);

    const pdfBuffer = await page.pdf({
      margin: { top: 50, bottom: 50 },
    });

    const sanitizedFilename = sanitize(`${encodeURIComponent(lastName)}.pdf`);
    const encodedFilename = encodeURIComponent(sanitizedFilename);

    await browser.close();
    
    await Promise.all(globalData.uploadedFiles.map(async (image) => {
      const imagePath = path.join(__dirname, `/uploads/images/${userId}/${userId}_${image.originalname}`);
      await fs.promises.unlink(imagePath);
    }));

    const userFolderPath = path.join(__dirname, `/uploads/images/${userId}`);
    await fsExtra.remove(userFolderPath);
    globalData.uploadedFiles = [];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.on('error', (error) => {
  console.error('Server error:', error);
});

app.listen(port, () => console.log(`Сервер работает на порту ${port}`));

process.on('SIGINT', async () => {
  process.exit();
});

