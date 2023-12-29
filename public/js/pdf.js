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

var data = JSON.parse(sessionStorage.getItem('data')) || {};

for (var id in data) {
  if (data.hasOwnProperty(id)) {
    document.getElementById(id).textContent = data[id];
  }
}

function createIMG() {
  const targetContainer = document.getElementById('photo');
  const imageData = localStorage.getItem('imageData');

  if (targetContainer && imageData) {
    const imgElement = document.createElement('img');
    imgElement.src = imageData;
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';

    targetContainer.appendChild(imgElement);
  }
}

createIMG();


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

function onloadPhoto() {
  var photosContainer1 = document.getElementById('photos-container1');
  var photosContainer2 = document.getElementById('photos-container2');

  var image1Src = getImageFromLocalStorage('image1');
  var image2Src = getImageFromLocalStorage('image2');

  if (image1Src) appendImageToContainer(image1Src, photosContainer1);
  if (image2Src) appendImageToContainer(image2Src, photosContainer2);

};

function getImageFromLocalStorage(key) {
  return localStorage.getItem(key);
}

function appendImageToContainer(src, container) {
  var img = document.createElement('img');
  img.src = src;
  container.appendChild(img);
}

onloadPhoto()