const express = require('express');
const bodyParser = require('body-parser');
const sanitize = require('sanitize-filename');
const { chromium } = require('playwright');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const heicConvert = require('heic-convert');
const fs = require('fs');
const fsExtra = require('fs-extra');

const app = express();
const port = 3050;
const globalData = {
  uploadedFiles: [],
};

// const corsOptions = {
//   origin: 'http://anketa.daniels-it.ru',
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

app.post('/log', (req, res) => {
  const data = req.body;

  // console.log('Received data:', data);

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

    for (const image of images) {
      const imagePath = image.path;
      const imageFileName = image.filename;

      if (path.extname(imageFileName).toLowerCase() === '.heic') {
        const jpegImageBuffer = await heicConvert({
          buffer: fs.readFileSync(imagePath),
          format: 'JPEG'
        });
        await fs.promises.writeFile(imagePath, jpegImageBuffer);
      }
    }

    globalData.uploadedFiles.push(...images);
    const imageUrls = images.map((image) => `/uploads/images/${userId}/${image.filename}`);
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
    // console.log('Image uploaded successfully. Image URLs:', imageUrlArray);


    // console.log('Before using uploadedFiles:', uploadedFiles);
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

    async function checkIfDataIsFilled(data) {
      const c11 = data['c-11'];
      const c12 = data['c-12'];
      const c13 = data['c-13'];
      const c14 = data['c-14'];
      const c15 = data['c-15'];
    
      const isAnyDataFilled = c11 !== '' && c11 !== '-' ||
                              c12 !== '' && c12 !== '-' ||
                              c13 !== '' && c13 !== '-' ||
                              c14 !== '' && c14 !== '-' ||
                              c15 !== '' && c15 !== '-';
    
      return isAnyDataFilled;
    }
    
    const isDataFilled = await page.evaluate(checkIfDataIsFilled, data);
    
    await page.evaluate((isVisible) => {
      const countryPassOneTable = document.getElementById('countryPassOne');
      const countryPassTwoTable = document.getElementById('countryPassTwo');
    
      if (isVisible) {
        countryPassOneTable.style.display = 'table';
        countryPassTwoTable.style.display = 'none';
      } else {
        countryPassOneTable.style.display = 'none';
        countryPassTwoTable.style.display = 'table';
      }
    }, isDataFilled);
    
    async function updateLabels(page, labelIds, data) {
      const partners = {
        'c-18': ['placeFrom'],
        'c-16': ['registration'],
        'c-6': ['num'],
        'c-7': ['serial'],
        'c-9': ['passDate'],
        'c-8': ['passWhere'],
        'c-30': ['birthday'],
        'c-31': ['place'],
        'c-23': ['mobile']
      };
    
      await page.evaluate(({ ids, data, partners }) => {
        const processedIds = new Set();
    
        function getDataForId(id, dataIndex) {
          const partnerIds = partners[id] || [];
          const partnerData = partnerIds.reduce((accumulatedData, partnerId) => {
            const partnerIndex = ids.indexOf(partnerId);
            const partnerValue = partnerIndex !== -1 ? data[partnerIndex] : '';
            return accumulatedData + ' ' + partnerValue;
          }, '');
    
          return partnerData.trim() || data[dataIndex];
        }
    
        ids.forEach((id, index) => {
          const label = document.getElementById(id);
    
          if (label && !processedIds.has(id)) {
            label.innerHTML = getDataForId(id, index);
    
            const partnerIds = partners[id] || [];
            partnerIds.forEach(partnerId => {
              const partnerLabel = document.getElementById(partnerId);
              if (partnerLabel) {
                const partnerData = getDataForId(partnerId, index);
                partnerLabel.innerHTML = partnerData;
                processedIds.add(partnerId);
              }
            });
    
            processedIds.add(id);
          }
        });
      }, { ids: labelIds, data, partners });
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

