var urlParams = new URLSearchParams(window.location.search);

var lastName = urlParams.get('last');
var firstName = urlParams.get('first');
var middleName = urlParams.get('middle');
var familyStatus = urlParams.get('familyStatus');
var selectedLevel = urlParams.get('level');
var valuesParam = urlParams.get('moveCheckedValues');
var selectedRadio = urlParams.get('selectedRadio');

document.getElementById('Family').textContent = lastName;
document.getElementById('NameMiddleName').textContent = firstName + ' ' + middleName;
document.getElementById('skills').textContent = selectedLevel;
document.getElementById('Fstatus').textContent = familyStatus;
document.getElementById('education').textContent = valuesParam;
document.getElementById('data').textContent = selectedRadio;

document.addEventListener('DOMContentLoaded', function () {
  var jsonData = localStorage.getItem('DataForm');
  var data = JSON.parse(jsonData);

  for (var key in data) {
    var element = document.getElementById(key);
    if (element) {
      element.value = data[key];
    }
  }
});

function logToServer(data) {
  fetch('http://localhost:3050/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

const imageUrlsParam = new URLSearchParams(window.location.search).getAll('imageUrlArray');
const imageUrlArray = JSON.parse(decodeURIComponent(imageUrlsParam[0]));

function insertImagesIntoContainers() {
  imageUrlArray.forEach((imageUrl, index) => {
    const containerId = `photos-container${index + 1}`;
    const photosContainer = document.getElementById(containerId);

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.style.width = '100%';
    imgElement.style.height = 'auto';

    photosContainer.appendChild(imgElement);
  });
}

insertImagesIntoContainers();


function populateEducationData(tableId) {
  const educationData = JSON.parse(sessionStorage.getItem(`${tableId}Data`)) || [];
  const table = document.getElementById(tableId);

  if (table) {
    const tableBody = table.querySelector('tbody');

    educationData.forEach(function (data, index) {
      const row = tableBody.insertRow();

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const cell = row.insertCell();
          cell.innerHTML = `<label>${data[key]}</label>`;
        }
      }
    });
  }
}

populateEducationData('education-table');
populateEducationData('attestation-table');
populateEducationData('qualification-table');
populateEducationData('studies-table');
populateEducationData('job-table');
populateEducationData('supervisor-table');
populateEducationData('jobtitle-table');
populateEducationData('relatives-table');




function languageControl() {
  var jsonData = localStorage.getItem("formData");
  var languages = JSON.parse(jsonData);

  languages.forEach(function (data, index) {
    var newRow = document.createElement("tr");

    var languageCell = document.createElement("td");
    languageCell.innerText = data.language;

    var proficiencyCell = document.createElement("td");
    proficiencyCell.innerText = data.proficiency;

    newRow.appendChild(languageCell);
    newRow.appendChild(proficiencyCell);

    document.getElementById("language-table").appendChild(newRow);
  });
}

languageControl()


async function getEducationData() {
  try {
    const response = await fetch('http://localhost:3050/get-education-data');
    const data = await response.json();

    data.forEach(function (education) {
      const newRow = table.insertRow();
      Object.values(education).forEach(function (value) {
        const cell = newRow.insertCell();
        const text = document.createTextNode(value);
        cell.appendChild(text);
      });
    });
  } catch (error) {
    console.error(error);
  }
}
